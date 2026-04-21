import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") {
    return NextResponse.json({ fehler: "Nicht autorisiert" }, { status: 401 });
  }

  const { kundenprofilId, kpisFreigegeben } = await req.json();
  if (!kundenprofilId || typeof kpisFreigegeben !== "boolean") {
    return NextResponse.json({ fehler: "Ungültige Daten" }, { status: 400 });
  }

  await prisma.kundenprofil.update({
    where: { id: kundenprofilId },
    data: { kpisFreigegeben },
  });

  return NextResponse.json({ ok: true });
}
