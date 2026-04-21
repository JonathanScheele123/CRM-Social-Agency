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
      ? fmt(vonDatum).replace(/\d+\.\s/, "") // same month: "Mai 2026"
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
body{margin:0;padding:0;background-color:#ffffff;-webkit-font-smoothing:antialiased;}
a{text-decoration:none;}
img{border:0;outline:none;}
@media only screen and (max-width:640px){.ec{padding-left:24px!important;padding-right:24px!important;}}
</style>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;">
<div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#ffffff;">Ihre ${anzahl} Content-Beiträge wurden erfolgreich im Redaktionsplan eingetragen.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0;padding:0;background:#ffffff;background-image:radial-gradient(ellipse at 14% 6%,rgba(41,42,145,0.09) 0%,rgba(41,42,145,0) 52%),radial-gradient(ellipse at 86% 96%,rgba(41,42,145,0.07) 0%,rgba(41,42,145,0) 54%),radial-gradient(ellipse at 88% 8%,rgba(236,72,153,0.06) 0%,rgba(236,72,153,0) 44%);">
<tr><td align="center" style="padding:56px 16px 56px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;margin:0 auto;background:transparent;">

<!-- Logo -->
<tr><td align="center" class="ec" style="padding:0 48px;">
<a href="${loginLink}" style="display:inline-block;">
<img src="/logo.png" alt="JS Media" width="64" height="64" style="display:block;width:64px;height:64px;border-radius:14px;border:0;"/>
</a></td></tr>

<!-- Headline -->
<tr><td align="center" class="ec" style="padding:28px 48px 0 48px;">
<p style="margin:0;font-family:'EB Garamond',Georgia,'Times New Roman',serif;font-weight:500;font-size:34px;line-height:1.15;color:#111111;letter-spacing:-0.01em;text-align:center;">
Ihr Redaktionsplan<br/><em style="font-style:italic;font-weight:400;color:#2a2a2a;">ist bereit.</em>
</p></td></tr>

<!-- Ornament -->
<tr><td align="center" class="ec" style="padding:22px 48px 0 48px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="width:24px;border-top:1px solid #c8c4bc;line-height:0;font-size:0;">&nbsp;</td>
<td style="padding:0 10px;font-family:'EB Garamond',Georgia,serif;font-size:13px;color:#6b6b6b;line-height:1;">✦</td>
<td style="width:24px;border-top:1px solid #c8c4bc;line-height:0;font-size:0;">&nbsp;</td>
</tr></table></td></tr>

<!-- Greeting -->
<tr><td align="center" class="ec" style="padding:22px 72px 0 72px;">
<p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.75;color:#4b5468;text-align:center;">Hallo,</p>
</td></tr>

<!-- Body -->
<tr><td class="ec" style="padding:16px 72px 0 72px;">
<p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.75;color:#2a2a2a;text-align:center;">
Alle <strong>${anzahl} Beiträge</strong> wurden erfolgreich in Ihren Redaktionsplan eingetragen und sind nun zur Veröffentlichung vorgesehen.
</p></td></tr>
<tr><td class="ec" style="padding:12px 72px 0 72px;">
<p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.75;color:#2a2a2a;text-align:center;">
Sie können den Kalender jetzt einsehen oder alle Termine direkt in Ihre persönliche Kalender-App übernehmen.
</p></td></tr>

<!-- Summary card -->
<tr><td class="ec" style="padding:36px 48px 0 48px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #e6e3dd;border-bottom:1px solid #e6e3dd;">
<tr>
<td style="padding:20px 4px;" valign="top">
<p style="margin:0;font-family:'EB Garamond',Georgia,serif;font-style:italic;font-size:10.5px;letter-spacing:0.18em;text-transform:uppercase;color:#8a8680;line-height:1;">Beiträge</p>
<p style="margin:6px 0 0;font-family:'EB Garamond',Georgia,serif;font-size:20px;color:#111;font-weight:500;line-height:1.2;">${anzahl} geplant</p>
</td>
<td style="padding:20px 4px 20px 28px;border-left:1px solid #e6e3dd;" valign="top">
<p style="margin:0;font-family:'EB Garamond',Georgia,serif;font-style:italic;font-size:10.5px;letter-spacing:0.18em;text-transform:uppercase;color:#8a8680;line-height:1;">Zeitraum</p>
<p style="margin:6px 0 0;font-family:'EB Garamond',Georgia,serif;font-size:20px;color:#111;font-weight:500;line-height:1.2;">${zeitraum}</p>
</td>
</tr>
</table></td></tr>

<!-- Button 1: Zum Kalenderbereich -->
<tr><td align="center" class="ec" style="padding:40px 48px 0 48px;">
<!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${loginLink}" style="height:52px;v-text-anchor:middle;width:260px;" arcsize="50%" stroke="f" fillcolor="#292a91"><w:anchorlock/><center style="color:#fff;font-family:Helvetica,Arial,sans-serif;font-size:12px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;">Zum Kalenderbereich →</center></v:roundrect><![endif]-->
<!--[if !mso]><!-->
<a href="${loginLink}" style="display:inline-block;padding:16px 38px;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:12px;font-weight:600;letter-spacing:0.20em;text-transform:uppercase;color:#111111;text-decoration:none;background-color:rgba(255,255,255,0.30);background-image:linear-gradient(180deg,rgba(255,255,255,0.60) 0%,rgba(255,255,255,0.20) 38%,rgba(255,255,255,0.08) 62%,rgba(255,255,255,0.35) 100%);border-radius:999px;box-shadow:0 1px 0 rgba(255,255,255,0.9) inset,0 -1px 0 rgba(255,255,255,0.35) inset,0 0 0 1px rgba(255,255,255,0.55) inset,0 0 0 1px rgba(17,17,17,0.06),0 8px 24px rgba(17,17,17,0.08),0 2px 6px rgba(17,17,17,0.04),-10px -6px 28px rgba(41,42,145,0.18),10px 6px 28px rgba(41,42,145,0.13);backdrop-filter:blur(22px) saturate(180%);-webkit-backdrop-filter:blur(22px) saturate(180%);">
Zum Kalenderbereich&nbsp;&nbsp;→
</a>
<!--<![endif]-->
</td></tr>

<!-- Button 2: Termine exportieren -->
<tr><td align="center" class="ec" style="padding:14px 48px 0 48px;">
<!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${kalenderLink}" style="height:48px;v-text-anchor:middle;width:260px;" arcsize="50%" strokecolor="#c8c4bc" fillcolor="#ffffff"><w:anchorlock/><center style="color:#2a2a2a;font-family:Helvetica,Arial,sans-serif;font-size:12px;font-weight:500;letter-spacing:0.16em;text-transform:uppercase;">Termine exportieren</center></v:roundrect><![endif]-->
<!--[if !mso]><!-->
<a href="${kalenderLink}" style="display:inline-block;padding:14px 36px;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:12px;font-weight:500;letter-spacing:0.18em;text-transform:uppercase;color:#2a2a2a;text-decoration:none;background:transparent;border-radius:999px;box-shadow:0 0 0 1px rgba(17,17,17,0.14),0 2px 8px rgba(17,17,17,0.04);">
&#128197;&nbsp;&nbsp;Termine exportieren
</a>
<!--<![endif]-->
</td></tr>

<!-- Caption -->
<tr><td align="center" class="ec" style="padding:10px 72px 0 72px;">
<p style="margin:0;font-family:'EB Garamond',Georgia,serif;font-style:italic;font-size:11px;letter-spacing:0.10em;color:#8a8680;text-align:center;line-height:1.6;">
Öffnet in Google Kalender, Apple Kalender, Outlook &amp; Co.
</p></td></tr>

<!-- Divider -->
<tr><td class="ec" style="padding:40px 48px 0 48px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td style="border-top:1px solid #e6e3dd;line-height:0;font-size:0;">&nbsp;</td></tr>
</table></td></tr>

<!-- Sign-off -->
<tr><td class="ec" style="padding:28px 72px 0 72px;">
<p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.7;color:#2a2a2a;text-align:center;">
Bei Fragen antworten Sie einfach auf diese E-Mail.
</p></td></tr>
<tr><td align="center" class="ec" style="padding:10px 48px 0 48px;">
<p style="margin:0;font-family:'EB Garamond',Georgia,'Times New Roman',serif;font-style:italic;font-size:19px;color:#111111;text-align:center;line-height:1.3;">Jonathan Scheele</p>
<p style="margin:5px 0 0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:11px;font-weight:500;color:#7a766f;text-align:center;letter-spacing:0.18em;text-transform:uppercase;line-height:1;">JS Media</p>
</td></tr>

<!-- Footer separator -->
<tr><td class="ec" style="padding:36px 48px 0 48px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td style="border-top:1px solid #e6e3dd;line-height:0;font-size:0;">&nbsp;</td></tr>
</table></td></tr>

<!-- Footer -->
<tr><td align="center" class="ec" style="padding:20px 48px 0 48px;">
<p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:11px;line-height:1.9;color:#8a8680;letter-spacing:0.06em;text-align:center;">
JS&nbsp;Media · Jonathan Scheele<br/>
Enderstraße 94 · 01277 Dresden<br/>
<a href="tel:+4901718468848" style="color:#8a8680;text-decoration:none;">0171 846 88 48</a>&nbsp;·&nbsp;<a href="mailto:kontakt@jonathanscheele.de" style="color:#8a8680;text-decoration:none;">kontakt@jonathanscheele.de</a><br/>
<a href="https://www.js-handwerk.de" style="color:#292a91;text-decoration:none;font-weight:500;">www.js-handwerk.de</a>
</p></td></tr>
<tr><td align="center" class="ec" style="padding:10px 48px 48px 48px;">
<p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:10.5px;color:#b0b7c4;letter-spacing:0.04em;text-align:center;line-height:1.7;">USt-IdNr. gem. § 27a UStG: DE366728811</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}
