import { auth } from "@/auth";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") {
    return new Response("Nicht autorisiert.", { status: 401 });
  }

  const base = (process.env.NEXTAUTH_URL ?? "").replace(/\/$/, "");
  const redirectUri = `${base}/api/admin/drive/oauth/callback`;

  const url = new URL("https://accounts.google.com/o/oauth2/auth");
  url.searchParams.set("client_id", process.env.GMAIL_CLIENT_ID!);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", "https://www.googleapis.com/auth/drive");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");

  return Response.redirect(url.toString());
}
