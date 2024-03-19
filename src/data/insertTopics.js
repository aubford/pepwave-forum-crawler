const fs = require('fs');
const { MongoClient } = require('mongodb');

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'pepwave';

// Collection Name
const collectionName = 'topics';

// JSON file path
const jsonFilePath = './topics.json';

async function insertTopics() {
  // Read the JSON file
  const jsonData = fs.readFileSync(jsonFilePath, 'utf8');
  const topics = JSON.parse(jsonData);

  // Create a new MongoClient
  const client = new MongoClient(url);

  try {
    // Connect to the MongoDB server
    await client.connect();
    console.log('Connected successfully to server');

    // Get the database and collection
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Insert the topics into the collection
    const result = await collection.insertMany(Object.values(topics));
    console.log(`Inserted ${result.insertedCount} documents into the collection`);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    // Close the MongoDB connection
    await client.close();
  }
}

insertTopics();