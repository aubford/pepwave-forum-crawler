const main = async db => {
  const topicsCollection = db.collection("topics")
  const cursor = topicsCollection.find({})
  while (await cursor.hasNext()) {
    const doc = await cursor.next()

    await topicsCollection.updateOne(
      { _id: doc._id },
      {
        $set: { _id: doc.id },
        $unset: { id: "" },
      }
    )
  }
  while (await cursor.hasNext()) {
    const doc = await cursor.next()

    await topicsCollection.updateOne(
      { _id: doc._id },
      {
        $set: { _id: doc.id },
        $unset: { id: "" },
      }
    )
  }
}

runMongoSession(main).then(() => console.log("Done!"))
