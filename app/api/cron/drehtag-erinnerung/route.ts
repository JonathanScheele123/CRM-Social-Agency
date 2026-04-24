import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

function drehtageErinnerungHtml(opts: {
  name: string;
  typ: "erinnerung-tag" | "erinnerung-stunde";
  datum: string;
  uhrzeit: string;
  adresse: string;
}): string {
  const { name, typ, datum, uhrzeit, adresse } = opts;
  const istTag = typ === "erinnerung-tag";

  const banner = istTag
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
        style="background:#fef9f0;border:1px solid #f0d9b5;border-radius:4px;">
        <tr><td style="padding:14px 20px;">
          <p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:#c8863c;line-height:1;margin-bottom:4px;">Erinnerung</p>
          <p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#7a4e1a;font-weight:500;">Morgen ist Ihr Drehtag. Bitte stellen Sie sicher, dass alle Vorbereitungen abgeschlossen sind.</p>
        </td></tr>
      </table>`
    : `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
        style="background:#fff3f3;border:1px solid #f5c6c6;border-radius:4px;">
        <tr><td style="padding:14px 20px;">
          <p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:#e05252;line-height:1;margin-bottom:4px;">Bald geht es los</p>
          <p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#7a1a1a;font-weight:500;">In ca. einer Stunde startet Ihr Drehtag. Wir sind auf dem Weg — bis gleich!</p>
        </td></tr>
      </table>`;

  const headline = istTag
    ? `Ihr Drehtag<br/><em style="font-style:italic;font-weight:400;color:#2a2a2a;">ist morgen.</em>`
    : `In einer Stunde<br/><em style="font-style:italic;font-weight:400;color:#2a2a2a;">geht es los.</em>`;

  const body = istTag
    ? `morgen ist es soweit — unser gemeinsamer Drehtag steht an. Nachfolgend noch einmal alle Details auf einen Blick.`
    : `in ungefähr einer Stunde starten wir mit Ihrem Drehtag. Wir sind bereits unterwegs.`;

  const signoff = istTag ? "Bis morgen — ich freue mich auf den Tag." : "Bis gleich — wir freuen uns!";
  const preheader = istTag
    ? "Morgen ist Ihr Drehtag – letzte Vorbereitungen."
    : "In 1 Stunde beginnt Ihr Drehtag.";

  return `<!DOCTYPE html>
<html lang="de" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<style type="text/css">
@import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Inter:wght@400;500;600&display=swap');
*{box-sizing:border-box;}
body{margin:0;padding:0;background-color:#f3f1ed;-webkit-font-smoothing:antialiased;}
a{text-decoration:none;}img{border:0;outline:none;}
@media only screen and (max-width:600px){.ec{padding-left:20px!important;padding-right:20px!important;}.hdr-right{display:none!important;}}
</style>
</head>
<body style="margin:0;padding:0;background-color:#f3f1ed;">
<div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#f3f1ed;">${preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0;padding:0;background:#f3f1ed;">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background:#ffffff;border:1px solid #e8e4dc;">
<tr><td style="background:#c8863c;height:3px;line-height:3px;font-size:0;">&nbsp;</td></tr>
<tr><td class="ec" style="padding:24px 36px 20px 36px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td valign="middle">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td valign="middle" style="padding-right:12px;"><img src="https://crm.jonathanscheele.de/logo.png" alt="JS Media" width="36" height="36" style="display:block;width:36px;height:36px;border-radius:8px;"/></td>
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
<p style="margin:0;font-family:'EB Garamond',Georgia,'Times New Roman',serif;font-weight:500;font-size:34px;line-height:1.15;color:#1a1818;letter-spacing:-0.01em;text-align:center;">${headline}</p>
</td></tr>
<tr><td align="center" style="padding:16px 0 0 0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="width:48px;border-top:2px solid #c8863c;line-height:0;font-size:0;">&nbsp;</td>
</tr></table>
</td></tr>
<tr><td align="center" class="ec" style="padding:20px 48px 0 48px;">${banner}</td></tr>
<tr><td class="ec" style="padding:24px 48px 0 48px;">
<p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.75;color:#4a4540;">Hallo ${name},</p>
</td></tr>
<tr><td class="ec" style="padding:14px 48px 0 48px;">
<p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.75;color:#4a4540;">${body}</p>
</td></tr>
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
</td></tr>
<tr><td class="ec" style="padding:28px 48px 0 48px;">
<p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.75;color:#4a4540;">${signoff}</p>
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
<a href="tel:+491718468848" style="color:#a09890;text-decoration:none;">0171 846 88 48</a>&nbsp;&middot;&nbsp;<a href="mailto:kontakt@jonathanscheele.de" style="color:#a09890;text-decoration:none;">kontakt@jonathanscheele.de</a>&nbsp;&middot;&nbsp;<a href="https://handwerk.jonathanscheele.de" style="color:#c8863c;text-decoration:none;">handwerk.jonathanscheele.de</a>
</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && req.headers.get("authorization") !== `Bearer ${cronSecret}`)
    return Response.json({ fehler: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const in23h = new Date(now.getTime() + 23 * 60 * 60 * 1000);
  const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000);
  const in50m = new Date(now.getTime() + 50 * 60 * 1000);
  const in70m = new Date(now.getTime() + 70 * 60 * 1000);

  const kandidaten = await prisma.kundenprofil.findMany({
    where: {
      drehtageStatus: "geplant",
      drehtag: { not: null, gt: now },
    },
    select: {
      id: true,
      drehtag: true,
      drehtageAdresse: true,
      drehtageErinnerungTagGesendet: true,
      drehtageErinnerungStundeGesendet: true,
      zugriffe: {
        include: { user: { select: { name: true, email: true, aktiv: true } } },
      },
    },
  });

  let gesendet = 0;

  for (const k of kandidaten) {
    if (!k.drehtag) continue;
    const dt = new Date(k.drehtag);
    const empfaenger = k.zugriffe
      .filter((z) => z.user.aktiv && z.user.email)
      .map((z) => ({ name: z.user.name ?? z.user.email, email: z.user.email }));

    const datum = dt.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
    const uhrzeit = dt.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
    const adresse = k.drehtageAdresse ?? "–";

    if (!k.drehtageErinnerungTagGesendet && dt >= in23h && dt <= in25h) {
      for (const emp of empfaenger) {
        await sendEmail({
          to: emp.email,
          subject: `Drehtag morgen: ${datum} · JS Media`,
          text: `Hallo ${emp.name},\n\nmorgen ist Ihr Drehtag.\n\nDatum: ${datum}\nUhrzeit: ${uhrzeit} Uhr\nTreffpunkt: ${adresse}\n\nJS Media`,
          html: drehtageErinnerungHtml({ name: emp.name, typ: "erinnerung-tag", datum, uhrzeit, adresse }),
        }).catch((e) => console.error(`[drehtag-cron] Tag-Erinnerung ${emp.email}:`, e));
      }
      await prisma.kundenprofil.update({ where: { id: k.id }, data: { drehtageErinnerungTagGesendet: now } });
      gesendet++;
    }

    if (!k.drehtageErinnerungStundeGesendet && dt >= in50m && dt <= in70m) {
      for (const emp of empfaenger) {
        await sendEmail({
          to: emp.email,
          subject: `In 1 Stunde: Drehtag startet · JS Media`,
          text: `Hallo ${emp.name},\n\nin ca. einer Stunde startet Ihr Drehtag. Wir sind auf dem Weg!\n\nDatum: ${datum}\nUhrzeit: ${uhrzeit} Uhr\nTreffpunkt: ${adresse}\n\nJS Media`,
          html: drehtageErinnerungHtml({ name: emp.name, typ: "erinnerung-stunde", datum, uhrzeit, adresse }),
        }).catch((e) => console.error(`[drehtag-cron] Stunden-Erinnerung ${emp.email}:`, e));
      }
      await prisma.kundenprofil.update({ where: { id: k.id }, data: { drehtageErinnerungStundeGesendet: now } });
      gesendet++;
    }
  }

  return Response.json({ ok: true, geprueft: kandidaten.length, gesendet });
}
