import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

function drehtageMailHtml(opts: {
  name: string;
  typ: "bestaetigung" | "erinnerung-tag" | "erinnerung-stunde" | "verschoben" | "abgesagt";
  datum: string;
  uhrzeit: string;
  adresse: string;
  dashboardLink: string;
}): string {
  const { name, typ, datum, uhrzeit, adresse, dashboardLink } = opts;

  const configs = {
    bestaetigung: {
      preheader: "Ihr Drehtag ist bestätigt – alle Details im Überblick.",
      banner: "",
      headline: "Ihr Drehtag<br/><em style=\"font-style:italic;font-weight:400;color:#2a2a2a;\">ist bestätigt.</em>",
      body: `ich freue mich, Ihnen zu bestätigen, dass unser gemeinsamer Drehtag nun fest eingeplant ist. Den vollständigen Ablaufplan mit allen Details habe ich als PDF an diese E-Mail angehängt.`,
      signoff: "Ich freue mich auf den gemeinsamen Tag.",
    },
    "erinnerung-tag": {
      preheader: "Morgen ist Ihr Drehtag – letzte Vorbereitungen.",
      banner: `<tr><td align="center" style="padding:0 48px 0 48px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
          style="background:#fef9f0;border:1px solid #f0d9b5;border-radius:4px;">
          <tr><td style="padding:14px 20px;">
            <p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:#c8863c;line-height:1;margin-bottom:4px;">Erinnerung</p>
            <p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#7a4e1a;font-weight:500;">Morgen ist Ihr Drehtag. Bitte stellen Sie sicher, dass alle Vorbereitungen abgeschlossen sind.</p>
          </td></tr>
        </table>
      </td></tr>`,
      headline: "Ihr Drehtag<br/><em style=\"font-style:italic;font-weight:400;color:#2a2a2a;\">ist morgen.</em>",
      body: `morgen ist es soweit — unser gemeinsamer Drehtag steht an. Nachfolgend noch einmal alle Details auf einen Blick.`,
      signoff: "Bis morgen — ich freue mich auf den Tag.",
    },
    "erinnerung-stunde": {
      preheader: "In 1 Stunde beginnt Ihr Drehtag.",
      banner: `<tr><td align="center" style="padding:0 48px 0 48px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
          style="background:#fff3f3;border:1px solid #f5c6c6;border-radius:4px;">
          <tr><td style="padding:14px 20px;">
            <p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:#e05252;line-height:1;margin-bottom:4px;">Bald geht es los</p>
            <p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#7a1a1a;font-weight:500;">In ca. einer Stunde startet Ihr Drehtag. Wir sind auf dem Weg — bis gleich!</p>
          </td></tr>
        </table>
      </td></tr>`,
      headline: "In einer Stunde<br/><em style=\"font-style:italic;font-weight:400;color:#2a2a2a;\">geht es los.</em>",
      body: `in ungefähr einer Stunde starten wir mit Ihrem Drehtag. Wir sind bereits unterwegs. Hier noch einmal alle Informationen im Überblick.`,
      signoff: "Bis gleich — wir freuen uns!",
    },
    verschoben: {
      preheader: "Ihr Drehtag wurde verschoben – neue Informationen anbei.",
      banner: `<tr><td align="center" style="padding:0 48px 0 48px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
          style="background:#f0f4ff;border:1px solid #c6d3f5;border-radius:4px;">
          <tr><td style="padding:14px 20px;">
            <p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:#3a5ec8;line-height:1;margin-bottom:4px;">Terminänderung</p>
            <p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#1a2e7a;font-weight:500;">Ihr Drehtag wurde auf einen neuen Termin verschoben. Die aktualisierten Details finden Sie unten.</p>
          </td></tr>
        </table>
      </td></tr>`,
      headline: "Ihr Drehtag<br/><em style=\"font-style:italic;font-weight:400;color:#2a2a2a;\">wurde verschoben.</em>",
      body: `wir haben Ihren Drehtag auf einen neuen Termin verlegt. Nachfolgend finden Sie die aktualisierten Details.`,
      signoff: "Bei Rückfragen stehe ich jederzeit zur Verfügung.",
    },
    abgesagt: {
      preheader: "Ihr Drehtag wurde abgesagt.",
      banner: `<tr><td align="center" style="padding:0 48px 0 48px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
          style="background:#f5f5f5;border:1px solid #d0d0d0;border-radius:4px;">
          <tr><td style="padding:14px 20px;">
            <p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:#666;line-height:1;margin-bottom:4px;">Absage</p>
            <p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#333;font-weight:500;">Der geplante Drehtag wurde abgesagt. Wir melden uns für einen neuen Termin.</p>
          </td></tr>
        </table>
      </td></tr>`,
      headline: "Ihr Drehtag<br/><em style=\"font-style:italic;font-weight:400;color:#2a2a2a;\">wurde abgesagt.</em>",
      body: `leider muss der geplante Drehtag abgesagt werden. Wir werden uns in Kürze mit einem neuen Terminvorschlag bei Ihnen melden.`,
      signoff: "Wir entschuldigen uns für etwaige Unannehmlichkeiten.",
    },
  };

  const c = configs[typ];
  const infoCard = typ === "abgesagt" ? "" : `
  <!-- Info card -->
  <tr><td class="ec" style="padding:28px 48px 0 48px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
    style="border:1px solid #e8e4dc;border-radius:4px;background:#faf9f7;">
  <tr>
    <td valign="top" style="padding:20px 22px;width:33.3%;">
      <p style="margin:0 0 6px;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:9px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:#c8863c;line-height:1;">Datum</p>
      <p style="margin:0;font-family:'EB Garamond',Georgia,serif;font-size:18px;font-weight:500;color:#1a1818;line-height:1.3;">${datum}</p>
    </td>
    <td valign="top" style="padding:20px 22px;width:33.3%;border-left:1px solid #e8e4dc;">
      <p style="margin:0 0 6px;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:9px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:#c8863c;line-height:1;">Uhrzeit</p>
      <p style="margin:0;font-family:'EB Garamond',Georgia,serif;font-size:18px;font-weight:500;color:#1a1818;line-height:1.3;">${uhrzeit} Uhr</p>
    </td>
    <td valign="top" style="padding:20px 22px;width:33.3%;border-left:1px solid #e8e4dc;">
      <p style="margin:0 0 6px;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:9px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:#c8863c;line-height:1;">Treffpunkt</p>
      <p style="margin:0;font-family:'EB Garamond',Georgia,serif;font-size:18px;font-weight:500;color:#1a1818;line-height:1.3;">${adresse}</p>
    </td>
  </tr>
  </table>
  </td></tr>`;

  const checklistBlock = (typ === "bestaetigung" || typ === "verschoben") ? `
  <!-- Checklist -->
  <tr><td class="ec" style="padding:20px 48px 0 48px;">
  <p style="margin:0 0 12px;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.75;color:#4a4540;">Zur Vorbereitung bitten wir Sie um Folgendes:</p>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    ${[
      "Zugang zu allen geplanten Drehorten sicherstellen",
      "Feste Ansprechperson vor Ort für kurzfristige Abstimmungen",
      "Saubere, einheitliche Arbeitskleidung – Logo sichtbar, sofern vorhanden",
      "Produkte, Werkzeuge oder Projekte bereithalten, die gezeigt werden sollen",
    ].map(item => `
    <tr>
      <td valign="top" style="padding:0 0 9px 0;width:18px;"><p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:13px;font-weight:600;color:#c8863c;line-height:1.75;">—</p></td>
      <td valign="top" style="padding:0 0 9px 8px;"><p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:13.5px;line-height:1.7;color:#4a4540;">${item}</p></td>
    </tr>`).join("")}
  </table>
  </td></tr>` : "";

  return `<!DOCTYPE html>
<html lang="de" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
<title>JS Media – Drehtag</title>
<style type="text/css">
@import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Inter:wght@400;500;600&display=swap');
*{box-sizing:border-box;}
body{margin:0;padding:0;background-color:#f3f1ed;-webkit-font-smoothing:antialiased;}
a{text-decoration:none;}
img{border:0;outline:none;}
@media only screen and (max-width:600px){
  .ec{padding-left:20px!important;padding-right:20px!important;}
  .hdr-right{display:none!important;font-size:0!important;max-height:0!important;overflow:hidden!important;}
}
</style>
</head>
<body style="margin:0;padding:0;background-color:#f3f1ed;">
<div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#f3f1ed;">${c.preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0;padding:0;background:#f3f1ed;">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background:#ffffff;border:1px solid #e8e4dc;">
<tr><td style="background:#c8863c;height:3px;line-height:3px;font-size:0;">&nbsp;</td></tr>
<tr><td class="ec" style="padding:24px 36px 20px 36px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td valign="middle">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td valign="middle" style="padding-right:12px;">
<img src="https://crm.jonathanscheele.de/logo.png" alt="JS Media" width="36" height="36" style="display:block;width:36px;height:36px;border-radius:8px;"/>
</td>
<td valign="middle">
<p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:14px;font-weight:600;color:#1a1818;line-height:1.3;">JS Media</p>
<p style="margin:2px 0 0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:11px;color:#8a8580;line-height:1.5;">Jonathan Scheele<br/>Endestra&#223;e 94 &middot; 01277 Dresden</p>
</td>
</tr></table>
</td>
<td valign="middle" align="right" class="hdr-right">
<p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:10.5px;color:#8a8580;line-height:1.9;text-align:right;">
<a href="https://handwerk.jonathanscheele.de" style="color:#c8863c;text-decoration:none;">handwerk.jonathanscheele.de</a><br/>
<a href="mailto:kontakt@jonathanscheele.de" style="color:#8a8580;text-decoration:none;">kontakt@jonathanscheele.de</a><br/>
<a href="tel:+491718468848" style="color:#8a8580;text-decoration:none;">+49 171 8468848</a>
</p>
</td>
</tr></table>
</td></tr>
<tr><td style="background:#e8e4dc;height:1px;line-height:1px;font-size:0;">&nbsp;</td></tr>
<tr><td align="center" class="ec" style="padding:44px 48px 0 48px;">
<p style="margin:0;font-family:'EB Garamond',Georgia,'Times New Roman',serif;font-weight:500;font-size:34px;line-height:1.15;color:#1a1818;letter-spacing:-0.01em;text-align:center;">${c.headline}</p>
</td></tr>
<tr><td align="center" style="padding:16px 0 0 0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="width:48px;border-top:2px solid #c8863c;line-height:0;font-size:0;">&nbsp;</td>
</tr></table>
</td></tr>
${c.banner ? `<tr><td style="padding:20px 0 0 0;"></td></tr>${c.banner}` : ""}
<tr><td class="ec" style="padding:24px 48px 0 48px;">
<p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.75;color:#4a4540;">Hallo ${name},</p>
</td></tr>
<tr><td class="ec" style="padding:14px 48px 0 48px;">
<p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.75;color:#4a4540;">${c.body}</p>
</td></tr>
${infoCard}
${checklistBlock}
<tr><td class="ec" style="padding:28px 48px 0 48px;">
<p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.75;color:#4a4540;">${c.signoff}</p>
</td></tr>
<tr><td class="ec" style="padding:24px 48px 0 48px;">
<p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.75;color:#4a4540;">Mit freundlichen Gr&#252;&#223;en,</p>
<p style="margin:16px 0 0;font-family:'EB Garamond',Georgia,'Times New Roman',serif;font-style:italic;font-size:19px;color:#1a1818;line-height:1.3;">Jonathan Scheele</p>
<p style="margin:4px 0 0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:11px;font-weight:500;color:#8a8580;letter-spacing:0.14em;text-transform:uppercase;">JS Media</p>
</td></tr>
<tr><td class="ec" style="padding:32px 36px 0 36px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td style="border-top:1px solid #e8e4dc;line-height:0;font-size:0;">&nbsp;</td></tr>
</table>
</td></tr>
<tr><td align="center" class="ec" style="padding:18px 36px 28px 36px;">
<p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:10.5px;line-height:1.9;color:#a09890;text-align:center;">
JS&nbsp;Media &middot; Jonathan Scheele &middot; Endestra&#223;e 94 &middot; 01277 Dresden<br/>
<a href="tel:+491718468848" style="color:#a09890;text-decoration:none;">0171 846 88 48</a>&nbsp;&middot;&nbsp;<a href="mailto:kontakt@jonathanscheele.de" style="color:#a09890;text-decoration:none;">kontakt@jonathanscheele.de</a>&nbsp;&middot;&nbsp;<a href="https://handwerk.jonathanscheele.de" style="color:#c8863c;text-decoration:none;">handwerk.jonathanscheele.de</a><br/>
USt-IdNr. gem. &sect; 27a UStG: DE409311042
</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

async function empfaengerLaden(kundenprofilId: string) {
  const zugriffe = await prisma.kundenprofilZugriff.findMany({
    where: { kundenprofilId },
    include: { user: { select: { name: true, email: true, aktiv: true } } },
  });
  return zugriffe
    .filter((z) => z.user.aktiv && z.user.email)
    .map((z) => ({ name: z.user.name ?? z.user.email, email: z.user.email }));
}

function datumFormatieren(d: Date) {
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function uhrzeitFormatieren(d: Date) {
  return d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN")
    return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { datum, uhrzeit, adresse } = body as { datum: string; uhrzeit: string; adresse: string };

  if (!datum || !uhrzeit || !adresse)
    return Response.json({ fehler: "Datum, Uhrzeit und Adresse sind erforderlich." }, { status: 400 });

  const drehtag = new Date(`${datum}T${uhrzeit}:00`);
  if (isNaN(drehtag.getTime()))
    return Response.json({ fehler: "Ungültiges Datum oder Uhrzeit." }, { status: 400 });

  const vorheriger = await prisma.kundenprofil.findUnique({
    where: { id },
    select: { drehtag: true, drehtageStatus: true, unternehmensname: true },
  });
  const istVerschiebung = vorheriger?.drehtageStatus === "geplant";

  await prisma.kundenprofil.update({
    where: { id },
    data: {
      drehtag,
      drehtageAdresse: adresse,
      drehtageStatus: "geplant",
      drehtageErinnerungTagGesendet: null,
      drehtageErinnerungStundeGesendet: null,
    },
  });

  const empfaenger = await empfaengerLaden(id);
  const typ = istVerschiebung ? "verschoben" : "bestaetigung";
  const datumStr = datumFormatieren(drehtag);
  const uhrzeitStr = uhrzeitFormatieren(drehtag);
  const betreff = istVerschiebung
    ? `Drehtag verschoben: ${datumStr} · JS Media`
    : `Drehtag bestätigt: ${datumStr} · JS Media`;

  for (const emp of empfaenger) {
    const html = drehtageMailHtml({ name: emp.name, typ, datum: datumStr, uhrzeit: uhrzeitStr, adresse, dashboardLink: "" });
    await sendEmail({
      to: emp.email,
      subject: betreff,
      text: `Hallo ${emp.name},\n\n${istVerschiebung ? "Ihr Drehtag wurde verschoben" : "Ihr Drehtag ist bestätigt"}.\n\nDatum: ${datumStr}\nUhrzeit: ${uhrzeitStr} Uhr\nTreffpunkt: ${adresse}\n\nJS Media`,
      html,
    }).catch((e) => console.error(`[drehtag] E-Mail an ${emp.email} fehlgeschlagen:`, e));
  }

  return Response.json({ ok: true, gesendetAn: empfaenger.length, istVerschiebung });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN")
    return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });

  const { id } = await params;

  const kunde = await prisma.kundenprofil.findUnique({
    where: { id },
    select: { drehtag: true, drehtageAdresse: true },
  });

  await prisma.kundenprofil.update({
    where: { id },
    data: {
      drehtag: null,
      drehtageAdresse: null,
      drehtageStatus: "abgesagt",
      drehtageErinnerungTagGesendet: null,
      drehtageErinnerungStundeGesendet: null,
    },
  });

  const empfaenger = await empfaengerLaden(id);
  const datumStr = kunde?.drehtag ? datumFormatieren(new Date(kunde.drehtag)) : "–";
  const uhrzeitStr = kunde?.drehtag ? uhrzeitFormatieren(new Date(kunde.drehtag)) : "–";

  for (const emp of empfaenger) {
    const html = drehtageMailHtml({ name: emp.name, typ: "abgesagt", datum: datumStr, uhrzeit: uhrzeitStr, adresse: kunde?.drehtageAdresse ?? "–", dashboardLink: "" });
    await sendEmail({
      to: emp.email,
      subject: "Drehtag abgesagt · JS Media",
      text: `Hallo ${emp.name},\n\nIhr geplanter Drehtag am ${datumStr} wurde leider abgesagt. Wir melden uns für einen neuen Termin.\n\nJS Media`,
      html,
    }).catch((e) => console.error(`[drehtag] Absage-Mail an ${emp.email} fehlgeschlagen:`, e));
  }

  return Response.json({ ok: true });
}
