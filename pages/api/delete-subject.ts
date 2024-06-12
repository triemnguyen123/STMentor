import { MongoClient, ObjectId } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';

const uri = process.env.MONGODB_URI || '';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { id } = req.query;
    if (typeof id !== 'string' || !ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid Subject ID' });
    }
    
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const database = client.db('HeKhuyenNghi');
        const collection = database.collection('KhuyenNghi');

        const result = await collection.deleteOne({ _id: new ObjectId(id as string) }); // Ép kiểu id thành string
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        return res.status(200).json({ message: 'Subject deleted successfully' });
    } catch (error) {
        console.error('Error deleting subject:', error);
        return res.status(500).json({ message: 'Error deleting subject', error });
    } finally {
        await client.close();
    }
}
