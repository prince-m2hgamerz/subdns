import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { supabase } from "./supabase";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
    verifyRequest: "/auth/verify",
    newUser: "/dashboard",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        const { data: user, error: lookupErr } = await supabase
          .from("users")
          .select("*")
          .eq("email", credentials.email)
          .maybeSingle();

        if (lookupErr) {
          console.error("Supabase lookup error:", lookupErr);
          throw new Error("Invalid credentials");
        }

        if (!user) {
          console.error("User not found for email:", credentials.email);
          throw new Error("Invalid credentials");
        }

        if (!user.password) {
          console.error("User has no password field");
          throw new Error("Invalid credentials");
        }

        if (user.is_banned) {
          throw new Error("Account suspended");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          console.error("Password mismatch for:", credentials.email);
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      if (token.id) {
        const { data: dbUser } = await supabase
          .from("users")
          .select("role, is_banned, plan")
          .eq("id", token.id as string)
          .single();
        if (!dbUser || dbUser.is_banned) {
          return {};
        }
        token.role = dbUser.role;
        token.plan = dbUser.plan;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).plan = token.plan;
      }
      return session;
    },
  },
};
