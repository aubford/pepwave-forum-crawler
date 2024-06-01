import "dotenv/config"
import { pause } from "../util.js"
import { size } from "lodash-es"
import { runMongoSession } from "../mongo.js"
import fs from "fs"

const categories = fs.readFileSync("src/web-crawler/categories.json")

const processTopic = topic => {
  try {
    const {
      _id,
      tags,
      title,
      search_product,
      category: { name: categoryName, _id: categoryId },
      creator: {
        primaryGroup,
        roles,
        suspended_till,
        deleted,
        avatar,
        _id: creatorId,
        ...creator
      },
      slug,
      createdAt,
      lastModified,
      pinnedLocally,
      pinnedGlobally,
      views: numberOfViews,
      noFlags: numberOfFlags,
      noLikes: numberOfLikes,
      noBookmarks: numberOfBookmarks,
      summary,
    } = topic

    return {
      _id,
      tags,
      title,
      slug,
      product: search_product?.product,
      categoryName,
      categoryId,
      creator: {
        ...creator,
        id: creatorId,
      },
      createdAt,
      lastModified,
      pinnedLocally,
      pinnedGlobally,
      numberOfViews,
      numberOfFlags,
      numberOfLikes,
      numberOfBookmarks,
      summary,
    }
  } catch (error) {
    console.warn("❌ Topic error: ", error)
    console.warn("❌ Topic: ", topic)
    return {
      _id: topic._id,
      title: topic.title,
      error,
    }
  }
}

/**
 * clean data by removing deleted/flagged/ect topics
 * @param {Array<Object>} topics
 * @returns {*}
 */
const cleanTopics = topics => {
  return topics.reduce(
    (acc, { unlisted, hidden, deleted, flagged, creator: { suspended_till }, ...topic }) => {
      if (unlisted || hidden || deleted || flagged || suspended_till) {
        return acc
      }
      return [...acc, processTopic(topic)]
    },
    []
  )
}

const fetchTopicsForCategory = async (id, page = 1) => {
  const res = await fetch(
    `https://forum.peplink.com/api/v1/post?sort_by=lastModified&order_by=desc&page=${page}&limit=100&category=${id}`
  )
  const json = await res.json()

  const { data, next_page } = json

  console.log("✅ Fetched page " + page)

  if (next_page < 3) {
    await pause(500)
    const res = await fetchTopicsForCategory(id, next_page)
    return data.concat(res)
  }

  return data
}

const insertTopics = async (db, topics) => {
  const collection = db.collection("topics")

  const result = await collection.insertMany(topics)
  console.log(
    `Inserted ${result.insertedCount} of ${size(topics)} documents into the collection`
  )
}

async function main(db) {
  const topics = []
  for (const category of categories) {
    const categoryTopics = await fetchTopicsForCategory(category.id)
    topics.push(categoryTopics.map(cleanTopics))
  }

  await insertTopics(
    db,
    topics.flatMap(x => x)
  )
}

runMongoSession(main).then(() => console.log("Topics Done!"))
