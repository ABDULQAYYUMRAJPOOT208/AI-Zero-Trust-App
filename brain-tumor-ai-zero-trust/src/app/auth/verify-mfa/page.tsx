'use client';
import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

const VerifyMfa = () => {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const tempToken = searchParams.get('token');
  const { data: session, status } = useSession();
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const userEmail = session?.user?.email;

    if (!userEmail) {
      setError('User email not found in session.');
      return;
    }

    try {
      const response = await fetch('/api/verify-mfa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, tempToken, email: userEmail }),
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
  
  if (status === 'loading') return <div>Loading...</div>;

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
