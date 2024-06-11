import { NextApiRequest, NextApiResponse } from 'next';
import connectMongo from '../../lib/mongodb';
import Subject from '../../models/Subject';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'Subject ID is required' });
  }

  try {
    // Kết nối đến MongoDB
    await connectMongo();

    console.log(`Attempting to delete subject with ID ${id}`);

    // Xóa môn học
    const result = await Subject.deleteOne({ _id: id });

    if (!result) {
      console.log(`Subject with ID ${id} not found`);
      return res.status(404).json({ message: 'Subject not found' });
    }

    console.log(`Subject with ID ${id} deleted successfully`);

    return res.status(200).json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Error deleting subject:', error);
    return res.status(500).json({ message: 'Error deleting subject', error });
  }
}
