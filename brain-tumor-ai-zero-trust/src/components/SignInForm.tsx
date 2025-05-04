'use client'
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
      const res = await signIn("credentials", {
        email,
        password,
        token,
        redirect: false,
      });

      if (!res?.ok) {
        if (res?.url) {
          // Redirect to MFA page if MFA is required
          router.push(res.url); 
        } else {
          alert("Invalid credentials or user not found");
        }
      } else {
        router.push("/dashboard"); // Redirect to dashboard if sign-in successful
      }
    } catch (error) {
      console.error("Sign-in error", error);
      alert("Something went wrong");
    }
  };


  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
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
