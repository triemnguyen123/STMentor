import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        res.status(500).json({ message: 'Không tìm thấy URI của MongoDB' });
        return;
    }

    let client;

    try {
        client = await MongoClient.connect(uri);
        const db = client.db('HeKhuyenNghi');
        const collection = db.collection('MonHoc');
      
        if (req.method === 'GET') {
            const subjects = await collection.find({}).toArray();
            console.log('Subjects from DB:', subjects); // Log để kiểm tra dữ liệu trước khi trả về
            res.status(200).json(subjects);
        } else {
            res.status(405).json({ message: 'Phương thức không được phép' });
        }
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu từ cơ sở dữ liệu:', error);
        res.status(500).json({ message: 'Có lỗi xảy ra khi lấy dữ liệu từ cơ sở dữ liệu' });
    } finally {
        if (client) {
            await client.close(); // Đóng kết nối MongoDB sau khi sử dụng
        }
    }
}
