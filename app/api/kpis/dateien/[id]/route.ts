import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import { join } from "path";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") {
    return NextResponse.json({ fehler: "Nicht autorisiert" }, { status: 401 });
  }

  const { id } = await params;
  const datei = await prisma.kPIDatei.findUnique({ where: { id } });
  if (!datei) return NextResponse.json({ fehler: "Nicht gefunden" }, { status: 404 });

  try {
    await unlink(join(process.cwd(), "public", datei.url));
  } catch {
    // file may already be gone
  }

  try {
    await prisma.kPIDatei.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[DELETE /api/kpis/dateien]", msg);
    return NextResponse.json({ fehler: "Fehler beim Löschen." }, { status: 500 });
  }
}
