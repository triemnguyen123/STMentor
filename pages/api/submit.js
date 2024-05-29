import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      res.status(500).json({ message: 'Không tìm thấy URI của MongoDB' });
      return;
    }
    const userId = req.headers['user-id']; // Lấy userId từ header
    if (!userId) {
      res.status(400).json({ message: 'Thiếu userId' });
      return;
    }
    let client;

    try {
      client = await MongoClient.connect(uri);
      const db = client.db('HeKhuyenNghi');
      const newData = { ...req.body, userId }; // Gắn userId vào dữ liệu từ yêu cầu
      // Thêm trường selectedSemester vào dữ liệu
      newData.selectedSemester = req.body.selectedSemester;
  
      await db.collection('KhuyenNghi').insertOne(newData);
  
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