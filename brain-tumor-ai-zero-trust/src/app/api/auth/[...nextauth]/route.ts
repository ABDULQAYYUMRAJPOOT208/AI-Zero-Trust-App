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
        await connectDB();
        const user = await User.findOne({ email: credentials.email });
        if (!user) {
          console.log("User not found");
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          console.log("Invalid password");
          return null;
        }

        if (user.mfaEnabled && !credentials.token) {
          console.log("MFA token required");
          return null;
        }

        if (user.mfaEnabled) {
          const tokenValidates = speakeasy.totp.verify({
            secret: user.mfaSecret,
            encoding: "base32",
            token: credentials.token,
            window: 1,
          });
          if (!tokenValidates) {
            console.log("Invalid MFA token");
            return null;
          }
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
      console.log("User signed in: Logging event in database");
      await logsCollection.insertOne({
        event: "signIn",
        email: user.email,
        timestamp: new Date(),
      });
    },
    async signOut({ token }) {
      console.log("User signed out: Logging event in database");
      await logsCollection.insertOne({
        event: "signOut",
        email: token.email,
        timestamp: new Date(),
      });
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 30, // 30 minutes
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = {
          id: user.id,
          email: user.email as string,
          role: user.role,
        };
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.user) {
        session.user = token.user;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/auth/verify-mfa")) {
        return `${baseUrl}/auth/verify-mfa`;
      }
      if (url.startsWith(baseUrl)) {
        return url;
      }
      return baseUrl;
    },
  },
});

export { handler as GET, handler as POST };
