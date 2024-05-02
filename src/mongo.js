import "dotenv/config"
import { MongoClient } from "mongodb"

const { DB_URL, DB_NAME } = process.env

export const runMongoSession = async sessionProcedure => {
  const client = new MongoClient(DB_URL)
  try {
    await client.connect()
    const db = client.db(DB_NAME)
    await sessionProcedure(db)
  } catch (err) {
    console.error("Error: ", err)
  } finally {
    if (client) {
      await client.close()
    }
  }
}
