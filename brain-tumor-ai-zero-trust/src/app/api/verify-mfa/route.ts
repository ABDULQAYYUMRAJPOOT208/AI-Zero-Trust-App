// app/api/verify-mfa/route.ts
import { NextRequest, NextResponse } from "next/server";
import speakeasy from "speakeasy";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  console.log("POST request to /api/verify-mfa");
  console.log("Request body: ", req.body);
  const { email, token } = await req.json();
  await connectDB();

  const user = await User.findOne({ email });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const verified = speakeasy.totp.verify({
    secret: user.mfaSecret,
    encoding: "base32",
    token,
  });

  if (!verified) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  user.mfaEnabled = true;
  await user.save();

  return NextResponse.json({ success: true }, { status: 200 });
}
