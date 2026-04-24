export function benachrichtigungContentStrategieHtml({
  unternehmensname,
  freigabeVerantwortlicher,
  emailFreigabeVerantwortlicher,
  hauptziel,
  zielgruppe,
  contentThemen,
  contentStil,
  drehtageAnWelchenTagen,
  drehtageUhrzeiten,
  adminLink,
}: {
  unternehmensname: string;
  freigabeVerantwortlicher: string | null;
  emailFreigabeVerantwortlicher: string | null;
  hauptziel: string | null;
  zielgruppe: string | null;
  contentThemen: string[];
  contentStil: string[];
  drehtageAnWelchenTagen: string[];
  drehtageUhrzeiten: string | null;
  adminLink: string;
}): string {
  function row(label: string, value: string | null | undefined, last = false): string {
    const border = last ? "" : "border-bottom:1px solid #f0ede8;";
    const display = value?.trim() || null;
    const val = display
      ? `<td style="padding:10px 18px;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:13px;color:#2a2a2a;${border}">${display}</td>`
      : `<td style="padding:10px 18px;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:13px;color:#c8c4bc;font-style:italic;${border}">—</td>`;
    return `<tr><td style="padding:10px 18px;width:38%;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:12px;color:#7a766f;${border}white-space:nowrap;">${label}</td>${val}</tr>`;
  }

  function sectionHeader(title: string): string {
    return `<tr><td colspan="2" style="padding:10px 18px 8px;background:#f8f7f5;border-bottom:1px solid #e6e3dd;border-top:1px solid #e6e3dd;"><p style="margin:0;font-family:'EB Garamond',Georgia,serif;font-style:italic;font-size:10px;letter-spacing:0.20em;text-transform:uppercase;color:#9b9690;">${title}</p></td></tr>`;
  }

  const person1 = [freigabeVerantwortlicher, emailFreigabeVerantwortlicher].filter(Boolean).join(" · ") || null;
  const themen = contentThemen.length ? contentThemen.join(", ") : null;
  const stil = contentStil.length ? contentStil.join(", ") : null;
  const drehtage = drehtageAnWelchenTagen.length ? drehtageAnWelchenTagen.join(", ") : null;
  const drehtageGesamt = [drehtage, drehtageUhrzeiten].filter(Boolean).join(" · ") || null;

  return `<!DOCTYPE html>
<html lang="de" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
<title>JS Media CRM</title>
<style type="text/css">
@import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Inter:wght@400;500;600&display=swap');
*{box-sizing:border-box;}
body{margin:0;padding:0;background:#f3f1ed;-webkit-font-smoothing:antialiased;}
a{text-decoration:none;}
img{border:0;outline:none;}
@media only screen and (max-width:640px){.ec{padding-left:24px!important;padding-right:24px!important;}}
</style>
</head>
<body style="margin:0;padding:0;background:#f3f1ed;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f3f1ed;padding:40px 16px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;margin:0 auto;">

  <tr><td align="center" style="padding-bottom:24px;">
    <span style="display:inline-block;padding:5px 14px;background:#c8863c;border-radius:999px;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:10.5px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#ffffff;">Neue Einreichung</span>
  </td></tr>

  <tr><td style="background:#ffffff;border-radius:18px;box-shadow:0 1px 4px rgba(0,0,0,0.06),0 4px 24px rgba(0,0,0,0.04);">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">

    <tr><td align="center" class="ec" style="padding:36px 48px 0 48px;">
      <a href="${adminLink}" style="display:inline-block;">
        <img src="https://crm.jonathanscheele.de/logo.png" alt="JS Media" width="48" height="48" style="display:block;width:48px;height:48px;border-radius:11px;"/>
      </a>
    </td></tr>

    <tr><td align="center" class="ec" style="padding:20px 48px 0 48px;">
      <p style="margin:0;font-family:'EB Garamond',Georgia,serif;font-weight:500;font-size:30px;line-height:1.2;color:#111111;letter-spacing:-0.01em;text-align:center;">
        Content-Strategie<br/><em style="font-style:italic;font-weight:400;color:#c8863c;">ausgefüllt.</em>
      </p>
    </td></tr>

    <tr><td align="center" class="ec" style="padding:18px 48px 0 48px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="width:20px;border-top:1px solid #e6e3dd;line-height:0;font-size:0;">&nbsp;</td>
        <td style="padding:0 8px;font-family:'EB Garamond',Georgia,serif;font-size:12px;color:#9b9690;line-height:1;">✦</td>
        <td style="width:20px;border-top:1px solid #e6e3dd;line-height:0;font-size:0;">&nbsp;</td>
      </tr></table>
    </td></tr>

    <tr><td class="ec" style="padding:16px 56px 0 56px;">
      <p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.7;color:#4b5468;text-align:center;">
        <strong style="color:#111;">${unternehmensname}</strong> hat den Content-Strategie-Fragebogen ausgefüllt.<br/>Die Angaben sind im CRM abrufbar.
      </p>
    </td></tr>

    <tr><td class="ec" style="padding:28px 48px 0 48px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e6e3dd;border-radius:12px;overflow:hidden;">

        <tr><td colspan="2" style="padding:10px 18px 8px;background:#f8f7f5;border-bottom:1px solid #e6e3dd;">
          <p style="margin:0;font-family:'EB Garamond',Georgia,serif;font-style:italic;font-size:10px;letter-spacing:0.20em;text-transform:uppercase;color:#9b9690;">Kunde</p>
        </td></tr>
        <tr><td style="padding:10px 18px;width:38%;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:12px;color:#7a766f;border-bottom:1px solid #f0ede8;white-space:nowrap;">Unternehmensname</td><td style="padding:10px 18px;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:13px;font-weight:600;color:#111111;border-bottom:1px solid #f0ede8;">${unternehmensname}</td></tr>
        ${row("Freigabe-Person 1", person1)}

        ${sectionHeader("Strategie-Highlights")}
        ${row("Hauptziel", hauptziel)}
        ${row("Zielgruppe", zielgruppe)}
        ${row("Content-Themen", themen)}
        ${row("Content-Stil", stil)}
        ${row("Drehtage", drehtageGesamt, true)}

      </table>
    </td></tr>

    <tr><td align="center" class="ec" style="padding:28px 48px 0 48px;">
      <a href="${adminLink}" style="display:inline-block;padding:13px 28px;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#ffffff;text-decoration:none;background:#1a1818;border-radius:4px;">
        Im CRM öffnen &nbsp;→
      </a>
    </td></tr>

    <tr><td align="center" class="ec" style="padding:28px 48px 36px 48px;">
      <p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:11px;color:#b0b7c4;letter-spacing:0.04em;text-align:center;line-height:1.7;">
        Automatische Benachrichtigung · JS Media CRM
      </p>
    </td></tr>

  </table>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}
