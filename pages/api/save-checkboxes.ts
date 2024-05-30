import { getAuth } from '@clerk/nextjs/server';
import { MongoClient } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';

const uri = process.env.MONGODB_URI || '';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { checkedItems } = req.body;

        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const client = new MongoClient(uri);

        try {
            await client.connect();
            const database = client.db('CTDT_DB');
            const collection = database.collection('checkbox_states');

            await collection.updateOne(
                { userId: userId },
                { $set: { checkedItems: checkedItems } },
                { upsert: true }
            );

            res.status(200).json({ message: 'Checkbox state saved successfully' });
        } catch (error) {
            console.error('Error saving checkbox state:', error);
            res.status(500).json({ message: 'Error saving checkbox state' });
        } finally {
            await client.close();
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
