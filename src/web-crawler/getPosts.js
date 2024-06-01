import { pause } from "../util.js"
import { fetchJson } from "./util.js"
import { processPosts } from "./processPosts.js"
import { runMongoSession } from "../mongo.js"

const TOPICS_COLLECTION = "topics"
const POSTS_COLLECTION = "posts"

let count = 0
const fetchPostsForTopic = async (db, { id }) => {
  const res = await fetchJson(
    `https://forum.peplink.com/api/v1/post/${id}/reply?limit=1000&sort_by=createdAt&order_by=asc&replyNo=1`
  )
  const posts = res.data

  const processedPosts = processPosts(posts)
  if (processedPosts.length) {
    const { insertedCount } = await db.collection(POSTS_COLLECTION).insertMany(processedPosts)

    if (insertedCount === processedPosts.length) {
      const topicTextContent = posts[0].post.raw
      await db.collection(TOPICS_COLLECTION).updateOne({ id }, { $set: { topicTextContent } })
    }
  } else {
    await db
      .collection(TOPICS_COLLECTION)
      .updateOne({ id }, { $set: { topicTextContent: "NO POSTS FOUND", noPosts: true } })
  }
  console.log(`${++count}: topic ${id} -> ${processedPosts.length} posts`)
}

async function main(db) {
  const topicsCollection = db.collection(TOPICS_COLLECTION)
  // matches null or nonexistent
  const topicsCursor = topicsCollection.find(
    { topicTextContent: null },
    { noCursorTimeout: true }
  )

  for await (const topic of topicsCursor) {
    try {
      await fetchPostsForTopic(db, topic)
      await pause(count % 49 === 0 ? 30 * 1000 : 1100)
    } catch (err) {
      console.error(err)
      console.error("Failed for topic: ", topic)
      await pause(90 * 1000)
      await fetchPostsForTopic(db, topic).catch(err => {
        console.error("Failed second time for topic: ", topic)
        console.error("Error: ", err)
      })
    }
  }

  await topicsCursor.close()
}

runMongoSession(main).then(() => console.log("Posts done!"))
