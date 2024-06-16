import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { data } = req.body;

    if (!data || !Array.isArray(data) || data.length === 0) {
      console.error('Dữ liệu không hợp lệ:', data);
      res.status(400).json({ message: 'Dữ liệu không hợp lệ' });
      return;
    }

    const filteredData = data.map(({ _id, ...rest }) => rest);

    let client;

    try {
      const uri = process.env.MONGODB_URI;
      if (!uri) {
        throw new Error('Không tìm thấy URI của MongoDB');
      }

      client = await MongoClient.connect(uri);
      const db = client.db('HeKhuyenNghi');

      console.log('Dữ liệu sẽ được lưu:', JSON.stringify(filteredData, null, 2));

      const result = await db.collection('KhuyenNghi').insertMany(filteredData);

      console.log('Kết quả của insertMany:', result);

      res.status(200).json({ message: 'Dữ liệu đã được lưu thành công' });
    } catch (error) {
      console.error('Lỗi khi lưu dữ liệu:', error);
      res.status(500).json({ message: 'Có lỗi xảy ra khi lưu dữ liệu' });
    } finally {
      if (client) {
        client.close();
      }
    }
  } else {
    res.status(405).json({ message: 'Phương thức không được phép' });
  }
}
