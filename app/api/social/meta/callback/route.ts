import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const params: Record<string, string> = {};
  req.nextUrl.searchParams.forEach((value, key) => {
    params[key] = key === "code" ? `${value.substring(0, 20)}...(${value.length} Zeichen)` : value;
  });

  const hasCode = !!req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");

  const html = `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><title>OAuth Debug</title>
<style>
  body{font-family:monospace;padding:40px;background:#0f0f0f;color:#e5e5e5;max-width:800px;margin:0 auto;}
  h1{color:#a855f7;}
  .box{background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:20px;margin:16px 0;}
  .key{color:#60a5fa;font-weight:bold;}
  .val{color:#fbbf24;}
  .ok{color:#4ade80;font-size:18px;font-weight:bold;}
  .err{color:#f87171;font-size:18px;font-weight:bold;}
  pre{white-space:pre-wrap;word-break:break-all;}
</style>
</head>
<body>
<h1>Meta OAuth — Debug</h1>

${error ? `<div class="box"><p class="err">❌ Facebook meldet Fehler: ${error}</p><p>${params.error_description ?? ""}</p></div>` : ""}
${hasCode ? `<div class="box"><p class="ok">✅ CODE empfangen — Facebook-Login hat geklappt!</p></div>` : ""}
${!hasCode && !error ? `<div class="box"><p class="err">❌ Kein Code und kein Fehler — merkwürdig.</p></div>` : ""}

<div class="box">
  <p><strong>Empfangene Parameter:</strong></p>
  ${Object.entries(params).map(([k, v]) => `<p><span class="key">${k}</span>: <span class="val">${v}</span></p>`).join("") || "<p>Keine Parameter</p>"}
</div>

<div class="box">
  <p><strong>Vollständige URL:</strong></p>
  <pre class="val">${req.url}</pre>
</div>
</body></html>`;

  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
