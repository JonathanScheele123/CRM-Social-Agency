import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { erstelleKundenOrdner } from "@/lib/drive";
import { logFehler } from "@/lib/fehlerlog";
import { sendEmail } from "@/lib/email";
import { willkommenEmailHtml } from "@/lib/willkommen-email";

export async function POST(req: NextRequest) {
  const d = await req.json();

  if (!d.unternehmensname || !d.email) {
    return Response.json({ fehler: "Unternehmensname und E-Mail sind Pflichtfelder." }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email: d.email } });
  if (existingUser) {
    return Response.json({ fehler: "Diese E-Mail-Adresse ist bereits registriert." }, { status: 409 });
  }

  const hashedPasswort = await bcrypt.hash("1234567", 12);

  // Rolle für Hauptuser: Inhaber wenn E-Mail oben == E-Mail Freigabe Person 1
  const emailOben = (d.email as string).trim().toLowerCase();
  const emailPerson1 = d.emailFreigabeVerantwortlicher
    ? (d.emailFreigabeVerantwortlicher as string).trim().toLowerCase()
    : null;
  const emailPerson2 = d.emailFreigabeVerantwortlicher2
    ? (d.emailFreigabeVerantwortlicher2 as string).trim().toLowerCase()
    : null;

  const rolleHauptuser = emailPerson1 && emailOben === emailPerson1 ? "Inhaber" : "Mitarbeiter";

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
        socialMediaKanaele: d.socialMediaKanaele || null,
        freigabeVerantwortlicher: d.freigabeVerantwortlicher || null,
        emailFreigabeVerantwortlicher: d.emailFreigabeVerantwortlicher || null,
        freigabeVerantwortlicher2: d.freigabeVerantwortlicher2 || null,
        emailFreigabeVerantwortlicher2: d.emailFreigabeVerantwortlicher2 || null,
        cloudLink: d.cloudLink || null,
        zusatzlinks: d.zusatzlinks || null,
      },
    });

    // Hauptuser (top E-Mail)
    const hauptUser = await tx.user.create({
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
        userId: hauptUser.id,
        kundenprofilId: kundenprofil.id,
        kundenRolle: rolleHauptuser,
      },
    });

    // Person 1: separater User wenn E-Mail von top abweicht
    if (emailPerson1 && emailPerson1 !== emailOben) {
      const existiert = await tx.user.findUnique({ where: { email: emailPerson1 } });
      if (!existiert) {
        const person1User = await tx.user.create({
          data: {
            email: d.emailFreigabeVerantwortlicher,
            name: d.freigabeVerantwortlicher || null,
            passwort: hashedPasswort,
            rolle: "KUNDE",
            aktiv: true,
            mustChangePassword: true,
            passwortGeaendert: false,
          },
        });
        await tx.kundenprofilZugriff.create({
          data: {
            userId: person1User.id,
            kundenprofilId: kundenprofil.id,
            kundenRolle: "Mitarbeiter",
          },
        });
      }
    }

    // Person 2: immer Mitarbeiter, eigener User wenn vorhanden und neu
    if (emailPerson2 && emailPerson2 !== emailOben && emailPerson2 !== emailPerson1) {
      const existiert = await tx.user.findUnique({ where: { email: emailPerson2 } });
      if (!existiert) {
        const person2User = await tx.user.create({
          data: {
            email: d.emailFreigabeVerantwortlicher2,
            name: d.freigabeVerantwortlicher2 || null,
            passwort: hashedPasswort,
            rolle: "KUNDE",
            aktiv: true,
            mustChangePassword: true,
            passwortGeaendert: false,
          },
        });
        await tx.kundenprofilZugriff.create({
          data: {
            userId: person2User.id,
            kundenprofilId: kundenprofil.id,
            kundenRolle: "Mitarbeiter",
          },
        });
      }
    }

    return { kundenprofil, hauptUser };
  });

  // Drive-Ordner asynchron erstellen
  try {
    const driveUrl = await erstelleKundenOrdner(d.unternehmensname);
    await prisma.kundenprofil.update({
      where: { id: result.kundenprofil.id },
      data: { cloudLink: driveUrl },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await logFehler({ nachricht: `Drive-Ordner Fehler: ${msg}`, kontext: "onboarding/drive", benutzerTyp: "System" });
  }

  // ── Willkommens-E-Mails versenden ──────────────────────────────────────────
  try {
    const base = (process.env.NEXTAUTH_URL ?? "").replace(/\/$/, "");
    const loginLink = `${base}/login`;

    const empfaengerSet = new Map<string, string>(); // email → name

    const mainEmail = (d.email as string).trim().toLowerCase();
    empfaengerSet.set(mainEmail, d.ansprechpartner || d.unternehmensname || "");

    if (emailPerson1 && emailPerson1 !== mainEmail) {
      empfaengerSet.set(emailPerson1, d.freigabeVerantwortlicher || "");
    }
    if (emailPerson2 && emailPerson2 !== mainEmail && emailPerson2 !== emailPerson1) {
      empfaengerSet.set(emailPerson2, d.freigabeVerantwortlicher2 || "");
    }

    for (const [email, name] of empfaengerSet) {
      const html = willkommenEmailHtml({ name: name || email, email, loginLink });
      await sendEmail({
        to: [email],
        subject: "Willkommen bei JS Media – Ihre Zugangsdaten",
        text: `Hallo ${name || email},\n\nIhr Zugang wurde eingerichtet.\nE-Mail: ${email}\nPasswort: 1234567\n\nBitte ändern Sie Ihr Passwort nach der ersten Anmeldung.\n\nZum Login: ${loginLink}`,
        html,
      });
    }
  } catch (e) {
    console.error("[onboarding] Willkommens-E-Mail fehlgeschlagen:", e);
  }

  return Response.json({ success: true, kundenprofilId: result.kundenprofil.id }, { status: 201 });
}
