import dbConnect from '../src/config/db';
import { executeCode } from '../src/controllers/execute';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method Not Allowed' });
    return;
  }
  await dbConnect();
  try {
    await executeCode(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
} 