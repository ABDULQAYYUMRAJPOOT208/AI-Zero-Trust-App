import jwt, { Secret, SignOptions } from 'jsonwebtoken';

const JWT_SECRET: Secret = process.env.JWT_SECRET!;

export const generateToken = (payload: object, expiresIn: string = '15m') => {
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, JWT_SECRET, options);
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET as Secret); // Explicitly cast for verify as well
  } catch {
    return null;
  }
};