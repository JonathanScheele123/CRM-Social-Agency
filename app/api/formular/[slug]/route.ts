import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";

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

  const result = await prisma.$transaction(async (tx) => {
    const kundenprofil = await tx.kundenprofil.create({
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

    const user = await tx.user.create({
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

    await tx.kundenprofilZugriff.create({
      data: {
        userId: user.id,
        kundenprofilId: kundenprofil.id,
      },
    });

    return { kundenprofil, user };
  });

  return Response.json({ success: true, kundenprofilId: result.kundenprofil.id }, { status: 201 });
}
