import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { bereinigeDaten } from "@/lib/kunden-felder";
import { erstelleKundenOrdner } from "@/lib/drive";
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

    // Drive-Ordner synchron anlegen — fire-and-forget funktioniert nicht in CF Workers
    let driveWarning = false;
    try {
      const driveUrl = await erstelleKundenOrdner(daten.unternehmensname.trim());
      await prisma.kundenprofil.update({ where: { id: kunde.id }, data: { cloudLink: driveUrl } });
    } catch (err) {
      console.error("[Drive] Ordner-Erstellung fehlgeschlagen:", err instanceof Error ? err.message : err);
      driveWarning = true;
    }

    return Response.json({ id: kunde.id, ...(driveWarning && { driveWarning: true }) }, { status: 201 });
  } catch (e) {
    console.error("[POST /api/admin/kunden]", e);
    return Response.json({ fehler: "Fehler beim Erstellen." }, { status: 500 });
  }
}
