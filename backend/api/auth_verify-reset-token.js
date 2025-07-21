import dbConnect from '../src/config/db';
import PasswordReset from '../src/models/PasswordReset';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method Not Allowed' });
    return;
  }
  await dbConnect();
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, error: 'Token is required' });
    }
    const resetToken = await PasswordReset.findOne({ token, used: false, expiresAt: { $gt: new Date() } });
    if (!resetToken) {
      return res.status(400).json({ success: false, error: 'Invalid or expired reset token' });
    }
    res.status(200).json({ success: true, message: 'Token is valid' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
} 