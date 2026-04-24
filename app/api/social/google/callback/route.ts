import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

const CLIENT_ID = process.env.YOUTUBE_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET ?? "";
const REDIRECT_URI =
  process.env.YOUTUBE_REDIRECT_URI ??
  "https://crm.jonathanscheele.de/api/social/google/callback";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const error = req.nextUrl.searchParams.get("error");

  if (error || !code || !state) {
    return NextResponse.redirect(
      new URL("/admin/kunden?social=error", req.nextUrl.origin)
    );
  }

  let kundenprofilId: string;
  try {
    const decoded = JSON.parse(Buffer.from(state, "base64url").toString());
    kundenprofilId = decoded.kundenprofilId;
    if (!kundenprofilId) throw new Error("missing id");
  } catch {
    return NextResponse.redirect(
      new URL("/admin/kunden?social=error", req.nextUrl.origin)
    );
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code,
        grant_type: "authorization_code",
      }),
    });
    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      console.error("[google/callback] no token:", tokenData);
      return NextResponse.redirect(
        new URL(
          `/admin/kunden/${kundenprofilId}?tab=social&social=error`,
          req.nextUrl.origin
        )
      );
    }

    const channelRes = await fetch(
      "https://www.googleapis.com/youtube/v3/channels?part=id,snippet,statistics&mine=true",
      { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
    );
    const channelData = await channelRes.json();

    if (!channelData.items?.length) {
      return NextResponse.redirect(
        new URL(
          `/admin/kunden/${kundenprofilId}?tab=social&social=kein-youtube-kanal`,
          req.nextUrl.origin
        )
      );
    }

    const channel = channelData.items[0];
    const expiry = new Date(
      Date.now() + (tokenData.expires_in ?? 3600) * 1000
    );

    await prisma.socialAccount.upsert({
      where: {
        kundenprofilId_plattform_accountId: {
          kundenprofilId,
          plattform: "youtube",
          accountId: channel.id,
        },
      },
      update: {
        accountName: channel.snippet?.title ?? null,
        accountHandle: channel.snippet?.customUrl ?? null,
        accessToken: tokenData.access_token,
        pageToken: tokenData.refresh_token ?? null,
        tokenExpiry: expiry,
      },
      create: {
        id: randomBytes(12).toString("hex"),
        kundenprofilId,
        plattform: "youtube",
        accountId: channel.id,
        accountName: channel.snippet?.title ?? null,
        accountHandle: channel.snippet?.customUrl ?? null,
        accessToken: tokenData.access_token,
        pageToken: tokenData.refresh_token ?? null,
        tokenExpiry: expiry,
      },
    });

    return NextResponse.redirect(
      new URL(
        `/admin/kunden/${kundenprofilId}?tab=social&social=youtube-success`,
        req.nextUrl.origin
      )
    );
  } catch (err) {
    console.error("[google/callback]", err);
    return NextResponse.redirect(
      new URL(
        `/admin/kunden/${kundenprofilId}?tab=social&social=error`,
        req.nextUrl.origin
      )
    );
  }
}
