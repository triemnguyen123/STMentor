import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';
import formidable, { Fields, Files, File } from 'formidable';
import fs from 'fs';
import csv from 'csv-parser';

const uri = process.env.MONGODB_URI || '';
const client = new MongoClient(uri);

export const config = {
  api: {
    bodyParser: false,
  },
};

const importCSV = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const form = formidable();

    form.parse(req, async (err: any, fields: Fields, files: Files) => {
      if (err) {
        res.status(500).json({ message: 'Error parsing the file' });
        return;
      }

      const fileArray: File[] = Array.isArray(files.file) && files.file ? files.file as File[] : [];
      if (fileArray.length === 0 || !fileArray[0]?.filepath) {
        res.status(400).json({ message: 'No file uploaded' });
        return;
      }

      const filePath = fileArray[0].filepath;
      const collectionName = Array.isArray(fields.collectionName) ? fields.collectionName[0] : fields.collectionName || 'CTDT_CL'; // default to k26 if not specified

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', async (data) => {
          try {
            await client.db('CTDT_DB').collection(collectionName).insertOne(data);
          } catch (err) {
            console.error('Error inserting data:', err);
          }
        })
        .on('end', () => {
          fs.unlinkSync(filePath); // Delete the file after processing
          res.status(200).json({ message: 'CSV data imported successfully' });
        });
    });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};

export default importCSV;
