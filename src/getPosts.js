const { fetchJson, pause } = require("./util")
const { MongoClient } = require("mongodb")
const { processPosts } = require("./processPosts")

global.TOPICS = "topics"
global.POSTS = "posts"
global.NO_POSTS = "NO POSTS"

const client = new MongoClient("mongodb://localhost:27017")
const db = client.db("pepwave")

let count = 0
const fetchPostsForTopic = async ({ id }) => {
  const res = await fetchJson(
    `https://forum.peplink.com/api/v1/post/${id}/reply?limit=1000&sort_by=createdAt&order_by=asc&replyNo=1`
  )
  const posts = res.data

  const processedPosts = processPosts(posts)
  if (processedPosts.length) {
    const { insertedCount } = await db.collection(POSTS).insertMany(processedPosts)

    if (insertedCount === processedPosts.length) {
      const topicTextContent = posts[0].post.raw
      await db.collection(TOPICS).updateOne({ id }, { $set: { topicTextContent } })
    }
  } else {
    await db
      .collection(TOPICS)
      .updateOne({ id }, { $set: { topicTextContent: NO_POSTS, noPosts: true } })
  }
  console.log(`${++count}: topic ${id} -> ${processedPosts.length} posts`)
}

async function fetchPosts(topicsCollection) {
  // matches null or nonexistent
  const topicsCursor = topicsCollection.find({ topicTextContent: null }, { noCursorTimeout: true })

  for await (const topic of topicsCursor) {
    try {
      await fetchPostsForTopic(topic)
      await pause(count % 49 === 0 ? 30 * 1000 : 1100)
    } catch (err) {
      console.error(err)
      console.error("Failed for topic: ", topic)
      await pause(90 * 1000)
      await fetchPostsForTopic(topic).catch(err => {
        console.error("Failed second time for topic: ", topic)
        console.error("Error: ", err)
      })
    }
  }
  
  await topicsCursor.close()
}

async function main() {
  try {
    await client.connect()
    await fetchPosts(db.collection(TOPICS))
    console.log("️!!!!!!!!!!!!!!!!!!!!!!!!!!Success!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
  } catch (err) {
    console.error("Error:", err)
  } finally {
    await client.close()
  }
}

main()
