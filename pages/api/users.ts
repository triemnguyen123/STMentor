import { NextApiRequest, NextApiResponse } from 'next';
import { clerkClient } from '@clerk/nextjs/server';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const users = await clerkClient.users.getUserList();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export default handler;
