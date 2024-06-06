import "../../config.js"
import { Db, Collection, MongoClient } from "mongodb"

/**
 * @param {MongoClient} client
 * @param {string} dbName
 * @returns {Promise<void>}
 */
const validateDatabaseExists = async (client, dbName) => {
  const admin = client.db().admin()
  const { databases } = await admin.listDatabases()
  const dbNames = databases.map(db => db.name)

  if (!dbNames.includes(dbName)) {
    throw new Error(`Database ${dbName} does not exist`)
  }
}

/**
 * @param {MongoClient} client
 * @param {string} dbName
 * @returns {Promise<*>}
 */
const connectToExistingDb = async (client, dbName) => {
  await validateDatabaseExists(client, dbName)
  return client.db(dbName)
}

/**
 * @param {(Db) => Promise<void>} session
 * @returns {Promise<void>}
 */
export const runMongoSession = async session => {
  const client = new MongoClient(process.env.DB_URL)
  try {
    await client.connect()
    const db = await connectToExistingDb(client, process.env.DB_NAME)
    await session(db)
  } catch (err) {
    console.error("Error: ", err)
  } finally {
    if (client) {
      await client.close()
    }
  }
}

/**
 * @param {Collection} collection
 * @param {(Object) => Promise<void>} callback
 * @returns {Promise<void>}
 */
export const collectionForEach = async (collection, callback) => {
  const cursor = await collection.find({})
  while (await cursor.hasNext()) {
    const doc = await cursor.next()
    await callback(doc)
  }
}

console.log(process.env.DB_URL)