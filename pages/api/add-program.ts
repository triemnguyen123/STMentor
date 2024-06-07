// api/add-program.ts
import { MongoClient } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';

const uri = process.env.MONGODB_URI || '';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { program } = req.body;

        if (!program) {
            return res.status(400).json({ message: 'Program is required' });
        }

        const client = new MongoClient(uri);

        try {
            await client.connect();
            const database = client.db('CTDT_DB');
            const collection = database.collection('CTDT_CL');

            const result = await collection.insertOne(program);
            res.status(200).json(result);
        } catch (error) {
            console.error('Error adding program:', error);
            res.status(500).json({ message: 'Error adding program' });
        } finally {
            await client.close();
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
