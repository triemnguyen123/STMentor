import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            res.status(500).json({ message: 'Không tìm thấy URI của MongoDB' });
            return;
        }

        let client;

        try {
            client = await MongoClient.connect(uri);
            const db = client.db('CTDT_DB');
            const collection = db.collection('CTDT_CL');

            const programs = await collection.find({}).toArray();
            console.log('Programs from DB:', programs); 

            res.status(200).json(programs);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu từ cơ sở dữ liệu:', error);
            res.status(500).json({ message: 'Có lỗi xảy ra khi lấy dữ liệu từ cơ sở dữ liệu' });
        } finally {
            if (client) {
                client.close();
            }
        }
    } else {
        res.status(405).json({ message: 'Phương thức không được phép' });
    }
}
