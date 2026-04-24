import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { erstelleKundenOrdner } from "@/lib/drive";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const config = await prisma.formularConfig.findUnique({ where: { slug } });
  if (!config) return Response.json({ fehler: "Formular nicht gefunden." }, { status: 404 });
  return Response.json(config);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const config = await prisma.formularConfig.findUnique({ where: { slug } });
  if (!config) return Response.json({ fehler: "Formular nicht gefunden." }, { status: 404 });

  const d = await req.json();

  if (!d.unternehmensname || !d.email) {
    return Response.json({ fehler: "Unternehmensname und E-Mail sind Pflichtfelder." }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email: d.email } });
  if (existingUser) {
    return Response.json({ fehler: "Diese E-Mail-Adresse ist bereits registriert." }, { status: 409 });
  }

  const hashedPasswort = await bcrypt.hash("1234567", 12);

  const kundenprofil = await prisma.kundenprofil.create({
    data: {
      unternehmensname: d.unternehmensname || null,
      ansprechpartner: d.ansprechpartner || null,
      geschaeftsadresse: d.geschaeftsadresse || null,
      emailAnsprechpartner: d.email || null,
      telefonnummer: d.telefonnummer || null,
      branche: d.branche || null,
      webseite: d.webseite || null,
      freigabeVerantwortlicher: d.freigabeVerantwortlicher || null,
      emailFreigabeVerantwortlicher: d.emailFreigabeVerantwortlicher || null,
      cloudLink: d.cloudLink || null,
      zusatzlinks: d.zusatzlinks || null,
      socialMediaKanaele: d.socialMediaKanaele || null,
    },
  });

  const user = await prisma.user.create({
    data: {
      email: d.email,
      name: d.ansprechpartner || d.unternehmensname,
      passwort: hashedPasswort,
      rolle: "KUNDE",
      aktiv: true,
      mustChangePassword: true,
      passwortGeaendert: false,
    },
  });

  await prisma.kundenprofilZugriff.create({
    data: {
      userId: user.id,
      kundenprofilId: kundenprofil.id,
    },
  });

  // Drive-Ordner synchron anlegen — fire-and-forget funktioniert nicht in CF Workers
  try {
    const driveUrl = await erstelleKundenOrdner(d.unternehmensname.trim());
    await prisma.kundenprofil.update({ where: { id: kundenprofil.id }, data: { cloudLink: driveUrl } });
  } catch (err) {
    console.error("[Drive] Ordner-Erstellung fehlgeschlagen:", err instanceof Error ? err.message : err);
  }

  return Response.json({ success: true, kundenprofilId: kundenprofil.id }, { status: 201 });
}
