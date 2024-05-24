import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const data = req.body;

    console.log('Dữ liệu nhận được:', data);

    const uri = process.env.MONGODB_URI;
    if (!uri) {
      res.status(500).json({ message: 'Không tìm thấy URI của MongoDB' });
      return;
    }

    let client;

    try {
      client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
      const db = client.db('HeKhuyenNghi');
  
      await db.collection('KhuyenNghi').insertOne(data);
  
      res.status(200).json({ message: 'Dữ liệu đã được chèn thành công' });
    } catch (error) {
      console.error('Lỗi khi chèn dữ liệu vào cơ sở dữ liệu:', error);
      res.status(500).json({ message: 'Có lỗi xảy ra khi chèn dữ liệu vào cơ sở dữ liệu' });
    } finally {
      if (client) {
        client.close();
      }
    }
  } else {
    res.status(405).json({ message: 'Phương thức không được phép' });
  }
}