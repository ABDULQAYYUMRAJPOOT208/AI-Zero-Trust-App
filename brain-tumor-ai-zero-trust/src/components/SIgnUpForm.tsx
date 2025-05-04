"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

const SignUpForm = () => {
  const [name, setName] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = form.email.value;
    const password = form.password.value;
  
    try {
      console.log("Sending data to backend sign-up: ", name, email, password);
      const res = await axios.post("/api/auth/sign-up", {
        name,
        email,
        password,
      });
  
      // Extract email and mfaSecret from backend response
      const { email: userEmail, mfaSecret } = res.data;
  
      alert("Signed up successfully. Proceed to MFA setup.");
  
      // Redirect to MFA setup with query params
      router.push(`/auth/setup-mfa?email=${encodeURIComponent(userEmail)}&mfaSecret=${encodeURIComponent(mfaSecret)}`);
    } catch (error: any) {
      const message = error.response?.data?.error || "Signup failed";
      alert(message);
    }
  };
  

  return (
    <div className="container">
      <div className="heading">Sign Up</div>
      <form className="form" onSubmit={handleSubmit}>
        <input required className="input" type="email" name="email" placeholder="E-mail" />
        <input required className="input" type="text" name="name" placeholder="Name" onChange={(e) => setName(e.target.value)} />
        <input required className="input" type="password" name="password" placeholder="Password" />
        <input className="login-button" type="submit" value="Sign Up" />
      </form>
      <div className="social-account-container">
        <span className="title">Or Sign in with</span>
        <div className="social-accounts">
          <button className="social-button google">Google</button>
          <button className="social-button apple">Apple</button>
        </div>
      </div>
      <span className="agreement">
        <Link href="/auth/sign-in">Already have an account: <span>Sign In</span></Link>
      </span>
    </div>
  );
};

export default SignUpForm;
