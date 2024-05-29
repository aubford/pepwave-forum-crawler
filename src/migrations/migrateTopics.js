import { collectionForEach, runMongoSession } from "../mongo.js"
import assert from "node:assert"

const assertNewCollectionIntegrity = async (newCollection, oldCollection) => {
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

  console.log("** Passed integrity tests **")
}

const main = async db => {
  const newTopicsCollection = db.collection("topics")
  await newTopicsCollection.deleteMany({})

  assert((await newTopicsCollection.countDocuments()) === 0, "collection should be empty")

  const oldTopicsCollection = await db.collection("topics-backup")
  await collectionForEach(oldTopicsCollection, async doc => {
    doc._id = doc.id
    delete doc.id

    await newTopicsCollection.insertOne(doc)
  })

  await assertNewCollectionIntegrity(newTopicsCollection, oldTopicsCollection)
}

runMongoSession(main).then(() => console.log("Done!"))