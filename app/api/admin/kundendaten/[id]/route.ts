import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
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
  const d = await req.json();

  const eintrag = await prisma.kundendaten.update({
    where: { id },
    data: {
      beschreibung: d.beschreibung || null,
      inhalt: d.inhalt || null,
      tags: Array.isArray(d.tags) ? d.tags : [],
      datum: d.datum ? new Date(d.datum) : null,
      veraltet: d.veraltet ?? false,
      hinzugefuegtVon: d.hinzugefuegtVon || null,
    },
  });

  return Response.json({ id: eintrag.id });
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
    await prisma.kundendaten.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("Record to delete does not exist")) {
      return Response.json({ fehler: "Eintrag nicht gefunden." }, { status: 404 });
    }
    console.error("[DELETE /api/admin/kundendaten]", msg);
    return Response.json({ fehler: "Fehler beim Löschen." }, { status: 500 });
  }
}
