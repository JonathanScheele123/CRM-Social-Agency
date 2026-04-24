import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

const APP_ID = process.env.META_APP_ID ?? "925546743581623";
const REDIRECT_URI = process.env.META_REDIRECT_URI ?? "https://crm.jonathanscheele.de/api/social/meta/callback";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const kundenprofilId = req.nextUrl.searchParams.get("kundenprofilId");
  if (!kundenprofilId) {
    return NextResponse.json({ error: "kundenprofilId fehlt" }, { status: 400 });
  }

  const state = Buffer.from(JSON.stringify({ kundenprofilId, ts: Date.now() })).toString("base64url");

  const params = new URLSearchParams({
    client_id: APP_ID,
    redirect_uri: REDIRECT_URI,
    scope: "pages_show_list,pages_read_engagement,instagram_basic,instagram_manage_insights",
    response_type: "code",
    state,
  });

  const oauthUrl = `https://www.facebook.com/v21.0/dialog/oauth?${params}`;
  console.log("[social/connect] redirecting to:", oauthUrl.substring(0, 120));

  return NextResponse.redirect(oauthUrl);
}
