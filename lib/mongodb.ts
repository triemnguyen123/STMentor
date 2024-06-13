import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cachedClient: MongoClient | null = null;

async function connectMongo() {
  if (cachedClient) {
    return cachedClient;
  }

  try {
    const client = await MongoClient.connect(MONGODB_URI);
    cachedClient = client;
    return client;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

export default connectMongo;
