import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest) {
  const appId = process.env.META_APP_ID;
  const redirectUri = process.env.META_REDIRECT_URI;

  const html = `<pre style="font-size:18px;padding:40px;background:#111;color:#4ade80;font-family:monospace">
META_APP_ID      : "${appId ?? "FEHLT"}" (${appId?.length ?? 0} Zeichen)
META_REDIRECT_URI: "${redirectUri ?? "FEHLT"}"

OAuth URL wäre:
https://www.facebook.com/v21.0/dialog/oauth
  ?client_id=${appId}
  &redirect_uri=${redirectUri}
  &scope=pages_show_list,...
</pre>`;

  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
