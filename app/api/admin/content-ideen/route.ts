import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") {
    return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });
  }

  const d = await req.json();
  if (!d.kundenprofilId) {
    return Response.json({ fehler: "Kunden-ID fehlt." }, { status: 400 });
  }

  const idee = await prisma.contentIdea.create({
    data: {
      kundenprofilId: d.kundenprofilId,
      titel: d.titel ?? null,
      beschreibung: d.beschreibung ?? null,
      plattform: Array.isArray(d.plattform) ? d.plattform : [],
      contentTyp: d.contentTyp ?? null,
      eingereichtVon: "Agentur",
      prioritaet: d.prioritaet ?? null,
      status: d.status ?? "Offen",
      notizen: d.notizen ?? null,
      captionText: d.captionText ?? null,
      dateizugriff: d.dateizugriff ?? null,
      einreichungsdatum: new Date(),
      gewuenschtesPostingDatum: d.gewuenschtesPostingDatum
        ? new Date(d.gewuenschtesPostingDatum)
        : null,
    },
  });

  return Response.json({ id: idee.id }, { status: 201 });
}
