#!/usr/bin/env node

import { runMongoSession } from "../mongo.js"
import { assertPostsHaveTopics, assertTopicsMigrationSuccess } from "./assert.js"

const session = async db => {
  const newTopicsCollection = db.collection("topics")
  const oldTopicsCollection = db.collection("topicsOrigin")

  await assertTopicsMigrationSuccess(newTopicsCollection, oldTopicsCollection)
  await assertPostsHaveTopics(db.collection("posts"), newTopicsCollection)
}

runMongoSession(session).then(() => console.log("Done!"))
