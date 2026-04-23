import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

async function getLongLivedToken(shortToken: string) {
  const url = `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.META_APP_ID}&client_secret=${process.env.META_APP_SECRET}&fb_exchange_token=${shortToken}`;
  const res = await fetch(url);
  return res.json() as Promise<{ access_token: string; expires_in: number }>;
}

async function getInstagramAccounts(userToken: string) {
  const pagesRes = await fetch(
    `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,access_token&access_token=${userToken}`
  );
  const pagesData = await pagesRes.json();
  if (!pagesData.data?.length) return [];

  const results: {
    igAccountId: string;
    igAccountName: string;
    igUsername: string;
    pageId: string;
    pageToken: string;
  }[] = [];

  for (const page of pagesData.data) {
    const igRes = await fetch(
      `https://graph.facebook.com/v21.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
    );
    const igData = await igRes.json();
    if (!igData.instagram_business_account?.id) continue;

    const igId = igData.instagram_business_account.id;
    const detailRes = await fetch(
      `https://graph.facebook.com/v21.0/${igId}?fields=id,name,username,followers_count&access_token=${page.access_token}`
    );
    const detail = await detailRes.json();

    results.push({
      igAccountId: igId,
      igAccountName: detail.name ?? "",
      igUsername: detail.username ?? "",
      pageId: page.id,
      pageToken: page.access_token,
    });
  }

  return results;
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
    const tokenRes = await fetch("https://graph.facebook.com/v21.0/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.META_APP_ID!,
        client_secret: process.env.META_APP_SECRET!,
        redirect_uri: process.env.META_REDIRECT_URI!,
        code,
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new Error("No access token");

    const longToken = await getLongLivedToken(tokenData.access_token);
    const tokenExpiry = new Date(Date.now() + longToken.expires_in * 1000);
    const igAccounts = await getInstagramAccounts(longToken.access_token);

    for (const account of igAccounts) {
      await prisma.socialAccount.upsert({
        where: {
          kundenprofilId_plattform_accountId: {
            kundenprofilId,
            plattform: "instagram",
            accountId: account.igAccountId,
          },
        },
        update: {
          accountName: account.igAccountName,
          accountHandle: account.igUsername,
          accessToken: longToken.access_token,
          pageId: account.pageId,
          pageToken: account.pageToken,
          tokenExpiry,
        },
        create: {
          id: randomBytes(12).toString("hex"),
          kundenprofilId,
          plattform: "instagram",
          accountId: account.igAccountId,
          accountName: account.igAccountName,
          accountHandle: account.igUsername,
          accessToken: longToken.access_token,
          pageId: account.pageId,
          pageToken: account.pageToken,
          tokenExpiry,
        },
      });
    }

    const redirectUrl = new URL(`/admin/kunden/${kundenprofilId}`, req.url);
    redirectUrl.hash = "social";
    return NextResponse.redirect(redirectUrl);
  } catch (err) {
    console.error("Meta callback error:", err);
    const redirectUrl = new URL(`/admin/kunden/${kundenprofilId}`, req.url);
    redirectUrl.searchParams.set("social", "error");
    redirectUrl.hash = "social";
    return NextResponse.redirect(redirectUrl);
  }
}
