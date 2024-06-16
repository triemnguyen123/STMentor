// api/programs.js
import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        res.status(500).json({ message: 'Không tìm thấy URI của MongoDB' });
        return;
    }

    let client;

    try {
        client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        const db = client.db('CTDT_DB');
        const collection = db.collection('CTDT_CL');

        if (req.method === 'GET') {
            const { course } = req.query;  // Lấy query parameter 'course'
            const query = course ? { khoa: course } : {};  // Tạo query object, nếu course có giá trị thì lọc theo course
            const programs = await collection.find(query).toArray();
            console.log('Programs from DB:', programs); // Log để kiểm tra dữ liệu trước khi trả về
            res.status(200).json(programs);
        } else {
            res.status(405).json({ message: 'Phương thức không được phép' });
        }
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu từ cơ sở dữ liệu:', error);
        res.status(500).json({ message: 'Có lỗi xảy ra khi lấy dữ liệu từ cơ sở dữ liệu' });
    } finally {
        if (client) {
            await client.close();
        }
    }
}
