import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const params: Record<string, string> = {};
  req.nextUrl.searchParams.forEach((value, key) => {
    params[key] = key === "code" ? `${value.substring(0, 20)}... (${value.length} Zeichen)` : value;
  });

  const html = `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><title>OAuth Test</title>
<style>body{font-family:monospace;padding:40px;background:#111;color:#eee;} h1{color:#4ade80;} .box{background:#1a1a1a;border:1px solid #333;border-radius:8px;padding:20px;margin:16px 0;} .key{color:#60a5fa;} .val{color:#fbbf24;} .ok{color:#4ade80;font-size:20px;} .err{color:#f87171;font-size:20px;}</style>
</head>
<body>
<h1>Meta OAuth Test-Callback</h1>
<div class="box">
${Object.keys(params).length === 0
  ? '<p class="err">❌ Keine Parameter empfangen — Facebook hat nichts zurückgeschickt.</p>'
  : `<p class="ok">✅ ${Object.keys(params).length} Parameter empfangen:</p>`
}
${Object.entries(params).map(([k, v]) => `<p><span class="key">${k}</span>: <span class="val">${v}</span></p>`).join("")}
</div>
${params.code ? '<div class="box"><p class="ok">✅ CODE vorhanden — OAuth-Login funktioniert!</p></div>' : ""}
${params.error ? `<div class="box"><p class="err">❌ Fehler: ${params.error} — ${params.error_description ?? ""}</p></div>` : ""}
<div class="box"><p>Vollständige URL: <span class="val">${req.url}</span></p></div>
</body></html>`;

  return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
}
