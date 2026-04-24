import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

function fristDatum(): string {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" });
}

function generateHtml(name: string, total: number, typen: { name: string; count: number }[], frist: string, dashboardLink: string): string {
  const typeRows = typen
    .filter((t) => t.count > 0)
    .map(
      (t) => `
      <tr>
        <td style="padding:5px 20px 5px 0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:13px;color:#4a4540;text-align:left;white-space:nowrap;">${t.name}</td>
        <td style="padding:5px 0;font-family:'EB Garamond',Georgia,serif;font-size:15px;font-weight:500;color:#c8863c;text-align:right;white-space:nowrap;">${t.count}</td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="de" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
<title>JS Media</title>
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
<div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#f3f1ed;">Ihre Content-Ideen sind bereit zur Freigabe – bitte prüfen und freigeben bis zum ${frist}.</div>

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
<p style="margin:2px 0 0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:11px;color:#8a8580;line-height:1.5;">Jonathan Scheele<br/>Enderstra&#223;e 94 &middot; 01277 Dresden</p>
</td>
</tr></table>
</td>
<td valign="middle" align="right" class="hdr-right">
<p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:10.5px;color:#8a8580;line-height:1.9;text-align:right;">
<a href="https://www.js-media.de" style="color:#c8863c;text-decoration:none;">www.js-media.de</a><br/>
<a href="mailto:kontakt@jonathanscheele.de" style="color:#8a8580;text-decoration:none;">kontakt@jonathanscheele.de</a><br/>
<a href="tel:+491718468848" style="color:#8a8580;text-decoration:none;">+49 171 8468848</a>
</p>
</td>
</tr></table>
</td></tr>

<tr><td style="background:#e8e4dc;height:1px;line-height:1px;font-size:0;">&nbsp;</td></tr>

<tr><td align="center" style="padding:32px 48px 0 48px;">
<p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:10px;font-weight:600;letter-spacing:0.20em;text-transform:uppercase;color:#c8863c;line-height:1;">Content&#8209;Ideen &middot; Freigabe</p>
</td></tr>

<tr><td align="center" class="ec" style="padding:12px 48px 0 48px;">
<p style="margin:0;font-family:'EB Garamond',Georgia,'Times New Roman',serif;font-weight:500;font-size:34px;line-height:1.15;color:#1a1818;letter-spacing:-0.01em;text-align:center;">
Ihre Content&#8209;Ideen sind<br/><em style="font-style:italic;font-weight:400;">bereit zur Bewertung.</em>
</p>
</td></tr>

<tr><td align="center" style="padding:16px 0 0 0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="width:48px;border-top:2px solid #c8863c;line-height:0;font-size:0;">&nbsp;</td>
</tr></table>
</td></tr>

<tr><td class="ec" style="padding:28px 48px 0 48px;">
<p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.75;color:#4a4540;">Hallo ${name},</p>
</td></tr>
<tr><td class="ec" style="padding:14px 48px 0 48px;">
<p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.75;color:#4a4540;">
wir haben neue Content-Ideen für Ihren Account vorbereitet. Bitte prüfen Sie die Vorschläge und geben Sie diese frei — damit wir die Produktion rechtzeitig starten können.
</p>
</td></tr>

<tr><td class="ec" style="padding:28px 48px 0 48px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e8e4dc;background:#faf9f7;">
<tr><td align="center" style="padding:28px 24px;">
<p style="margin:0 0 4px;font-family:'EB Garamond',Georgia,serif;font-size:52px;font-weight:500;color:#c8863c;line-height:1;">${total}</p>
<p style="margin:0 0 20px;font-family:'EB Garamond',Georgia,serif;font-style:italic;font-size:16px;color:#8a8580;line-height:1.3;">Ideen zur Freigabe</p>
<table role="presentation" width="60%" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 20px auto;">
<tr><td style="border-top:1px solid #e8e4dc;line-height:0;font-size:0;">&nbsp;</td></tr>
</table>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
${typeRows}
</table>
</td></tr>
</table>
</td></tr>

<tr><td class="ec" style="padding:24px 48px 0 48px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-left:3px solid #c8863c;background:#faf9f7;">
<tr><td style="padding:14px 18px;">
<p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.75;color:#4a4540;">
Bitte geben Sie die Ideen bis zum <strong style="color:#1a1818;">${frist}</strong> frei.
</p>
</td></tr>
</table>
</td></tr>

<tr><td class="ec" style="padding:28px 48px 0 48px;">
<!--[if mso]>
<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${dashboardLink}" style="height:48px;v-text-anchor:middle;width:220px;" arcsize="4%" stroke="f" fillcolor="#c8863c">
<w:anchorlock/><center style="color:#ffffff;font-family:Helvetica,Arial,sans-serif;font-size:12px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;">Ideen freigeben &rarr;</center>
</v:roundrect><![endif]-->
<!--[if !mso]><!-->
<a href="${dashboardLink}" style="display:inline-block;padding:14px 32px;background:#c8863c;color:#ffffff;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:12px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;text-decoration:none;border-radius:3px;">
Ideen freigeben &rarr;
</a>
<!--<![endif]-->
</td></tr>

<tr><td class="ec" style="padding:36px 48px 0 48px;">
<p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.75;color:#4a4540;">
Bei Fragen stehen wir jederzeit zur Verfügung — antworten Sie einfach auf diese E-Mail.
</p>
</td></tr>

<tr><td class="ec" style="padding:40px 48px 0 48px;">
<p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.75;color:#4a4540;">Mit freundlichen Gr&#252;&#223;en,</p>
<p style="margin:20px 0 0;font-family:'EB Garamond',Georgia,'Times New Roman',serif;font-style:italic;font-size:19px;color:#1a1818;line-height:1.3;">Jonathan Scheele</p>
<p style="margin:4px 0 0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:11px;font-weight:500;color:#8a8580;letter-spacing:0.14em;text-transform:uppercase;">JS Media</p>
</td></tr>

<tr><td class="ec" style="padding:32px 36px 0 36px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td style="border-top:1px solid #e8e4dc;line-height:0;font-size:0;">&nbsp;</td></tr>
</table>
</td></tr>

<tr><td align="center" class="ec" style="padding:18px 36px 28px 36px;">
<p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:10.5px;line-height:1.9;color:#a09890;text-align:center;">
JS&nbsp;Media &middot; Jonathan Scheele &middot; Enderstra&#223;e 94 &middot; 01277 Dresden<br/>
<a href="tel:+491718468848" style="color:#a09890;text-decoration:none;">0171 846 88 48</a>&nbsp;&middot;&nbsp;<a href="mailto:kontakt@jonathanscheele.de" style="color:#a09890;text-decoration:none;">kontakt@jonathanscheele.de</a>&nbsp;&middot;&nbsp;<a href="https://www.js-media.de" style="color:#c8863c;text-decoration:none;">www.js-media.de</a><br/>
USt-IdNr. gem. &sect; 27a UStG: DE409311042<br/>
<span style="font-size:10px;color:#c0bbb5;letter-spacing:0.04em;">Sie erhalten diese Nachricht, weil Sie als Freigabe-Verantwortlicher hinterlegt sind.</span>
</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN")
    return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });

  const { id } = await params;

  let kunde;
  try {
    kunde = await prisma.kundenprofil.findUnique({
      where: { id },
      select: {
        contentIdeen_: { select: { contentTyp: true } },
        zugriffe: {
          where: { user: { aktiv: true } },
          select: { user: { select: { name: true, email: true } } },
        },
      },
    });
  } catch (e) {
    console.error("[content-ideen-email] DB-Fehler:", e);
    return Response.json({ fehler: "Datenbankfehler." }, { status: 500 });
  }

  if (!kunde) return Response.json({ fehler: "Kunde nicht gefunden." }, { status: 404 });

  const empfaenger = kunde.zugriffe
    .map((z) => ({ name: z.user.name ?? "", email: z.user.email }))
    .filter((e) => e.email.trim().length > 0);

  if (empfaenger.length === 0)
    return Response.json({ fehler: "Keine E-Mail-Adressen hinterlegt." }, { status: 400 });

  // Count content types
  const typMap = new Map<string, number>();
  for (const idee of kunde.contentIdeen_) {
    const typ = idee.contentTyp?.trim() || "Sonstiges";
    typMap.set(typ, (typMap.get(typ) ?? 0) + 1);
  }
  const typen = Array.from(typMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
  const total = kunde.contentIdeen_.length;
  const frist = fristDatum();
  const dashboardLink = `${(process.env.NEXTAUTH_URL ?? "https://crm.jonathanscheele.de").replace(/\/$/, "")}/dashboard`;

  const fehler: string[] = [];
  for (const emp of empfaenger) {
    const name = emp.name?.trim() || "Guten Tag";
    const html = generateHtml(name, total, typen, frist, dashboardLink);
    try {
      await sendEmail({
        to: emp.email,
        subject: "Ihre Content-Ideen sind bereit zur Bewertung · JS Media",
        text: `${name},\n\nIhre Content-Ideen sind bereit zur Bewertung. Bitte melden Sie sich an und geben Sie die ${total} Vorschläge bis zum ${frist} frei.\n\n${dashboardLink}\n\nBei Fragen antworten Sie einfach auf diese E-Mail.\n\nJonathan Scheele · JS Media`,
        html,
      });
    } catch (e) {
      console.error(`[content-ideen-email] Fehler bei ${emp.email}:`, e);
      fehler.push(emp.email);
    }
  }

  if (fehler.length === empfaenger.length)
    return Response.json({ fehler: "E-Mail konnte nicht gesendet werden." }, { status: 500 });

  return Response.json({ ok: true, gesendetAn: empfaenger.length - fehler.length });
}
