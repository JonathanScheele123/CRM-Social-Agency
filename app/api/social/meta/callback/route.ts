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

async function getAccounts(userToken: string) {
  const pagesRes = await fetch(
    `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,access_token,fan_count&access_token=${userToken}`
  );
  const pagesData = await pagesRes.json();
  console.log("[social/cb] pages:", JSON.stringify({ count: pagesData.data?.length, error: pagesData.error }));

  if (!pagesData.data?.length) return { igAccounts: [], fbPages: [] };

  const igAccounts: { igAccountId: string; igAccountName: string; igUsername: string; pageId: string; pageToken: string }[] = [];
  const fbPages: { pageId: string; pageName: string; pageToken: string }[] = [];

  for (const page of pagesData.data) {
    fbPages.push({ pageId: page.id, pageName: page.name ?? "", pageToken: page.access_token });
  }

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
  return { igAccounts: results, fbPages };
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const error = req.nextUrl.searchParams.get("error");

  if (error || !code || !state) {
    return new NextResponse(`<pre>FEHLER: error=${error}, code=${!!code}, state=${!!state}</pre>`, { headers: { "Content-Type": "text/html" } });
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
    const tokenRes = await fetch("https://graph.facebook.com/v21.0/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_id: APP_ID, client_secret: APP_SECRET, redirect_uri: REDIRECT_URI, code }),
    });
    const tokenData = await tokenRes.json();
    debug.tokenOk = !!tokenData.access_token;
    debug.tokenError = tokenData.error;
    if (!tokenData.access_token) throw new Error(`No token: ${JSON.stringify(tokenData)}`);

    const longToken = await getLongLivedToken(tokenData.access_token);
    debug.longTokenOk = !!longToken.access_token;
    if (!longToken.access_token) throw new Error(`No long token: ${JSON.stringify(longToken)}`);

    const { igAccounts, fbPages } = await getAccounts(longToken.access_token);
    debug.igAccounts = igAccounts.map(a => ({ id: a.igAccountId, handle: a.igUsername }));
    debug.fbPages = fbPages.map(p => ({ id: p.pageId, name: p.pageName }));

    if (igAccounts.length === 0 && fbPages.length === 0) {
      return new NextResponse(`<pre style="font-family:monospace;padding:40px;background:#111;color:#f87171">KEIN ACCOUNT GEFUNDEN\n\n${JSON.stringify(debug, null, 2)}</pre>`, { headers: { "Content-Type": "text/html" } });
    }

    const expiry = new Date(Date.now() + longToken.expires_in * 1000);

    for (const account of igAccounts) {
      await prisma.socialAccount.upsert({
        where: { kundenprofilId_plattform_accountId: { kundenprofilId, plattform: "instagram", accountId: account.igAccountId } },
        update: { accountName: account.igAccountName, accountHandle: account.igUsername, accessToken: longToken.access_token, pageId: account.pageId, pageToken: account.pageToken, tokenExpiry: expiry },
        create: { id: randomBytes(12).toString("hex"), kundenprofilId, plattform: "instagram", accountId: account.igAccountId, accountName: account.igAccountName, accountHandle: account.igUsername, accessToken: longToken.access_token, pageId: account.pageId, pageToken: account.pageToken, tokenExpiry: expiry },
      });
    }

    for (const page of fbPages) {
      await prisma.socialAccount.upsert({
        where: { kundenprofilId_plattform_accountId: { kundenprofilId, plattform: "facebook", accountId: page.pageId } },
        update: { accountName: page.pageName, accessToken: longToken.access_token, pageToken: page.pageToken, tokenExpiry: expiry },
        create: { id: randomBytes(12).toString("hex"), kundenprofilId, plattform: "facebook", accountId: page.pageId, accountName: page.pageName, accessToken: longToken.access_token, pageToken: page.pageToken, tokenExpiry: expiry },
      });
    }

    debug.saved = { ig: igAccounts.length, fb: fbPages.length };
    return new NextResponse(`<pre style="font-family:monospace;padding:40px;background:#111;color:#4ade80">ERFOLG ✓\n\n${JSON.stringify(debug, null, 2)}</pre>`, { headers: { "Content-Type": "text/html" } });

  } catch (err) {
    debug.exception = String(err);
    return new NextResponse(`<pre style="font-family:monospace;padding:40px;background:#111;color:#f87171">EXCEPTION\n\n${JSON.stringify(debug, null, 2)}</pre>`, { headers: { "Content-Type": "text/html" } });
  }
}
