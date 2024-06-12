import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      res.status(500).json({ message: 'Không tìm thấy URI của MongoDB' });
      return;
    }

    const userId = req.headers['user-id'];
    if (!userId) {
      res.status(400).json({ message: 'Thiếu userId' });
      return;
    }

    let client;

    try {
      client = await MongoClient.connect(uri);
      const db = client.db('HeKhuyenNghi');

      const query = { userId };

      const results = await db.collection('KhuyenNghi').find(query).toArray();

      if (!results || results.length === 0) {
        res.status(404).json({ message: 'Không tìm thấy dữ liệu phù hợp' });
        return;
      }

      const formattedResults = results.map(result => ({
        _id: result._id,
        name: result.name,
        score: result.score,
        semester: result.semester
      }));

      res.status(200).json(formattedResults);
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
