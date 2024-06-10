// api/update-subject.ts
import { MongoClient, ObjectId } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';

const uri = process.env.MONGODB_URI || '';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { id, updatedSubject } = req.body;

        if (!id || !updatedSubject) {
            return res.status(400).json({ message: 'Subject ID and updatedSubject are required' });
        }

        const client = new MongoClient(uri);

        try {
            await client.connect();
            const database = client.db('HeKhuyenNghi'); 
            const collection = database.collection('KhuyenNghi');

            const result = await collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updatedSubject }
            );
            res.status(200).json(result);
        } catch (error) {
            console.error('Error updating subject:', error);
            res.status(500).json({ message: 'Error updating subject' });
        } finally {
            await client.close();
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
