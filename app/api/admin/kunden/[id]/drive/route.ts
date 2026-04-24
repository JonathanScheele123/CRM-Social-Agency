import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { erstelleKundenOrdner } from "@/lib/drive";
import { NextRequest } from "next/server";

export async function POST(
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
    select: { unternehmensname: true, cloudLink: true },
  });
  if (!kunde) return Response.json({ fehler: "Kunde nicht gefunden." }, { status: 404 });

  if (kunde.cloudLink) {
    return Response.json({ cloudLink: kunde.cloudLink });
  }

  if (!kunde.unternehmensname?.trim()) {
    return Response.json({ fehler: "Unternehmensname fehlt — Drive-Ordner kann nicht angelegt werden." }, { status: 400 });
  }

  try {
    const cloudLink = await erstelleKundenOrdner(kunde.unternehmensname.trim());
    await prisma.kundenprofil.update({ where: { id }, data: { cloudLink } });
    return Response.json({ cloudLink });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ fehler: `Drive-Fehler: ${msg}` }, { status: 500 });
  }
}
