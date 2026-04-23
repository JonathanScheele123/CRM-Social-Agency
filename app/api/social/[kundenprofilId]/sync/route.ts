import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface MediaItem {
  id: string;
  media_type: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
}

async function syncInstagramAccount(account: {
  id: string;
  accountId: string;
  accountHandle: string | null;
  pageToken: string | null;
  kundenprofilId: string;
}) {
  const token = account.pageToken;
  if (!token) throw new Error("Kein Page-Token vorhanden");

  const profileRes = await fetch(
    `https://graph.facebook.com/v21.0/${account.accountId}?fields=id,name,username,followers_count&access_token=${token}`
  );
  const profile = await profileRes.json();

  const now = Math.floor(Date.now() / 1000);
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60;

  const insightsRes = await fetch(
    `https://graph.facebook.com/v21.0/${account.accountId}/insights?metric=reach,impressions,profile_views&period=day&since=${thirtyDaysAgo}&until=${now}&access_token=${token}`
  );
  const insights = await insightsRes.json();

  let totalReach = 0;
  let totalImpressions = 0;
  let totalProfileViews = 0;

  if (Array.isArray(insights.data)) {
    for (const metric of insights.data) {
      const total = (metric.values ?? []).reduce(
        (sum: number, v: { value: number }) => sum + (v.value || 0),
        0
      );
      if (metric.name === "reach") totalReach = total;
      if (metric.name === "impressions") totalImpressions = total;
      if (metric.name === "profile_views") totalProfileViews = total;
    }
  }

  const mediaRes = await fetch(
    `https://graph.facebook.com/v21.0/${account.accountId}/media?fields=id,media_type,timestamp,like_count,comments_count&limit=20&access_token=${token}`
  );
  const mediaData = await mediaRes.json();
  const media: MediaItem[] = mediaData.data ?? [];

  let topPost: MediaItem | null = null;
  if (media.length > 0) {
    topPost = media.reduce((best, item) => {
      const score = (item.like_count ?? 0) + (item.comments_count ?? 0);
      const bestScore = (best.like_count ?? 0) + (best.comments_count ?? 0);
      return score > bestScore ? item : best;
    });
  }

  const now2 = new Date();
  const monatJahr = `${now2.toLocaleString("de-DE", { month: "long" })} ${now2.getFullYear()}`;
  const plattformLabel = `Instagram (@${account.accountHandle ?? profile.username ?? account.accountId})`;

  const topPostText = topPost
    ? `Top-Beitrag: ${topPost.media_type === "VIDEO" || topPost.media_type === "REEL" ? "Reel" : "Post"} vom ${new Date(topPost.timestamp).toLocaleDateString("de-DE")} — ${topPost.like_count ?? 0} Likes, ${topPost.comments_count ?? 0} Kommentare`
    : null;

  const kpiData = {
    reichweite: totalReach || null,
    impressionen: totalImpressions || null,
    follower: profile.followers_count ?? null,
    klicks: totalProfileViews || null,
    kpiTyp: "auto",
    analyseKommentar: topPostText,
  };

  const existing = await prisma.kPI.findFirst({
    where: { kundenprofilId: account.kundenprofilId, plattform: plattformLabel, monatJahr },
  });

  if (existing) {
    await prisma.kPI.update({ where: { id: existing.id }, data: kpiData });
  } else {
    await prisma.kPI.create({
      data: { kundenprofilId: account.kundenprofilId, plattform: plattformLabel, monatJahr, ...kpiData },
    });
  }

  await prisma.socialAccount.update({ where: { id: account.id }, data: { syncedAt: new Date() } });

  return { follower: profile.followers_count, reach: totalReach, topPost: topPostText };
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ kundenprofilId: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { kundenprofilId } = await params;
  const accounts = await prisma.socialAccount.findMany({ where: { kundenprofilId } });

  const results = [];
  for (const account of accounts) {
    try {
      const result = await syncInstagramAccount(account);
      results.push({ accountId: account.accountId, success: true, ...result });
    } catch (err) {
      results.push({ accountId: account.accountId, success: false, error: String(err) });
    }
  }

  return NextResponse.json({ results });
}
