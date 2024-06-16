// import { NextApiRequest, NextApiResponse } from 'next';
// import { MongoClient } from 'mongodb';

// const uri = process.env.MONGODB_URI || '';
// const client = new MongoClient(uri);

// const fetchCourses = async (req: NextApiRequest, res: NextApiResponse) => {
//     if (req.method === 'GET') {
//         try {
//             await client.connect();
//             const collection = client.db('CTDT_DB').collection('CTDT_CL');
//             const courses = await collection.distinct('khoa');
            
//             console.log('Fetched courses:', courses); // Debugging line
//             res.status(200).json(courses);
//         } catch (error) {
//             console.error('Error fetching courses:', error);
//             res.status(500).json({ message: 'Failed to fetch courses' });
//         } finally {
//             await client.close();
//         }
//     } else {
//         res.status(405).json({ message: 'Method not allowed' });
//     }
// };

// export default fetchCourses;
