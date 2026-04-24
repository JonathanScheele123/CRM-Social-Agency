import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

async function getLongLivedToken(shortToken: string) {
  const url = `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_id=${process.env.META_APP_ID}&client_secret=${process.env.META_APP_SECRET}&access_token=${shortToken}`;
  const res = await fetch(url);
  return res.json() as Promise<{ access_token: string; expires_in: number }>;
}

async function getIgProfile(token: string) {
  const res = await fetch(
    `https://graph.instagram.com/v21.0/me?fields=id,name,username,followers_count&access_token=${token}`
  );
  return res.json();
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const error = req.nextUrl.searchParams.get("error");

  if (error || !code || !state) {
    return NextResponse.redirect(new URL("/dashboard?social=error", req.url));
  }

  let kundenprofilId: string;
  try {
    const decoded = JSON.parse(Buffer.from(state, "base64url").toString());
    kundenprofilId = decoded.kundenprofilId;
    if (!kundenprofilId) throw new Error("missing id");
  } catch {
    return NextResponse.redirect(new URL("/dashboard?social=error", req.url));
  }

  try {
    // Exchange code for short-lived token
    const tokenRes = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.META_APP_ID!,
        client_secret: process.env.META_APP_SECRET!,
        grant_type: "authorization_code",
        redirect_uri: process.env.META_REDIRECT_URI!,
        code,
      }),
    });
    const tokenData = await tokenRes.json();
    console.log("[social/ig] short token response:", JSON.stringify({ has_token: !!tokenData.access_token, user_id: tokenData.user_id, error: tokenData.error_message }));

    if (!tokenData.access_token) throw new Error(`No access token: ${JSON.stringify(tokenData)}`);

    // Exchange for long-lived token (60 days)
    const longToken = await getLongLivedToken(tokenData.access_token);
    console.log("[social/ig] long token expires_in:", longToken.expires_in);
    if (!longToken.access_token) throw new Error(`No long-lived token: ${JSON.stringify(longToken)}`);

    const tokenExpiry = new Date(Date.now() + longToken.expires_in * 1000);

    // Get IG profile
    const profile = await getIgProfile(longToken.access_token);
    console.log("[social/ig] profile:", JSON.stringify({ id: profile.id, username: profile.username, followers: profile.followers_count }));

    if (!profile.id) throw new Error(`No profile ID: ${JSON.stringify(profile)}`);

    await prisma.socialAccount.upsert({
      where: {
        kundenprofilId_plattform_accountId: {
          kundenprofilId,
          plattform: "instagram",
          accountId: String(profile.id),
        },
      },
      update: {
        accountName: profile.name ?? null,
        accountHandle: profile.username ?? null,
        accessToken: longToken.access_token,
        tokenExpiry,
      },
      create: {
        id: randomBytes(12).toString("hex"),
        kundenprofilId,
        plattform: "instagram",
        accountId: String(profile.id),
        accountName: profile.name ?? null,
        accountHandle: profile.username ?? null,
        accessToken: longToken.access_token,
        tokenExpiry,
      },
    });

    const redirectUrl = new URL(`/admin/kunden/${kundenprofilId}`, req.url);
    redirectUrl.hash = "social";
    return NextResponse.redirect(redirectUrl);
  } catch (err) {
    console.error("[social/ig] callback error:", err);
    const redirectUrl = new URL(`/admin/kunden/${kundenprofilId}`, req.url);
    redirectUrl.searchParams.set("social", "error");
    redirectUrl.hash = "social";
    return NextResponse.redirect(redirectUrl);
  }
}
