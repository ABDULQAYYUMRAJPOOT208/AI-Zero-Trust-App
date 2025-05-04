import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { MongoClient } from "mongodb";
import speakeasy from "speakeasy";

const client = new MongoClient(process.env.MONGODB_URI as string);
const db = client.db("testZeroTrust");
const logsCollection = db.collection("authLogs");

export const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        token: { label: "MFA Token", type: "text", optional: true },
      },
      async authorize(credentials: any) {
        console.log("Inside the [...nextauth] \n Authorizing with credentials:", credentials);
        
        await connectDB();
        const user = await User.findOne({ email: credentials.email });
        if (!user) throw new Error("No user found");

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error("Invalid password");
        console.log("Password is valid, now checking MFA");
        if (user.mfaEnabled) {
          console.log("MFA is enabled, checking token");
          if (!credentials.token) throw new Error("MFA token is required");
          const tokenValidates = speakeasy.totp.verify({
            secret: user.mfaSecret,
            encoding: "base32",
            token: credentials.token,
            window:1,
          });
          if (!tokenValidates) throw new Error("Invalid MFA token");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/sign-in",
  },
  events: {
    async signIn({ user }) {
      console.log("User signed in: Now writing in logsCollection in database: ", user);
      await logsCollection.insertOne({
        event: "signIn",
        email: user.email,
        timestamp: new Date(),
      });
    },
    async signOut({ token }) {
      console.log("User signed Out: Now writing in logsCollection in database: ", token);

      await logsCollection.insertOne({
        event: "signOut",
        email: token.email,
        timestamp: new Date(),
      });
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 30,
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user }: any) {
      const dbUser = await User.findOne({ email: user.email });
      if (!dbUser) {
        console.log("User not found in database");
        return false; // User not found
      }
      console.log("User found in database: Now redirecting to verify mfa if enabled", dbUser);
      if (dbUser?.mfaEnabled) {
        console.log("MFA is enabled for this user");
        return "/auth/verify-mfa"; // Redirect to MFA page
      }
      return true;
    },
    async jwt({ token, user }) {
      
      if (user) {
        token.user = {
          id: user.id,
          email: user.email as string,
          role: user.role,
        };
      }
      console.log("JWT callback: ", token);
      return token;
    },
    async session({ session, token }) {
      console.log("session callback:", session, token);
      
      if (token?.user) {
        session.user = token.user;
      }
      console.log("session callback:", session, token);
      return session;
    },
  },
});

export { handler as GET, handler as POST };
