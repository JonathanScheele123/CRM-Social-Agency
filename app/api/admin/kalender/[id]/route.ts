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
  const daten = await req.json();

  const eintrag = await prisma.kalenderEintrag.update({
    where: { id },
    data: {
      titel: daten.titel ?? null,
      beschreibung: daten.beschreibung ?? null,
      plattform: Array.isArray(daten.plattform) ? daten.plattform : [],
      contentTyp: daten.contentTyp ?? null,
      prioritaet: daten.prioritaet ?? null,
      captionText: daten.captionText ?? null,
      dateizugriff: daten.dateizugriff ?? null,
      notizen: daten.notizen ?? null,
      geplantAm: daten.geplantAm ? new Date(daten.geplantAm) : null,
      gepostet: daten.gepostet ?? undefined,
      freigabeStatus: daten.freigabeStatus ?? undefined,
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
  await prisma.kalenderEintrag.delete({ where: { id } });

  return Response.json({ ok: true });
}
