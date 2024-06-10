import { MongoClient, ObjectId } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';

const uri = process.env.MONGODB_URI || '';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'DELETE') {
        const { id } = req.query;

        if (!id || typeof id !== 'string' || !isValidObjectId(id)) {
            return res.status(400).json({ message: 'Subject ID is required and must be a valid 24 character hex string' });
        }

        const client = new MongoClient(uri);

        try {
            await client.connect();
            const database = client.db('HekhuyenNghi');
            const collection = database.collection('KhuyenNghi');

            const result = await collection.deleteOne({ _id: new ObjectId(id) });
            if (result.deletedCount === 0) {
                throw new Error('Subject not found or could not be deleted');
            }
            res.status(200).json({ message: 'Subject deleted successfully' });
        } catch (error: any) {
            console.error('Error deleting subject:', error.message);
            res.status(500).json({ message: 'Error deleting subject' });
        } finally {
            await client.close();
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}

function isValidObjectId(id: string) {
    return /^[0-9a-fA-F]{24}$/.test(id);
}
