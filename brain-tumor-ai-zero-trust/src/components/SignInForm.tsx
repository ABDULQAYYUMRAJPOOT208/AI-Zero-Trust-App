"use client";

import React from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const AuthForm = () => {
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = form.email.value;
    const password = form.password.value;
    const token = form.token.value; // MFA token

    try {
      console.log(
        "Sending data to backend sign-in like next-auth file: ",
        email,
        password
      );
      // Call the signIn function from next-auth
      debugger;
      const res = await signIn("credentials", {
        email,
        password,
        token, // Send MFA code here
        redirect: false,
      });

      if (res?.ok) {
        alert("Signed in successfully");
        router.push("/dashboard");
      } else {
        alert("Invalid credentials or user not found");
      }
    } catch (error) {
      console.error("Sign-in error", error);
      alert("Something went wrong");
    }
  };

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="container">
      <div className="heading">Sign In</div>
      <form className="form" onSubmit={handleSubmit}>
        <input
          required
          className="input"
          type="email"
          name="email"
          placeholder="E-mail"
        />
        <input
          required
          className="input"
          type="password"
          name="password"
          placeholder="Password"
        />
        <input
          required
          className="input"
          type="text"
          name="token"
          placeholder="MFA Token (from Authenticator App)"
        />

        <span className="forgot-password">
          <a href="#">Forgot Password?</a>
        </span>
        <input className="login-button" type="submit" value="Sign In" />
      </form>
      <div className="social-account-container">
        <span className="title">Or Sign in with</span>
        <div className="social-accounts">
          <button className="social-button google" onClick={handleGoogleLogin}>
            Google
          </button>
        </div>
      </div>
      <span className="agreement">
        <a href="/auth/sign-up">
          Don't have an account: <span>Sign Up</span>
        </a>
      </span>
    </div>
  );
};

export default AuthForm;
