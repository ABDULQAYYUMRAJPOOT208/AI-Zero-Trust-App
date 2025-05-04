import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse, NextRequest } from 'next/server';
import speakeasy from "speakeasy";


export async function POST(req: NextRequest) {
  console.log("Sign Up hitted...");
  const { email, password, name } = await req.json(); // Use req.json() to parse the request body
  console.log("Recieved data in sign-up: ", name, email, password);

  if (req.method !== 'POST') {
    return new NextResponse(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!email || !password || !name) {
    return new NextResponse(JSON.stringify({ error: 'All fields required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  await dbConnect();
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return new NextResponse(JSON.stringify({ error: 'User already exists' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const secret = speakeasy.generateSecret({ length: 20 });
  const newUser = new User({
    email,
    password: hashedPassword,
    name,
    role: 'user',
    mfaEnabled: true,
    mfaSecret: secret.base32, // Store the base32 secret for MFA
  });
  await newUser.save();

  return new NextResponse(JSON.stringify({
    message: 'User created',
    email,
    mfaSecret: secret.base32, // include secret in response
  }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
  
}