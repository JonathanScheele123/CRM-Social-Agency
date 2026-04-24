import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

const APP_ID = process.env.META_APP_ID ?? "925546743581623";
const APP_SECRET = process.env.META_APP_SECRET ?? "cbfb55cb7298cb97527487cfec212bd6";
const REDIRECT_URI = process.env.META_REDIRECT_URI ?? "https://crm.jonathanscheele.de/api/social/meta/callback";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const error = req.nextUrl.searchParams.get("error");

  if (error || !code || !state) {
    return new NextResponse(
      `<pre style="font-family:monospace;padding:40px;background:#111;color:#f87171">FEHLER: error=${error}, code=${!!code}</pre>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }

  let kundenprofilId: string;
  try {
    const decoded = JSON.parse(Buffer.from(state, "base64url").toString());
    kundenprofilId = decoded.kundenprofilId;
    if (!kundenprofilId) throw new Error("missing id");
  } catch (e) {
    return new NextResponse(`<pre>STATE FEHLER: ${e}</pre>`, { headers: { "Content-Type": "text/html" } });
  }

  const debug: Record<string, unknown> = { kundenprofilId };

  try {
    // Exchange code for short-lived token via Instagram API
    const tokenRes = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: APP_ID,
        client_secret: APP_SECRET,
        grant_type: "authorization_code",
        redirect_uri: REDIRECT_URI,
        code,
      }),
    });
    const tokenData = await tokenRes.json();
    debug.shortToken = { ok: !!tokenData.access_token, user_id: tokenData.user_id, error: tokenData.error_message };

    if (!tokenData.access_token) throw new Error(`No short token: ${JSON.stringify(tokenData)}`);

    // Exchange for long-lived token (60 days)
    const longRes = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_id=${APP_ID}&client_secret=${APP_SECRET}&access_token=${tokenData.access_token}`
    );
    const longToken = await longRes.json();
    debug.longToken = { ok: !!longToken.access_token, expires: longToken.expires_in };

    if (!longToken.access_token) throw new Error(`No long token: ${JSON.stringify(longToken)}`);

    // Get profile
    const profileRes = await fetch(
      `https://graph.instagram.com/v21.0/me?fields=id,name,username,followers_count&access_token=${longToken.access_token}`
    );
    const profile = await profileRes.json();
    debug.profile = { id: profile.id, username: profile.username, followers: profile.followers_count, error: profile.error };

    if (!profile.id) throw new Error(`No profile: ${JSON.stringify(profile)}`);

    const expiry = new Date(Date.now() + longToken.expires_in * 1000);

    await prisma.socialAccount.upsert({
      where: { kundenprofilId_plattform_accountId: { kundenprofilId, plattform: "instagram", accountId: String(profile.id) } },
      update: { accountName: profile.name ?? null, accountHandle: profile.username ?? null, accessToken: longToken.access_token, tokenExpiry: expiry },
      create: { id: randomBytes(12).toString("hex"), kundenprofilId, plattform: "instagram", accountId: String(profile.id), accountName: profile.name ?? null, accountHandle: profile.username ?? null, accessToken: longToken.access_token, tokenExpiry: expiry },
    });

    debug.saved = true;
    return new NextResponse(
      `<pre style="font-family:monospace;padding:40px;background:#111;color:#4ade80">ERFOLG ✓\n\n${JSON.stringify(debug, null, 2)}</pre>`,
      { headers: { "Content-Type": "text/html" } }
    );

  } catch (err) {
    debug.exception = String(err);
    return new NextResponse(
      `<pre style="font-family:monospace;padding:40px;background:#111;color:#f87171">EXCEPTION\n\n${JSON.stringify(debug, null, 2)}</pre>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }
}
