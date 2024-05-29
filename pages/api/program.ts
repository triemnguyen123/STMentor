// // pages/api/programs.ts
// import { NextApiRequest, NextApiResponse } from 'next';
// import { getPrograms } from '@/lib/programService';

// const handler = async (req: NextApiRequest, res: NextApiResponse) => {
//   try {
//     const programs = await getPrograms();
//     res.status(200).json(programs);
//   } catch (error) {
//     console.error('Failed to fetch programs:', error);
//     res.status(500).json({ error: 'Failed to fetch programs' });
//   }
// };

// export default handler;
