import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });
  }

  const { id } = await params;

  const idee = await prisma.contentIdea.findUnique({ where: { id } });
  if (!idee) {
    return Response.json({ fehler: "Nicht gefunden." }, { status: 404 });
  }

  if (!idee.captionText || !idee.gewuenschtesPostingDatum) {
    return Response.json(
      { fehler: "Caption und Posting-Datum müssen ausgefüllt sein." },
      { status: 400 }
    );
  }

  if (session.user.rolle !== "ADMIN") {
    const zugriff = await prisma.kundenprofilZugriff.findFirst({
      where: { userId: session.user.id, kundenprofilId: idee.kundenprofilId },
    });
    if (!zugriff) {
      return Response.json({ fehler: "Kein Zugriff." }, { status: 403 });
    }
  }

  const [kalenderEintrag] = await prisma.$transaction([
    prisma.kalenderEintrag.create({
      data: {
        kundenprofilId: idee.kundenprofilId,
        titel: idee.titel,
        beschreibung: idee.beschreibung,
        plattform: idee.plattform,
        contentTyp: idee.contentTyp,
        prioritaet: idee.prioritaet,
        captionText: idee.captionText,
        dateizugriff: idee.dateizugriff,
        notizen: idee.notizen,
        geplantAm: idee.gewuenschtesPostingDatum,
        freigabeStatus: "Freigegeben",
        gepostet: false,
      },
    }),
    prisma.archivEintrag.create({
      data: {
        kundenprofilId: idee.kundenprofilId,
        titel: idee.titel,
        beschreibung: idee.beschreibung,
        plattform: idee.plattform,
        contentTyp: idee.contentTyp,
        prioritaet: idee.prioritaet,
        captionText: idee.captionText,
        dateizugriff: idee.dateizugriff,
        notizen: idee.notizen,
        archivdatum: new Date(),
        gepostetAm: null,
      },
    }),
    prisma.contentIdea.delete({ where: { id } }),
  ]);

  return Response.json({ kalenderId: kalenderEintrag.id }, { status: 201 });
}
