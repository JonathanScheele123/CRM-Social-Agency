import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const pfad = nextUrl.pathname;
      // Statische Dateien (Bilder, Fonts etc.) immer durchlassen
      if (/\.[a-z0-9]+$/i.test(pfad)) return true;
      return !!auth?.user;
    },
    async jwt({ token, user }) {
      if (user) {
        token.rolle = (user as { rolle: string }).rolle;
        token.id = user.id ?? "";
        token.mustChangePassword = (user as { mustChangePassword?: boolean }).mustChangePassword ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.rolle = token.rolle as string;
        session.user.mustChangePassword = token.mustChangePassword as boolean;
      }
      return session;
    },
  },
};
