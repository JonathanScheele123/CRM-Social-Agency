import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") {
    return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });
  }

  const d = await req.json();

  const eintrag = await prisma.kundendaten.create({
    data: {
      kundenprofilId: d.kundenprofilId,
      beschreibung: d.beschreibung || null,
      inhalt: d.inhalt || null,
      tags: Array.isArray(d.tags) ? d.tags : [],
      datum: d.datum ? new Date(d.datum) : null,
      veraltet: d.veraltet ?? false,
      hinzugefuegtVon: d.hinzugefuegtVon || null,
    },
  });

  return Response.json({ id: eintrag.id }, { status: 201 });
}
