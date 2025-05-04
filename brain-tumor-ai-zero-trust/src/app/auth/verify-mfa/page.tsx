import React, { useState } from 'react';
import { useRouter } from 'next/router';

const VerifyMfa = () => {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { token } = e.target as any;

    const tempToken = router.query.token as string;

    try {
      const response = await fetch('/api/verify-mfa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: token.value, tempToken }),
      });

      const data = await response.json();
      if (data.success) {
        router.push('/dashboard');
      } else {
        setError(data.message || 'Invalid MFA token');
      }
    } catch (err) {
      setError('Error verifying MFA');
    }
  };

  return (
    <div className="container">
      <div className="heading">Verify MFA</div>
      <form onSubmit={handleSubmit}>
        <input
          required
          className="input"
          type="text"
          name="token"
          placeholder="Enter MFA token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <input className="login-button" type="submit" value="Verify" />
      </form>
      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default VerifyMfa;
