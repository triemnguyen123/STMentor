import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
  if (req.method === 'GET') {
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

    const { selectedSemester } = req.query;

    let client;

    try {
      client = await MongoClient.connect(uri);
      const db = client.db('HeKhuyenNghi');

      // Truy vấn dữ liệu từ MongoDB với userId và selectedSemester tương ứng
      const query = { userId };
      if (selectedSemester) {
        query['subjects.semester'] = selectedSemester;
      }

      let results = await db.collection('KhuyenNghi').find(query).toArray();

      // Sắp xếp kết quả theo học kỳ
      results.forEach(result => {
        result.subjects.sort((a, b) => {
          const semesterA = a.semester || 'N/A';
          const semesterB = b.semester || 'N/A';
          return semesterA.localeCompare(semesterB, undefined, { numeric: true, sensitivity: 'base' });
        });

        // Cập nhật lại chỉ số STT của các môn học trong mỗi kết quả
        result.subjects.forEach((subject, index) => {
          subject.STT = index + 1;
        });
      });

      console.log('Results from DB:', results); // Log dữ liệu để kiểm tra
      res.status(200).json(results);
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
