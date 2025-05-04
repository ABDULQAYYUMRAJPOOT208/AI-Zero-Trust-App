import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = req.body;
  await connectDB();
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return res.status(401).json({ success: false, message: 'Invalid credentials' });

  const secret = speakeasy.generateSecret({ name: `AIZeroTrustProject (${email})` });
  const qrCode = await qrcode.toDataURL(secret.otpauth_url!);

  return res.status(200).json({
    success: true,
    qrCode,
    secret: secret.base32,
  });
}
