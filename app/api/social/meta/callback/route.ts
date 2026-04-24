import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

const APP_ID = process.env.META_APP_ID ?? "925546743581623";
const APP_SECRET = process.env.META_APP_SECRET ?? "cbfb55cb7298cb97527487cfec212bd6";
const REDIRECT_URI = process.env.META_REDIRECT_URI ?? "https://crm.jonathanscheele.de/api/social/meta/callback";

async function getLongLivedToken(shortToken: string) {
  const url = `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${APP_ID}&client_secret=${APP_SECRET}&fb_exchange_token=${shortToken}`;
  const res = await fetch(url);
  return res.json() as Promise<{ access_token: string; expires_in: number }>;
}

async function getInstagramAccounts(userToken: string) {
  const pagesRes = await fetch(
    `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,access_token&access_token=${userToken}`
  );
  const pagesData = await pagesRes.json();
  console.log("[social/cb] pages:", JSON.stringify({ count: pagesData.data?.length, error: pagesData.error }));

  if (!pagesData.data?.length) return [];

  const results: { igAccountId: string; igAccountName: string; igUsername: string; pageId: string; pageToken: string }[] = [];

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
    console.log("[social/cb] ig account:", JSON.stringify({ id: igId, username: detail.username }));

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
      body: new URLSearchParams({ client_id: APP_ID, client_secret: APP_SECRET, redirect_uri: REDIRECT_URI, code }),
    });
    const tokenData = await tokenRes.json();
    console.log("[social/cb] token:", JSON.stringify({ has_token: !!tokenData.access_token, error: tokenData.error }));
    if (!tokenData.access_token) throw new Error(`No token: ${JSON.stringify(tokenData)}`);

    const longToken = await getLongLivedToken(tokenData.access_token);
    if (!longToken.access_token) throw new Error(`No long token: ${JSON.stringify(longToken)}`);

    const igAccounts = await getInstagramAccounts(longToken.access_token);

    if (igAccounts.length === 0) {
      const url = new URL(`/admin/kunden/${kundenprofilId}`, req.url);
      url.searchParams.set("social", "kein-business-account");
      url.searchParams.set("tab", "social");
      return NextResponse.redirect(url);
    }

    for (const account of igAccounts) {
      await prisma.socialAccount.upsert({
        where: { kundenprofilId_plattform_accountId: { kundenprofilId, plattform: "instagram", accountId: account.igAccountId } },
        update: { accountName: account.igAccountName, accountHandle: account.igUsername, accessToken: longToken.access_token, pageId: account.pageId, pageToken: account.pageToken, tokenExpiry: new Date(Date.now() + longToken.expires_in * 1000) },
        create: { id: randomBytes(12).toString("hex"), kundenprofilId, plattform: "instagram", accountId: account.igAccountId, accountName: account.igAccountName, accountHandle: account.igUsername, accessToken: longToken.access_token, pageId: account.pageId, pageToken: account.pageToken, tokenExpiry: new Date(Date.now() + longToken.expires_in * 1000) },
      });
    }

    const url = new URL(`/admin/kunden/${kundenprofilId}`, req.url);
    url.searchParams.set("social", "success");
    url.searchParams.set("tab", "social");
    return NextResponse.redirect(url);
  } catch (err) {
    console.error("[social/cb] error:", String(err));
    const url = new URL(`/admin/kunden/${kundenprofilId}`, req.url);
    url.searchParams.set("social", "error");
    url.searchParams.set("tab", "social");
    return NextResponse.redirect(url);
  }
}
