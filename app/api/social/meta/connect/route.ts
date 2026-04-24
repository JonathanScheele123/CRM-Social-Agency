import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

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
    client_id: process.env.META_APP_ID!,
    redirect_uri: process.env.META_REDIRECT_URI!,
    scope: "instagram_business_basic,instagram_business_manage_insights,instagram_business_manage_comments",
    response_type: "code",
    state,
  });

  return NextResponse.redirect(`https://api.instagram.com/oauth/authorize?${params}`);
}
