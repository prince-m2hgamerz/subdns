import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
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

        const { data: user } = await supabase
          .from("users")
          .select("*")
          .eq("email", credentials.email)
          .maybeSingle();

        if (!user) {
          throw new Error("Invalid credentials");
        }

        if (!user.password) {
          throw new Error("Invalid credentials");
        }

        if (user.is_banned) {
          throw new Error("Account suspended");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
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
    GitHubProvider({
      clientId: process.env.NODE_ENV === "production" ? process.env.GITHUB_ID_PROD! : process.env.GITHUB_ID_DEV!,
      clientSecret: process.env.NODE_ENV === "production" ? process.env.GITHUB_SECRET_PROD! : process.env.GITHUB_SECRET_DEV!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "credentials") return true;

      if (!user.email) return false;

      const { data: existing } = await supabase
        .from("users")
        .select("id")
        .eq("email", user.email)
        .maybeSingle();

      if (!existing) {
        const { error } = await supabase.from("users").insert({
          email: user.email,
          name: user.name || user.email.split("@")[0],
          image: user.image,
          password: "",
        });
        if (error) {
          console.error("Failed to create OAuth user:", error);
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === "credentials") {
          token.id = user.id;
          token.role = user.role;
        } else if (user.email) {
          const { data: dbUser } = await supabase
            .from("users")
            .select("*")
            .eq("email", user.email)
            .maybeSingle();
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
          }
        }
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
