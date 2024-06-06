import { collectionForEach, runMongoSession } from "../mongo.js"
import { assertTopicsMigrationSuccess, assertCollectionIsEmpty } from "../test/assert.js"

const session = async db => {
  const newTopicsCollection = db.collection("topics")
  await newTopicsCollection.deleteMany({})

  await assertCollectionIsEmpty(newTopicsCollection)

  const oldTopicsCollection = db.collection("topicsOrigin")
  await collectionForEach(oldTopicsCollection, async doc => {
    doc._id = doc.id
    delete doc.id

    await newTopicsCollection.insertOne(doc)
  })

  await assertTopicsMigrationSuccess(newTopicsCollection, oldTopicsCollection)
}

runMongoSession(session).then(() => console.log("Done!"))
