import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

const APP_ID = process.env.META_APP_ID ?? "925546743581623";
const APP_SECRET = process.env.META_APP_SECRET ?? "cbfb55cb7298cb97527487cfec212bd6";

async function getLongLivedToken(shortToken: string) {
  const res = await fetch(
    `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${APP_ID}&client_secret=${APP_SECRET}&fb_exchange_token=${shortToken}`
  );
  return res.json() as Promise<{ access_token?: string; expires_in?: number; error?: unknown }>;
}

async function getIgProfile(igAccountId: string, token: string) {
  const res = await fetch(
    `https://graph.facebook.com/v21.0/${igAccountId}?fields=id,name,username,followers_count&access_token=${token}`
  );
  return res.json();
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { token, igAccountIds, kundenprofilId } = await req.json();

  if (!token || !kundenprofilId || !Array.isArray(igAccountIds) || igAccountIds.length === 0) {
    return NextResponse.json({ error: "token, igAccountIds und kundenprofilId sind erforderlich" }, { status: 400 });
  }

  // Exchange for long-lived token
  const longToken = await getLongLivedToken(token);
  if (!longToken.access_token) {
    return NextResponse.json({ error: "Token ungültig oder abgelaufen", detail: longToken.error }, { status: 400 });
  }

  const expiry = longToken.expires_in
    ? new Date(Date.now() + longToken.expires_in * 1000)
    : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 days fallback

  const saved: { id: string; handle: string; followers: number }[] = [];
  const errors: { id: string; error: string }[] = [];

  for (const igId of igAccountIds) {
    const profile = await getIgProfile(String(igId).trim(), longToken.access_token);
    if (!profile.id) {
      errors.push({ id: igId, error: profile.error?.message ?? "Profil nicht gefunden" });
      continue;
    }

    await prisma.socialAccount.upsert({
      where: { kundenprofilId_plattform_accountId: { kundenprofilId, plattform: "instagram", accountId: String(profile.id) } },
      update: { accountName: profile.name ?? null, accountHandle: profile.username ?? null, accessToken: longToken.access_token, tokenExpiry: expiry },
      create: {
        id: randomBytes(12).toString("hex"),
        kundenprofilId,
        plattform: "instagram",
        accountId: String(profile.id),
        accountName: profile.name ?? null,
        accountHandle: profile.username ?? null,
        accessToken: longToken.access_token,
        tokenExpiry: expiry,
      },
    });

    saved.push({ id: profile.id, handle: profile.username, followers: profile.followers_count });
  }

  return NextResponse.json({ saved, errors });
}
