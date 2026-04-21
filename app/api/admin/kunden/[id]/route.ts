import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { bereinigeDaten } from "@/lib/kunden-felder";
import { NextRequest } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") {
    return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });
  }

  const { id } = await params;
  const daten = await req.json();

  try {
    const kunde = await prisma.kundenprofil.update({
      where: { id },
      data: bereinigeDaten(daten),
    });
    return Response.json({ id: kunde.id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[PATCH /api/admin/kunden]", msg);
    return Response.json({ fehler: msg }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") {
    return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.kundenprofil.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("Record to delete does not exist")) {
      return Response.json({ fehler: "Kunde nicht gefunden." }, { status: 404 });
    }
    console.error("[DELETE /api/admin/kunden]", msg);
    return Response.json({ fehler: "Fehler beim Löschen." }, { status: 500 });
  }
}
