// pages/api/programs.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const client = new MongoClient(process.env.MONGODB_URI ?? 'default-uri');
    await client.connect();
    const db = client.db();
    const collection = db.collection('programs');
    
    const programs = await collection.find({}).toArray();
    await client.close();
    
    res.status(200).json(programs);
}
