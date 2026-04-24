import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appId = process.env.META_APP_ID;
  const secret = process.env.META_APP_SECRET;
  const redirectUri = process.env.META_REDIRECT_URI;

  const oauthUrl = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=pages_show_list&response_type=code&state=test`;

  return NextResponse.json({
    META_APP_ID: appId ?? "FEHLT",
    META_APP_ID_length: appId?.length ?? 0,
    META_APP_SECRET: secret ? `${secret.substring(0, 4)}...${secret.substring(secret.length - 4)}` : "FEHLT",
    META_REDIRECT_URI: redirectUri ?? "FEHLT",
    constructed_oauth_url: oauthUrl,
  });
}
