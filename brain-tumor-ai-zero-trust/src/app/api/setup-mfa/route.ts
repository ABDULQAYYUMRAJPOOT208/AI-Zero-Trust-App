import { NextApiRequest, NextApiResponse } from 'next';
import { authenticator } from 'otplib'; // Correct import
import { getSession } from 'next-auth/react';

const verifyMfa = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });
  if (!session?.user) { // Ensure session and user exist
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { token, tempToken } = req.body;

  if (!token || !tempToken) {
    return res.status(400).json({ message: "Token or TempToken missing" });
  }

  // Retrieve the user's MFA secret from the session
  const userMfaSecret = session.user.mfaSecret;

  if (!userMfaSecret) {
    return res.status(400).json({ message: "MFA secret not found for this user" });
  }

  // Verify the TOTP token using the user's MFA secret
  const isValid = authenticator.check(token, userMfaSecret);

  if (isValid) {
    // If valid, mark the user as authenticated and return session or JWT token
    res.status(200).json({ message: "MFA Verified", success: true });
  } else {
    res.status(400).json({ message: "Invalid MFA token" });
  }
};

export default verifyMfa;