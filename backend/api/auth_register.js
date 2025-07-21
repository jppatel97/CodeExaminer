import dbConnect from '../src/config/db';
import User from '../src/models/User';
import { sendWelcomeEmail } from '../src/utils/emailService';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method Not Allowed' });
    return;
  }

  await dbConnect();

  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide name, email and password' });
    }
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }
    if (role === 'teacher' && !password.startsWith('PDPU')) {
      return res.status(400).json({ success: false, error: 'Teacher password must start with "PDPU"' });
    }
    user = await User.create({ name, email, password, role: role || 'student' });
    try { await sendWelcomeEmail(email, name); } catch (e) {}
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
} 