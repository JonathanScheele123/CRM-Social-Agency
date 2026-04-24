import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { sendEmail } from "@/lib/email";
import { willkommenEmailHtml } from "@/lib/willkommen-email";

const DEFAULT_PASSWORT = "1234567";

function willkommensHtml(name: string, email: string, passwort: string, loginUrl: string): string {
  const anrede = name ? `Hallo ${name},` : "Guten Tag,";
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
<div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#f3f1ed;">Willkommen bei JS Media – hier sind Ihre Zugangsdaten für den Login-Bereich.</div>

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
<p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:10px;font-weight:600;letter-spacing:0.20em;text-transform:uppercase;color:#c8863c;line-height:1;">Zugang &middot; Kundenbereich</p>
</td></tr>

<tr><td align="center" class="ec" style="padding:12px 48px 0 48px;">
<p style="margin:0;font-family:'EB Garamond',Georgia,'Times New Roman',serif;font-weight:500;font-size:34px;line-height:1.15;color:#1a1818;letter-spacing:-0.01em;text-align:center;">
Willkommen bei<br/><em style="font-style:italic;font-weight:400;">JS Media.</em>
</p>
</td></tr>

<tr><td align="center" style="padding:16px 0 0 0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="width:48px;border-top:2px solid #c8863c;line-height:0;font-size:0;">&nbsp;</td>
</tr></table>
</td></tr>

<tr><td class="ec" style="padding:28px 48px 0 48px;">
<p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.75;color:#4a4540;">${anrede}</p>
</td></tr>
<tr><td class="ec" style="padding:14px 48px 0 48px;">
<p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.75;color:#4a4540;">
Ihr Zugang zum JS&#8209;Media&#8209;Kundenbereich wurde eingerichtet. Ab sofort können Sie Content&#8209;Ideen einsehen, freigeben und Ihren Redaktionsplan verfolgen.
</p>
</td></tr>

<tr><td class="ec" style="padding:28px 48px 0 48px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e8e4dc;background:#faf9f7;">
<tr><td style="padding:24px 28px;">
<p style="margin:0 0 16px;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:10px;font-weight:600;letter-spacing:0.20em;text-transform:uppercase;color:#c8863c;line-height:1;">Ihre Zugangsdaten</p>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
<tr>
<td style="padding:6px 0;width:90px;">
<p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:11px;font-weight:500;letter-spacing:0.12em;text-transform:uppercase;color:#8a8580;line-height:1.6;">E-Mail</p>
</td>
<td style="padding:6px 0;">
<p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:14px;color:#1a1818;font-weight:500;line-height:1.6;">${email}</p>
</td>
</tr>
<tr><td colspan="2" style="border-top:1px solid #e8e4dc;line-height:0;font-size:0;">&nbsp;</td></tr>
<tr>
<td style="padding:6px 0;width:90px;">
<p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:11px;font-weight:500;letter-spacing:0.12em;text-transform:uppercase;color:#8a8580;line-height:1.6;">Passwort</p>
</td>
<td style="padding:6px 0;">
<p style="margin:0;font-family:'EB Garamond',Georgia,serif;font-size:18px;font-weight:500;color:#c8863c;letter-spacing:0.08em;line-height:1.6;">${passwort}</p>
</td>
</tr>
</table>
<p style="margin:16px 0 0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:12px;color:#8a8580;line-height:1.6;">Bitte &#228;ndern Sie Ihr Passwort nach der ersten Anmeldung.</p>
</td></tr>
</table>
</td></tr>

<tr><td class="ec" style="padding:28px 48px 0 48px;">
<!--[if mso]>
<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${loginUrl}" style="height:48px;v-text-anchor:middle;width:220px;" arcsize="4%" stroke="f" fillcolor="#c8863c">
<w:anchorlock/><center style="color:#ffffff;font-family:Helvetica,Arial,sans-serif;font-size:12px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;">Zum Login &rarr;</center>
</v:roundrect><![endif]-->
<!--[if !mso]><!-->
<a href="${loginUrl}" style="display:inline-block;padding:14px 32px;background:#c8863c;color:#ffffff;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:12px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;text-decoration:none;border-radius:3px;">
Zum Login &rarr;
</a>
<!--<![endif]-->
</td></tr>

<tr><td class="ec" style="padding:36px 48px 0 48px;">
<p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.75;color:#4a4540;">
Bei Fragen stehen wir jederzeit zur Verf&#252;gung &#8212; antworten Sie einfach auf diese E-Mail.
</p>
</td></tr>

<tr><td class="ec" style="padding:24px 48px 0 48px;">
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
USt-IdNr. gem. &sect; 27a UStG: DE409311042
</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
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

  let emailFehler: string | null = null;
  if (sendeWillkommensEmail) {
    const base = (process.env.NEXTAUTH_URL ?? "https://crm.jonathanscheele.de").replace(/\/$/, "");
    const loginLink = `${base}/login`;
    try {
      const html = willkommenEmailHtml({ name: name || email, email, loginLink });
      await sendEmail({
        to: email,
        subject: "Willkommen bei JS Media – Ihre Zugangsdaten",
        html,
        text: `${name ? `Hallo ${name},` : "Guten Tag,"}\n\nIhr Zugang wurde eingerichtet.\nE-Mail: ${email}\nPasswort: ${DEFAULT_PASSWORT}\n\nBitte ändern Sie Ihr Passwort nach der ersten Anmeldung.\n\n${loginLink}\n\nJonathan Scheele · JS Media`,
      });
    } catch (e) {
      console.error("[benutzer] Willkommens-E-Mail konnte nicht gesendet werden:", e);
      emailFehler = e instanceof Error ? e.message : String(e);
    }
  }

  return Response.json({ id: neuerUser.id, emailFehler }, { status: 201 });
}
