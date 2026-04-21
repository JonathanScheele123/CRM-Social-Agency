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

  const idee = await prisma.contentIdea.update({
    where: { id },
    data: {
      titel: d.titel ?? null,
      beschreibung: d.beschreibung ?? null,
      plattform: Array.isArray(d.plattform) ? d.plattform : [],
      contentTyp: d.contentTyp ?? null,
      prioritaet: d.prioritaet ?? null,
      status: d.status ?? undefined,
      notizen: d.notizen ?? null,
      captionText: d.captionText ?? null,
      dateizugriff: d.dateizugriff ?? null,
      gewuenschtesPostingDatum: d.gewuenschtesPostingDatum
        ? new Date(d.gewuenschtesPostingDatum)
        : null,
    },
  });

  return Response.json({ id: idee.id });
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
    await prisma.contentIdea.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("Record to delete does not exist")) {
      return Response.json({ fehler: "Idee nicht gefunden." }, { status: 404 });
    }
    console.error("[DELETE /api/admin/content-ideen]", msg);
    return Response.json({ fehler: "Fehler beim Löschen." }, { status: 500 });
  }
}
