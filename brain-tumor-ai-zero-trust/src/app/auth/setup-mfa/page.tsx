"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation"; // Import useSearchParams

const SetupMFA = () => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  // Use useSearchParams to get query parameters
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const mfaSecret = searchParams.get("mfaSecret");

  useEffect(() => {
    // Ensure both email and mfaSecret are available
    if (email && mfaSecret) {
      const generateQRCode = async () => {
        const otpAuthUrl = `otpauth://totp/AIZeroTrustProject:${email}?secret=${mfaSecret}&issuer=AIZeroTrustProject`;
        const qrData = await QRCode.toDataURL(otpAuthUrl);
        setQrCodeDataUrl(qrData);
      };
      generateQRCode();
    }
  }, [email, mfaSecret]); // Depend on email and mfaSecret

  const handleVerifyToken = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/verify-mfa", {
        email,
        token,
      });

      if (res.data.success) {
        alert("MFA setup complete!");
        router.push("/auth/sign-in");
      } else {
        setError("Invalid token. Try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Verification failed.");
    }
  };

  return (
    <div>
      <h2>Setup MFA</h2>
      <p>Scan this QR code in Google Authenticator:</p>
      {qrCodeDataUrl && <img src={qrCodeDataUrl} alt="MFA QR Code" />}
      <form onSubmit={handleVerifyToken}>
        <label>Enter the 6-digit code:</label>
        <input
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          required
          maxLength={6}
        />
        <button type="submit">Verify</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default SetupMFA;
