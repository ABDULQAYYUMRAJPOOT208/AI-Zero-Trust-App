// pages/api/verify-mfa.ts
import { NextApiRequest, NextApiResponse } from "next";
import speakeasy from "speakeasy";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { email, token } = req.body;
  await connectDB();

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found" });

  const verified = speakeasy.totp.verify({
    secret: user.mfaSecret,
    encoding: "base32",
    token,
  });

  if (!verified) {
    return res.status(400).json({ success: false });
  }

  user.mfaEnabled = true;
  await user.save();

  return res.status(200).json({ success: true });
}
