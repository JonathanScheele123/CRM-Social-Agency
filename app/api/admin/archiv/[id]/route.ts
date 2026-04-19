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

  const eintrag = await prisma.archivEintrag.update({
    where: { id },
    data: {
      titel: d.titel || null,
      beschreibung: d.beschreibung || null,
      plattform: Array.isArray(d.plattform) ? d.plattform : [],
      contentTyp: d.contentTyp || null,
      prioritaet: d.prioritaet || null,
      captionText: d.captionText || null,
      dateizugriff: d.dateizugriff || null,
      notizen: d.notizen || null,
      gepostetAm: d.gepostetAm ? new Date(d.gepostetAm) : null,
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
  await prisma.archivEintrag.delete({ where: { id } });
  return Response.json({ ok: true });
}
