import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

function getPool() {
  return new Pool({ connectionString: process.env.DATABASE_URL! });
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  trustHost: true,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "E-Mail", type: "email" },
        password: { label: "Passwort", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const pool = getPool();
        try {
          const result = await pool.query(
            `SELECT id, email, name, rolle, passwort, aktiv, "mustChangePassword" FROM "User" WHERE email = $1`,
            [credentials.email as string]
          );
          const user = result.rows[0];
          if (!user || !user.passwort || !user.aktiv) return null;

          const passwortKorrekt = await bcrypt.compare(
            credentials.password as string,
            user.passwort
          );
          if (!passwortKorrekt) return null;

          const isDefaultPassword = credentials.password === "1234567";

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            rolle: user.rolle,
            mustChangePassword: user.mustChangePassword || isDefaultPassword,
          };
        } finally {
          await pool.end();
        }
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
      if (trigger === "update" && token.id) {
        const pool = getPool();
        try {
          const result = await pool.query(
            `SELECT "mustChangePassword" FROM "User" WHERE id = $1`,
            [token.id as string]
          );
          if (result.rows[0]) token.mustChangePassword = result.rows[0].mustChangePassword;
        } finally {
          await pool.end();
        }
      }
      return token;
    },
  },
});
