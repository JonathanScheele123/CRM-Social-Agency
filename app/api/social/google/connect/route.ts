import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

const CLIENT_ID = process.env.YOUTUBE_CLIENT_ID ?? "";
const REDIRECT_URI =
  process.env.YOUTUBE_REDIRECT_URI ??
  "https://crm.jonathanscheele.de/api/social/google/callback";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const kundenprofilId = req.nextUrl.searchParams.get("kundenprofilId");
  if (!kundenprofilId) {
    return NextResponse.json({ error: "kundenprofilId fehlt" }, { status: 400 });
  }

  if (!CLIENT_ID) {
    return NextResponse.json(
      { error: "YOUTUBE_CLIENT_ID nicht konfiguriert" },
      { status: 500 }
    );
  }

  const state = Buffer.from(
    JSON.stringify({ kundenprofilId, ts: Date.now() })
  ).toString("base64url");

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: [
      "https://www.googleapis.com/auth/youtube.readonly",
      "https://www.googleapis.com/auth/yt-analytics.readonly",
    ].join(" "),
    access_type: "offline",
    prompt: "consent",
    state,
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  );
}
