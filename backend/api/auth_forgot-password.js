import dbConnect from '../src/config/db';
import User from '../src/models/User';
import PasswordReset from '../src/models/PasswordReset';
import { sendPasswordResetEmail } from '../src/utils/emailService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method Not Allowed' });
    return;
  }
  await dbConnect();
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Please provide email address' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, error: 'You are not a registered user' });
    }
    const token = PasswordReset.generateToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await PasswordReset.create({ email, token, expiresAt });
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
    const emailSent = await sendPasswordResetEmail(email, resetUrl);
    if (emailSent) {
      res.status(200).json({ success: true, message: 'Reset link sent to your email.' });
    } else {
      res.status(500).json({ success: false, error: 'Failed to send reset email. Please try again later.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
} 