// src/app/api/auth/mfa/setup.ts
import { NextApiRequest, NextApiResponse } from 'next';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const secret = speakeasy.generateSecret({ name: `AIZeroTrustProject (${email})` });
  user.mfaSecret = secret.base32;
  user.mfaEnabled = true;
  await user.save();

  const qrCodeDataURL = await QRCode.toDataURL(secret.otpauth_url as string);
  res.status(200).json({ qrCodeDataURL });
}
