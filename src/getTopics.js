const categories = require("./data/categories.json")
const { pause } = require("./util")
const fs = require("fs")
const {keyBy} = require('lodash/collection')

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
      title: topic.title,
      id: topic._id,
      error,
    }
  }
}

const filterProcessTopics = topics => {
  return topics.reduce(
    (acc, { unlisted, hidden, deleted, flagged, creator: { suspended_till }, ...post }) => {
      if (unlisted || hidden || deleted || flagged || suspended_till) {
        return acc
      }
      return [...acc, processTopic(post)]
    },
    []
  )
}

const fetchCategory = async (id, page = 1) => {
  const res = await fetch(
    `https://forum.peplink.com/api/v1/post?sort_by=lastModified&order_by=desc&page=${page}&limit=100&category=${id}`
  )
  const json = await res.json()

  const { data, next_page } = json

  console.log("✅ Fetched page " + page)

  if (next_page) {
    await pause(500)
    const res = await fetchCategory(id, next_page)
    return data.concat(res)
  }

  return data
}

async function main() {
  const topics = []
  for (const cat of categories) {
    const categoryTopics = await fetchCategory(cat.id)
    topics.push(categoryTopics.map(filterProcessTopics))
  }
  return keyBy(topics.flatMap(x => x), 'id')
}

main().then(res => fs.writeFileSync("data/topics.json", JSON.stringify(res, null, 2)))
