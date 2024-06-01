import assert from "node:assert"
import { collectionForEach } from "../../mongo.js"

export const assertTopicsMigrationSuccess = async (newCollection, oldCollection) => {
  assert.equal(
    await oldCollection.countDocuments(),
    await newCollection.countDocuments(),
    "document count mismatch"
  )

  await collectionForEach(oldCollection, async oldDoc => {
    const newDoc = await newCollection.findOne({ _id: oldDoc.id })
    assert(newDoc, "new doc should exist")
    assert.notEqual(newDoc._id, oldDoc._id.toString(), "_id should not match old topic _id")
    assert.equal(newDoc.id, undefined, "id should be removed")
  })

  console.log("** Passed NewTopicsCollectionMigration integrity test **")
}

export const assertPostsHaveTopics = async (postsCollection, topicsCollection) => {
  await collectionForEach(postsCollection, async postDoc => {
    const newDoc = await topicsCollection.findOne({ _id: postDoc.topicId })
    assert(newDoc, `no topic found for post: ${postDoc._id} with topicId: ${postDoc.topicId}`)
  })

  console.log("** Passed PostsCollection integrity test **")
}

export const assertCollectionIsEmpty = async collection => assert((await collection.countDocuments()) === 0, "collection should be empty")