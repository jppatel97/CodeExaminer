import dbConnect from '../src/config/db';
import User from '../src/models/User';
import PasswordReset from '../src/models/PasswordReset';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method Not Allowed' });
    return;
  }
  await dbConnect();
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ success: false, error: 'Token and password are required' });
    }
    const resetToken = await PasswordReset.findOne({ token, used: false, expiresAt: { $gt: new Date() } });
    if (!resetToken) {
      return res.status(400).json({ success: false, error: 'Invalid or expired reset token' });
    }
    const user = await User.findOne({ email: resetToken.email });
    if (!user) {
      return res.status(400).json({ success: false, error: 'User not found' });
    }
    user.password = password;
    await user.save();
    resetToken.used = true;
    await resetToken.save();
    res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
} 