import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const kundenprofilId = req.nextUrl.searchParams.get("kundenprofilId") ?? "";
  const url = new URL(`/admin/kunden/${kundenprofilId}`, req.url);
  url.searchParams.set("tab", "kpis");
  return NextResponse.redirect(url);
}
