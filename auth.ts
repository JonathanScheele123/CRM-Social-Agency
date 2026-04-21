import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "E-Mail", type: "email" },
        password: { label: "Passwort", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.passwort || !user.aktiv) return null;

        const passwortKorrekt = await bcrypt.compare(
          credentials.password as string,
          user.passwort
        );

        if (!passwortKorrekt) return null;

        // Standard-Passwort → immer Passwortänderung erzwingen
        const isDefaultPassword = credentials.password === "1234567";

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          rolle: user.rolle,
          mustChangePassword: user.mustChangePassword || isDefaultPassword,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, account, trigger }) {
      if (user && account?.provider === "credentials") {
        token.rolle = (user as { rolle: string }).rolle;
        token.id = user.id ?? "";
        token.mustChangePassword = (user as { mustChangePassword?: boolean }).mustChangePassword ?? false;
      }
      // Session-Update: mustChangePassword aus DB neu lesen (nach Passwortänderung)
      if (trigger === "update" && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { mustChangePassword: true },
        });
        if (dbUser) token.mustChangePassword = dbUser.mustChangePassword;
      }
      return token;
    },
  },
});
