import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { NextRequest } from "next/server";

const ANON = "Anonymisiert";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") {
    return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });
  }

  const { id } = await params;

  // Anonymize all personal identifiers, keep statistical/operational data
  await prisma.kundenprofil.update({
    where: { id },
    data: {
      unternehmensname: ANON,
      ansprechpartner: null,
      geschaeftsadresse: null,
      emailAnsprechpartner: null,
      telefonnummer: null,
      webseite: null,
      emailDirekt: null,
      socialMediaKanaele: null,
      freigabeVerantwortlicher: null,
      emailFreigabeVerantwortlicher: null,
      freigabeVerantwortlicher2: null,
      emailFreigabeVerantwortlicher2: null,
      linkInstagram: null,
      linkFacebook: null,
      linkTikTok: null,
      linkYouTube: null,
      cloudLink: null,
      zusatzlinks: null,
      notizenIntern: null,
      kurzbeschreibung: null,
      kernwerte: null,
      zielgruppe: null,
      dsgvoStatus: "anonymisiert",
    },
  });

  // Deactivate linked user accounts
  const zugriffe = await prisma.kundenprofilZugriff.findMany({
    where: { kundenprofilId: id },
    include: { user: true },
  });
  for (const z of zugriffe) {
    await prisma.user.update({
      where: { id: z.user.id },
      data: { aktiv: false, email: `anon_${z.user.id}@deleted.local`, name: ANON },
    });
  }

  await logAudit({
    aktion: "anonymisiert",
    entitaetId: id,
    benutzerEmail: session.user.email,
    details: `Anonymisierung durch ${session.user.email}`,
  });

  return Response.json({ ok: true });
}
