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
  accessToken: string;
  kundenprofilId: string;
}) {
  const token = account.accessToken;

  // Profile + follower count
  const profileRes = await fetch(
    `https://graph.instagram.com/v21.0/me?fields=id,name,username,followers_count&access_token=${token}`
  );
  const profile = await profileRes.json();

  // Monthly insights (last 30 days)
  const now = Math.floor(Date.now() / 1000);
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60;

  const insightsRes = await fetch(
    `https://graph.instagram.com/v21.0/${account.accountId}/insights?metric=reach,impressions,profile_views&period=day&since=${thirtyDaysAgo}&until=${now}&access_token=${token}`
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

  // Recent media for top post
  const mediaRes = await fetch(
    `https://graph.instagram.com/v21.0/${account.accountId}/media?fields=id,media_type,timestamp,like_count,comments_count&limit=20&access_token=${token}`
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

async function syncFacebookPage(account: {
  id: string;
  accountId: string;
  accountName: string | null;
  pageToken: string | null;
  kundenprofilId: string;
}) {
  const token = account.pageToken;
  if (!token) throw new Error("Kein Page-Token");

  const profileRes = await fetch(
    `https://graph.facebook.com/v21.0/${account.accountId}?fields=id,name,fan_count,followers_count&access_token=${token}`
  );
  const profile = await profileRes.json();

  const now = Math.floor(Date.now() / 1000);
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60;

  const insightsRes = await fetch(
    `https://graph.facebook.com/v21.0/${account.accountId}/insights?metric=page_impressions,page_reach&period=day&since=${thirtyDaysAgo}&until=${now}&access_token=${token}`
  );
  const insights = await insightsRes.json();

  let totalReach = 0;
  let totalImpressions = 0;

  if (Array.isArray(insights.data)) {
    for (const metric of insights.data) {
      const total = (metric.values ?? []).reduce(
        (sum: number, v: { value: number }) => sum + (v.value || 0), 0
      );
      if (metric.name === "page_reach") totalReach = total;
      if (metric.name === "page_impressions") totalImpressions = total;
    }
  }

  const now2 = new Date();
  const monatJahr = `${now2.toLocaleString("de-DE", { month: "long" })} ${now2.getFullYear()}`;
  const plattformLabel = `Facebook (${account.accountName ?? account.accountId})`;

  const kpiData = {
    reichweite: totalReach || null,
    impressionen: totalImpressions || null,
    follower: profile.fan_count ?? profile.followers_count ?? null,
    kpiTyp: "auto",
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

  return { follower: profile.fan_count, reach: totalReach };
}

interface TikTokVideo {
  id: string;
  title?: string;
  view_count?: number;
  like_count?: number;
  comment_count?: number;
  share_count?: number;
  create_time?: number;
}

async function refreshTikTokToken(refreshToken: string): Promise<{ access_token: string; expires_in: number } | null> {
  const res = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY ?? "",
      client_secret: process.env.TIKTOK_CLIENT_SECRET ?? "",
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });
  const data = await res.json();
  if (!data.access_token) return null;
  return { access_token: data.access_token, expires_in: data.expires_in ?? 86400 };
}

async function syncTikTokAccount(account: {
  id: string;
  accountId: string;
  accountName: string | null;
  accountHandle: string | null;
  accessToken: string;
  pageToken: string | null;
  tokenExpiry: Date | null;
  kundenprofilId: string;
}) {
  let token = account.accessToken;

  const isExpired = account.tokenExpiry ? account.tokenExpiry.getTime() < Date.now() + 5 * 60 * 1000 : true;
  if (isExpired && account.pageToken) {
    const refreshed = await refreshTikTokToken(account.pageToken);
    if (refreshed) {
      token = refreshed.access_token;
      const newExpiry = new Date(Date.now() + refreshed.expires_in * 1000);
      await prisma.socialAccount.update({
        where: { id: account.id },
        data: { accessToken: token, tokenExpiry: newExpiry },
      });
    }
  }

  const userRes = await fetch(
    "https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,follower_count,following_count,likes_count,video_count",
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const userData = await userRes.json();
  const user = userData.data?.user ?? {};

  const videoRes = await fetch("https://open.tiktokapis.com/v2/video/list/", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      max_count: 20,
      fields: ["id", "title", "view_count", "like_count", "comment_count", "share_count", "create_time"],
    }),
  });
  const videoData = await videoRes.json();
  const videos: TikTokVideo[] = videoData.data?.videos ?? [];

  const totalViews = videos.reduce((sum, v) => sum + (v.view_count ?? 0), 0);
  const totalLikes = videos.reduce((sum, v) => sum + (v.like_count ?? 0), 0);

  let topVideo: TikTokVideo | null = null;
  if (videos.length > 0) {
    topVideo = videos.reduce((best, v) => {
      const score = (v.like_count ?? 0) + (v.comment_count ?? 0) + (v.share_count ?? 0);
      const bestScore = (best.like_count ?? 0) + (best.comment_count ?? 0) + (best.share_count ?? 0);
      return score > bestScore ? v : best;
    });
  }

  const now = new Date();
  const monatJahr = `${now.toLocaleString("de-DE", { month: "long" })} ${now.getFullYear()}`;
  const plattformLabel = `TikTok (${account.accountName ?? account.accountHandle ?? account.accountId})`;

  const topVideoText = topVideo
    ? `Top-Video: ${topVideo.view_count?.toLocaleString("de-DE") ?? 0} Views, ${topVideo.like_count ?? 0} Likes, ${topVideo.comment_count ?? 0} Kommentare`
    : null;

  const kpiData = {
    follower: user.follower_count ?? null,
    reichweite: totalViews || null,
    impressionen: totalViews || null,
    likes: totalLikes || null,
    kpiTyp: "auto",
    analyseKommentar: topVideoText,
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

  return { follower: user.follower_count, reach: totalViews, topVideo: topVideoText };
}

async function refreshYouTubeToken(refreshToken: string): Promise<{ access_token: string; expiry: Date }> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.YOUTUBE_CLIENT_ID ?? "",
      client_secret: process.env.YOUTUBE_CLIENT_SECRET ?? "",
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error(`Token-Refresh fehlgeschlagen: ${JSON.stringify(data)}`);
  return {
    access_token: data.access_token,
    expiry: new Date(Date.now() + (data.expires_in ?? 3600) * 1000),
  };
}

