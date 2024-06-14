// // pages/api/import-csv.ts
// import { NextApiRequest, NextApiResponse } from 'next';
// import multer from 'multer';
// import nextConnect from 'next-connect';
// import csv from 'csv-parser';
// import { MongoClient } from 'mongodb';
// import streamifier from 'streamifier';

// const upload = multer({ storage: multer.memoryStorage() });

// const apiRoute = nextConnect({
//   onError(error: unknown, req: NextApiRequest, res: NextApiResponse) {
//     console.log('Error occurred:', error);
//     res.status(501).json({ error: `Sorry something Happened! ${error.message}` });
//   },
//   onNoMatch(req, res) {
//     res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
//   },
// });

// apiRoute.use(upload.single('file'));

// apiRoute.post(async (req: NextApiRequest, res: NextApiResponse) => {
//   console.log('Post request received');
//   const client = new MongoClient(process.env.MONGODB_URI);
//   await client.connect();
//   const db = client.db();
//   const collection = db.collection('programs');
  
//   const results: any[] = [];
//   const buffer = req.file.buffer;

//   console.log('Buffer obtained:', buffer);
  
//   streamifier.createReadStream(buffer)
//     .pipe(csv())
//     .on('data', (data) => {
//       console.log('Data parsed:', data);
//       results.push(data);
//     })
//     .on('end', async () => {
//       console.log('Stream ended');
//       try {
//         await collection.insertMany(results);
//         res.status(200).json({ message: 'CSV data imported successfully' });
//       } catch (error) {
//         console.error('Failed to import data:', error);
//         res.status(500).json({ error: `Failed to import data: ${error.message}` });
//       } finally {
//         await client.close();
//       }
//     });
// });

// export default apiRoute;

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };
