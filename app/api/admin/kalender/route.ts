import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") {
    return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });
  }

  const daten = await req.json();

  if (!daten.kundenprofilId) {
    return Response.json({ fehler: "Kunden-ID fehlt." }, { status: 400 });
  }

  const eintrag = await prisma.kalenderEintrag.create({
    data: {
      kundenprofilId: daten.kundenprofilId,
      titel: daten.titel ?? null,
      beschreibung: daten.beschreibung ?? null,
      plattform: Array.isArray(daten.plattform) ? daten.plattform : [],
      contentTyp: daten.contentTyp ?? null,
      eingereichtVon: daten.eingereichtVon ?? "Agentur",
      prioritaet: daten.prioritaet ?? null,
      captionText: daten.captionText ?? null,
      dateizugriff: daten.dateizugriff ?? null,
      notizen: daten.notizen ?? null,
      geplantAm: daten.geplantAm ? new Date(daten.geplantAm) : null,
      freigabeStatus: "Ausstehend",
    },
  });

  return Response.json({ id: eintrag.id }, { status: 201 });
}
