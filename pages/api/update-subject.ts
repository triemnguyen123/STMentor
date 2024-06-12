import { MongoClient, ObjectId } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';

const uri = process.env.MONGODB_URI || '';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
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

        const updatedSubject = req.body;

        // Kiểm tra xem dữ liệu môn học được gửi lên từ client-side có hợp lệ không
        if (!updatedSubject) {
            return res.status(400).json({ message: 'Updated subject data is missing' });
        }

        // Cập nhật dữ liệu
        const result = await collection.updateOne(
            { _id: new ObjectId(id) }, // Tìm kiếm bằng id
            { $set: updatedSubject } // Cập nhật dữ liệu
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        // Truy vấn lại dữ liệu đã được cập nhật
        const updatedResult = await collection.findOne({ _id: new ObjectId(id) });

        if (!updatedResult) {
            return res.status(404).json({ message: 'Updated subject not found' });
        }

        return res.status(200).json({ message: 'Subject updated successfully', updatedResult });
    } catch (error) {
        console.error('Error updating subject:', error);
        return res.status(500).json({ message: 'Error updating subject', error });
    } finally {
        await client.close();
    }
}
