import type { NextAuthConfig } from "next-auth";

// Leichtgewichtige Auth-Config für Edge Runtime (kein Prisma, kein Node.js-only Code)
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const eingeloggt = !!auth?.user;
      const aufLoginSeite = nextUrl.pathname === "/login";

      if (aufLoginSeite) {
        if (eingeloggt) return Response.redirect(new URL("/dashboard", nextUrl));
        return true;
      }

      if (!eingeloggt) return false;
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.rolle = (user as { rolle: string }).rolle;
        token.id = user.id ?? "";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.rolle = token.rolle as string;
      }
      return session;
    },
  },
};
