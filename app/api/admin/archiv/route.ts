import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") {
    return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });
  }

  const d = await req.json();

  const eintrag = await prisma.archivEintrag.create({
    data: {
      kundenprofilId: d.kundenprofilId,
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

  return Response.json({ id: eintrag.id }, { status: 201 });
}
