import connectMongo from '../../db';
import Subject from '../../models/Subject';

export default async function handler(req, res) {
  await connectMongo();

  if (req.method === 'GET') {
    try {
      const subjects = await Subject.find({});
      res.status(200).json(subjects);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch subjects' });
    }
  } else if (req.method === 'POST') {
    try {
      const { subjects } = req.body;
      const newSubjects = await Subject.insertMany(subjects);
      res.status(201).json(newSubjects);
    } catch (error) {
      res.status(500).json({ error: 'Failed to save subjects' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
