import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY ?? "";
const REDIRECT_URI = process.env.TIKTOK_REDIRECT_URI ?? "https://crm.jonathanscheele.de/api/social/tiktok/callback";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const kundenprofilId = req.nextUrl.searchParams.get("kundenprofilId");
  if (!kundenprofilId) {
    return NextResponse.json({ error: "kundenprofilId fehlt" }, { status: 400 });
  }

  if (!CLIENT_KEY) {
    return NextResponse.json({ error: "TIKTOK_CLIENT_KEY nicht konfiguriert" }, { status: 500 });
  }

  const state = Buffer.from(JSON.stringify({ kundenprofilId, ts: Date.now() })).toString("base64url");

  const params = new URLSearchParams({
    client_key: CLIENT_KEY,
    scope: "user.info.basic,user.info.stats,video.list",
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    state,
  });

  const oauthUrl = `https://www.tiktok.com/v2/auth/authorize/?${params}`;
  console.log("[tiktok/connect] redirecting to TikTok OAuth");

  return NextResponse.redirect(oauthUrl);
}
