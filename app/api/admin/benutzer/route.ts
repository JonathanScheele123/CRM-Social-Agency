import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { sendEmail } from "@/lib/email";
import fs from "fs";
import path from "path";

const DEFAULT_PASSWORT = "1234567";

function willkommensHtml(name: string, email: string): string {
  const tplPath = path.join(process.cwd(), "public", "email-editorial-willkommen.html");
  let html = fs.readFileSync(tplPath, "utf-8");
  html = html.replace("Hallo Max Mustermann,", `Hallo ${name || email},`);
  html = html.replace("max@mustermann.de", email);
  // Logo-Pfad für E-Mail-Versand absolutisieren
  const base = process.env.NEXTAUTH_URL ?? "https://app.js-media.de";
  html = html.replace(
    /src="[^"]*\/logo\.png"/,
    `src="${base}/logo.png"`
  );
  return html;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") {
    return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });
  }

  const {
    name,
    email,
    passwort,
    kundenprofilId,
    kundenprofilIds,
    kundenRolle,
    sendeWillkommensEmail,
  } = await req.json();

  if (!email) {
    return Response.json({ fehler: "E-Mail ist ein Pflichtfeld." }, { status: 400 });
  }

  const verwendetesPasswort = passwort || DEFAULT_PASSWORT;

  if (!sendeWillkommensEmail && !passwort) {
    return Response.json({ fehler: "Passwort ist ein Pflichtfeld." }, { status: 400 });
  }
  if (passwort && passwort.length < 8) {
    return Response.json({ fehler: "Passwort muss mindestens 8 Zeichen haben." }, { status: 400 });
  }

  const vorhanden = await prisma.user.findUnique({ where: { email } });
  if (vorhanden) {
    return Response.json({ fehler: "Diese E-Mail ist bereits vergeben." }, { status: 400 });
  }

  const passwortHash = await bcrypt.hash(verwendetesPasswort, 12);

  const neuerUser = await prisma.user.create({
    data: {
      name: name || null,
      email,
      passwort: passwortHash,
      rolle: "KUNDE",
      mustChangePassword: !!sendeWillkommensEmail,
    },
  });

  // Interface-Zugriffe anlegen
  const ids: string[] = Array.isArray(kundenprofilIds)
    ? kundenprofilIds
    : kundenprofilId
    ? [kundenprofilId]
    : [];

  const rolle = kundenRolle === "Mitarbeiter" ? "Mitarbeiter"
    : kundenRolle === "Co-Admin" ? "Co-Admin"
    : "Inhaber";

  for (const kpId of ids) {
    await prisma.kundenprofilZugriff.create({
      data: { userId: neuerUser.id, kundenprofilId: kpId, kundenRolle: rolle },
    });
  }

  // Willkommens-E-Mail senden
  if (sendeWillkommensEmail) {
    try {
      const html = willkommensHtml(name || "", email);
      await sendEmail({
        to: email,
        subject: "Ihr Zugang zum JS-Media-Kundenbereich",
        html,
        text: `Hallo ${name || email},\n\nIhr Zugang wurde eingerichtet.\nE-Mail: ${email}\nPasswort: ${DEFAULT_PASSWORT}\n\nBitte ändern Sie Ihr Passwort nach der ersten Anmeldung.`,
      });
    } catch (e) {
      console.error("[benutzer] Willkommens-E-Mail konnte nicht gesendet werden:", e);
    }
  }

  return Response.json({ id: neuerUser.id }, { status: 201 });
}