async function syncYouTubeAccount(account: {
  id: string;
  accountId: string;
  accountName: string | null;
  accessToken: string;
  pageToken: string | null;
  tokenExpiry: Date | null;
  kundenprofilId: string;
}) {
  let token = account.accessToken;

  // Refresh access token if expired or expiring within 5 minutes
  if (account.pageToken && (!account.tokenExpiry || account.tokenExpiry.getTime() - Date.now() < 5 * 60 * 1000)) {
    const refreshed = await refreshYouTubeToken(account.pageToken);
    token = refreshed.access_token;
    await prisma.socialAccount.update({
      where: { id: account.id },
      data: { accessToken: token, tokenExpiry: refreshed.expiry },
    });
  }

  // Channel stats (Abonnenten, Gesamtaufrufe)
  const channelRes = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&mine=true`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const channelData = await channelRes.json();
  const stats = channelData.items?.[0]?.statistics ?? {};
  const subscriberCount = stats.subscriberCount ? parseInt(stats.subscriberCount) : null;

  // YouTube Analytics — letzte 30 Tage
  const today = new Date();
  const endDate = today.toISOString().slice(0, 10);
  const startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const analyticsRes = await fetch(
    `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel%3D%3DMINE&metrics=views,estimatedMinutesWatched,likes,comments,shares,subscribersGained,subscribersLost&startDate=${startDate}&endDate=${endDate}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const analyticsData = await analyticsRes.json();
  const row = analyticsData.rows?.[0] ?? [];
  // columns: views, estimatedMinutesWatched, likes, comments, shares, subscribersGained, subscribersLost
  const [views, watchMinutes, likes, comments, shares, subsGained, subsLost] = row;

  const now2 = new Date();
  const monatJahr = `${now2.toLocaleString("de-DE", { month: "long" })} ${now2.getFullYear()}`;
  const plattformLabel = `YouTube (${account.accountName ?? account.accountId})`;

  const netNewSubs = subsGained != null && subsLost != null ? subsGained - subsLost : null;
  const analyseKommentar = [
    watchMinutes != null ? `Watchtime: ${Math.round(watchMinutes).toLocaleString("de-DE")} Min.` : null,
    netNewSubs != null ? `Neue Abonnenten: ${netNewSubs >= 0 ? "+" : ""}${netNewSubs}` : null,
  ].filter(Boolean).join(" · ") || null;

  const kpiData = {
    follower: subscriberCount,
    impressionen: views ?? null,
    likes: likes ?? null,
    kommentare: comments ?? null,
    shares: shares ?? null,
    klicks: watchMinutes != null ? Math.round(watchMinutes) : null,
    analyseKommentar,
    kpiTyp: "auto",
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

  return { follower: subscriberCount, views };
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
      let result;
      if (account.plattform === "facebook") {
        result = await syncFacebookPage(account);
      } else if (account.plattform === "youtube") {
        result = await syncYouTubeAccount(account);
      } else if (account.plattform === "tiktok") {
        result = await syncTikTokAccount(account);
      } else {
        result = await syncInstagramAccount(account);
      }
      results.push({ accountId: account.accountId, plattform: account.plattform, success: true, ...result });
    } catch (err) {
      results.push({ accountId: account.accountId, plattform: account.plattform, success: false, error: String(err) });
    }
  }

  return NextResponse.json({ results });
}
