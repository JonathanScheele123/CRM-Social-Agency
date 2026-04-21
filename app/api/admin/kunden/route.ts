import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { bereinigeDaten } from "@/lib/kunden-felder";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") {
    return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });
  }

  const daten = await req.json();

  if (!daten.unternehmensname?.trim()) {
    return Response.json({ fehler: "Unternehmensname ist ein Pflichtfeld." }, { status: 400 });
  }

  try {
    const kunde = await prisma.kundenprofil.create({
      data: bereinigeDaten(daten),
    });
    return Response.json({ id: kunde.id }, { status: 201 });
  } catch (e) {
    console.error("[POST /api/admin/kunden]", e);
    return Response.json({ fehler: "Fehler beim Erstellen." }, { status: 500 });
  }
}
