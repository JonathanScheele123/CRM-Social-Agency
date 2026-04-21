import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") {
    return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });
  }

  const { id } = await params;

  const kunde = await prisma.kundenprofil.findUnique({
    where: { id },
    include: {
      contentIdeen_: { include: { kommentare: true } },
      kalender: true,
      kpis: { include: { dateien: true } },
      kundendaten: true,
      archivEintraege: { include: { kommentare: true } },
      zugriffe: { include: { user: { select: { email: true, name: true, rolle: true, aktiv: true } } } },
    },
  });

  if (!kunde) return Response.json({ fehler: "Nicht gefunden." }, { status: 404 });

  await logAudit({
    aktion: "exportiert",
    entitaetId: id,
    benutzerEmail: session.user.email,
    details: `Vollexport durch ${session.user.email}`,
  });

  const exportDaten = {
    exportiertAm: new Date().toISOString(),
    exportiertVon: session.user.email,
    kundenprofil: kunde,
  };

  const json = JSON.stringify(exportDaten, null, 2);
  const name = `${kunde.unternehmensname ?? "kunde"}_${id.slice(0, 6)}_export.json`
    .replace(/[^a-zA-Z0-9_\-.]/g, "_");

  return new Response(json, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${name}"`,
    },
  });
}
