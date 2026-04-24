import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY ?? "";
const CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET ?? "";
const REDIRECT_URI = process.env.TIKTOK_REDIRECT_URI ?? "https://crm.jonathanscheele.de/api/social/tiktok/callback";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const error = req.nextUrl.searchParams.get("error");
  const errorDescription = req.nextUrl.searchParams.get("error_description");

  if (error || !code || !state) {
    return new NextResponse(
      `<pre style="font-family:monospace;padding:40px;background:#111;color:#f87171">FEHLER\nerror=${error}\nerror_description=${errorDescription}\ncode=${!!code}\nstate=${!!state}</pre>`,
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
    const tokenRes = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "Cache-Control": "no-cache" },
      body: new URLSearchParams({
        client_key: CLIENT_KEY,
        client_secret: CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: REDIRECT_URI,
      }),
    });
    const tokenData = await tokenRes.json();
    debug.tokenOk = !!tokenData.access_token;
    debug.tokenError = tokenData.error ?? tokenData.error_description;
    if (!tokenData.access_token) throw new Error(`Kein Token: ${JSON.stringify(tokenData)}`);

    const { access_token, refresh_token, expires_in, open_id } = tokenData;
    const tokenExpiry = new Date(Date.now() + (expires_in ?? 86400) * 1000);

    const userRes = await fetch(
      "https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,bio_description,avatar_url,profile_deep_link,is_verified,follower_count,following_count,likes_count,video_count",
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    const userData = await userRes.json();
    debug.user = userData;

    const user = userData.data?.user;
    if (!user) throw new Error(`Keine User-Daten: ${JSON.stringify(userData)}`);

    const accountId = open_id ?? user.open_id;
    const displayName = user.display_name ?? "";

    await prisma.socialAccount.upsert({
      where: { kundenprofilId_plattform_accountId: { kundenprofilId, plattform: "tiktok", accountId } },
      update: {
        accountName: displayName,
        accountHandle: displayName,
        accessToken: access_token,
        pageId: accountId,
        pageToken: refresh_token ?? null,
        tokenExpiry,
      },
      create: {
        id: randomBytes(12).toString("hex"),
        kundenprofilId,
        plattform: "tiktok",
        accountId,
        accountName: displayName,
        accountHandle: displayName,
        accessToken: access_token,
        pageId: accountId,
        pageToken: refresh_token ?? null,
        tokenExpiry,
      },
    });

    debug.saved = { open_id: accountId, display_name: displayName };
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
