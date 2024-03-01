const categories = require("./data/categories.json")
const { pause } = require("../util")
const fs = require("fs")

const prepTopicData = topic => {
  try {
    const {
      _id: id,
      tags,
      title,
      search_product,
      category: { name: categoryName, _id: categoryId },
      creator: { primaryGroup, roles, suspended_till, deleted, avatar, _id: creatorId, ...creator },
      views,
      createdAt,
      lastModified,
      pinnedLocally,
      pinnedGlobally,
      noFlags: numberOfFlags,
      noLikes: numberOfLikes,
      noBookmarks: numberOfBookmarks,
      summary,
    } = topic

    return {
      id,
      tags,
      title,
      product: search_product?.product,
      categoryName,
      categoryId,
      creator: {
        ...creator,
        id: creatorId,
      },
      views,
      createdAt,
      lastModified,
      pinnedLocally,
      pinnedGlobally,
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
    topics.push(categoryTopics.map(prepTopicData))
  }
  return topics.flatMap(x => x)
}

main().then(res => fs.writeFileSync("data/topics.json", JSON.stringify(res, null, 2)))
