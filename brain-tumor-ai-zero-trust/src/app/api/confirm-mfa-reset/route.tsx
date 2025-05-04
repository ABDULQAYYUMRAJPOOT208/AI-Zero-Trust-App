import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import speakeasy from 'speakeasy';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, token, secret } = req.body;
  await connectDB();
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const verified = speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 1,
  });

  if (!verified) return res.status(401).json({ success: false, message: 'Invalid MFA token' });

  user.mfaEnabled = true;
  user.mfaSecret = secret;
  await user.save();

  return res.status(200).json({ success: true });
}
