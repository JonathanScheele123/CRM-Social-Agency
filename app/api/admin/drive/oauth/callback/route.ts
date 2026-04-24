import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");

  if (error) {
    return new Response(`OAuth-Fehler: ${error}`, { status: 400, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
  if (!code) {
    return new Response("Kein Code erhalten.", { status: 400 });
  }

  const base = (process.env.NEXTAUTH_URL ?? "").replace(/\/$/, "");
  const redirectUri = `${base}/api/admin/drive/oauth/callback`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GMAIL_CLIENT_ID!,
      client_secret: process.env.GMAIL_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const data = await res.json() as { refresh_token?: string; error?: string };

  if (!res.ok || !data.refresh_token) {
    return new Response(
      `Token-Austausch fehlgeschlagen: ${data.error ?? JSON.stringify(data)}`,
      { status: 500, headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }

  return new Response(
    `GOOGLE_DRIVE_REFRESH_TOKEN gefunden!\n\n${data.refresh_token}\n\nBitte als Cloudflare Secret speichern:\nwrangler secret put GOOGLE_DRIVE_REFRESH_TOKEN`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } }
  );
}
