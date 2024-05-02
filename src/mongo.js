import "dotenv/config"
import { MongoClient } from "mongodb"

export const runMongoSession = async sessionProcedure => {
  console.log(process.env.DB_URL, process.env.DB_NAME)
  const client = new MongoClient(process.env.DB_URL)
  try {
    await client.connect()
    const db = client.db(process.env.DB_NAME)
    await sessionProcedure(db)
  } catch (err) {
    console.error("Error: ", err)
  } finally {
    if (client) {
      await client.close()
    }
  }
}
