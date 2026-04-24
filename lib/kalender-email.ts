function fmt(date: Date) {
  return date.toLocaleDateString("de-DE", { day: "numeric", month: "short", year: "numeric" });
}

export function kalenderEmailHtml({
  anzahl,
  vonDatum,
  bisDatum,
  kalenderLink,
  loginLink,
}: {
  anzahl: number;
  vonDatum: Date;
  bisDatum: Date;
  kalenderLink: string;
  loginLink: string;
}): string {
  const zeitraum =
    vonDatum.getMonth() === bisDatum.getMonth() && vonDatum.getFullYear() === bisDatum.getFullYear()
      ? fmt(vonDatum).replace(/\d+\.\s/, "")
      : `${fmt(vonDatum).replace(/\d+\.\s/, "").replace(/\s\d{4}/, "")} – ${fmt(bisDatum).replace(/\d+\.\s/, "")}`;

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
<div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#f3f1ed;">Ihre ${anzahl} Content-Beiträge wurden erfolgreich im Redaktionsplan eingetragen.</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0;padding:0;background:#f3f1ed;">
<tr><td align="center" style="padding:40px 16px;">

<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background:#ffffff;border:1px solid #e8e4dc;">

<!-- Amber top stripe -->
<tr><td style="background:#c8863c;height:3px;line-height:3px;font-size:0;">&nbsp;</td></tr>

<!-- Header -->
<tr><td class="ec" style="padding:24px 36px 20px 36px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td valign="middle">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td valign="middle" style="padding-right:12px;">
<img src="https://crm.jonathanscheele.de/logo.png" alt="JS Media" width="36" height="36" style="display:block;width:36px;height:36px;border-radius:8px;"/>
</td>
<td valign="middle">
<p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:14px;font-weight:600;color:#1a1818;line-height:1.3;">JS Media</p>
<p style="margin:2px 0 0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:11px;color:#8a8580;line-height:1.5;">Jonathan Scheele<br/>Enderstraße 94 · 01277 Dresden</p>
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

<!-- Header rule -->
<tr><td style="background:#e8e4dc;height:1px;line-height:1px;font-size:0;">&nbsp;</td></tr>

<!-- Title -->
<tr><td align="center" class="ec" style="padding:44px 48px 0 48px;">
<p style="margin:0;font-family:'EB Garamond',Georgia,'Times New Roman',serif;font-weight:500;font-size:32px;line-height:1.2;color:#1a1818;letter-spacing:-0.01em;text-align:center;">Ihr Redaktionsplan<br/><em style="font-style:italic;font-weight:400;">ist bereit.</em></p>
</td></tr>

<!-- Amber underline -->
<tr><td align="center" style="padding:14px 0 0 0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="width:48px;border-top:2px solid #c8863c;line-height:0;font-size:0;">&nbsp;</td>
</tr></table>
</td></tr>

<!-- Body -->
<tr><td class="ec" style="padding:28px 48px 0 48px;">
<p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.75;color:#4a4540;">
Alle <strong style="color:#1a1818;">${anzahl} Beiträge</strong> wurden erfolgreich in Ihren Redaktionsplan eingetragen und sind nun zur Veröffentlichung vorgesehen.
</p>
</td></tr>
<tr><td class="ec" style="padding:12px 48px 0 48px;">
<p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.75;color:#4a4540;">
Sie können den Kalender jetzt einsehen oder alle Termine direkt in Ihre Kalender-App übernehmen.
</p>
</td></tr>

<!-- Summary card -->
<tr><td class="ec" style="padding:32px 48px 0 48px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e8e4dc;">
<tr><td style="padding:9px 20px;background:#f0ece4;border-bottom:1px solid #e8e4dc;" colspan="3">
<p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:10px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#8a8580;line-height:1;">Übersicht</p>
</td></tr>
<tr>
<td style="padding:16px 20px;width:50%;border-right:1px solid #e8e4dc;" valign="top">
<p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.10em;text-transform:uppercase;color:#8a8580;">Beiträge</p>
<p style="margin:6px 0 0;font-family:'EB Garamond',Georgia,serif;font-size:22px;color:#1a1818;font-weight:500;line-height:1.2;">${anzahl} geplant</p>
</td>
<td style="padding:16px 20px;width:50%;" valign="top">
<p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.10em;text-transform:uppercase;color:#8a8580;">Zeitraum</p>
<p style="margin:6px 0 0;font-family:'EB Garamond',Georgia,serif;font-size:22px;color:#1a1818;font-weight:500;line-height:1.2;">${zeitraum}</p>
</td>
</tr>
</table>
</td></tr>

<!-- Primary button -->
<tr><td align="left" class="ec" style="padding:32px 48px 0 48px;">
<!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${loginLink}" style="height:46px;v-text-anchor:middle;width:220px;" arcsize="3%" stroke="f" fillcolor="#c8863c"><w:anchorlock/><center style="color:#fff;font-family:Helvetica,Arial,sans-serif;font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;">Zum Kalenderbereich</center></v:roundrect><![endif]-->
<!--[if !mso]><!-->
<a href="${loginLink}" style="display:inline-block;padding:13px 28px;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#ffffff;text-decoration:none;background:#c8863c;border-radius:4px;">Zum Kalenderbereich &nbsp;→</a>
<!--<![endif]-->
</td></tr>

<!-- Secondary button -->
<tr><td align="left" class="ec" style="padding:12px 48px 0 48px;">
<!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${kalenderLink}" style="height:44px;v-text-anchor:middle;width:220px;" arcsize="3%" strokecolor="#c8863c" fillcolor="#ffffff"><w:anchorlock/><center style="color:#c8863c;font-family:Helvetica,Arial,sans-serif;font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;">Termine exportieren</center></v:roundrect><![endif]-->
<!--[if !mso]><!-->
<a href="${kalenderLink}" style="display:inline-block;padding:12px 28px;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#c8863c;text-decoration:none;background:transparent;border:1.5px solid #c8863c;border-radius:4px;">Termine exportieren</a>
<!--<![endif]-->
</td></tr>
<tr><td class="ec" style="padding:8px 48px 0 48px;">
<p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:11.5px;color:#8a8580;line-height:1.5;">Öffnet in Google Kalender, Apple Kalender, Outlook &amp; Co.</p>
</td></tr>

<!-- Sign-off -->
<tr><td class="ec" style="padding:40px 48px 0 48px;">
<p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.75;color:#4a4540;">Bei Fragen antworten Sie einfach auf diese E-Mail.</p>
<p style="margin:20px 0 0;font-family:'EB Garamond',Georgia,'Times New Roman',serif;font-style:italic;font-size:19px;color:#1a1818;line-height:1.3;">Jonathan Scheele</p>
<p style="margin:4px 0 0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:11px;font-weight:500;color:#8a8580;letter-spacing:0.14em;text-transform:uppercase;">JS Media</p>
</td></tr>

<!-- Footer rule -->
<tr><td class="ec" style="padding:32px 36px 0 36px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td style="border-top:1px solid #e8e4dc;line-height:0;font-size:0;">&nbsp;</td></tr>
</table>
</td></tr>

<!-- Footer -->
<tr><td align="center" class="ec" style="padding:18px 36px 28px 36px;">
<p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:10.5px;line-height:1.9;color:#a09890;text-align:center;">
JS&nbsp;Media · Jonathan Scheele · Enderstraße 94 · 01277 Dresden<br/>
<a href="tel:+491718468848" style="color:#a09890;text-decoration:none;">0171 846 88 48</a>&nbsp;·&nbsp;<a href="mailto:kontakt@jonathanscheele.de" style="color:#a09890;text-decoration:none;">kontakt@jonathanscheele.de</a>&nbsp;·&nbsp;<a href="https://handwerk.jonathanscheele.de" style="color:#c8863c;text-decoration:none;">handwerk.jonathanscheele.de</a><br/>
USt-IdNr. gem. § 27a UStG: DE409311042
</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}
