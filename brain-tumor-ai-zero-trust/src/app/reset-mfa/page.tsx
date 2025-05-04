'use client';
import { useState } from 'react';

export default function ResetMfa() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [step, setStep] = useState(1);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleVerify = async (e: any) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/reset-mfa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (data.success) {
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setStep(2);
    } else {
      setError(data.message);
    }
  };

  const handleConfirm = async (e: any) => {
    e.preventDefault();
    const res = await fetch('/api/confirm-mfa-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token, secret }),
    });

    const data = await res.json();
    if (data.success) {
      setSuccess('MFA setup successfully reset.');
      setError('');
    } else {
      setError(data.message);
    }
  };

  return (
    <div className="container">
      <h2>Reset MFA</h2>
      {step === 1 && (
        <form onSubmit={handleVerify}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Verify</button>
        </form>
      )}

      {step === 2 && (
        <div>
          <p>Scan this QR Code in your Google Authenticator app:</p>
          <img src={qrCode} alt="MFA QR Code" />
          <form onSubmit={handleConfirm}>
            <input
              type="text"
              placeholder="Enter token from app"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
            <button type="submit">Confirm</button>
          </form>
        </div>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  );
}
