import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

function fristDatum(): string {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" });
}

function generateHtml(name: string, total: number, typen: { name: string; count: number }[], frist: string): string {
  const typeRows = typen
    .filter((t) => t.count > 0)
    .map(
      (t) => `
      <tr>
        <td style="padding:5px 32px 5px 0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:13px;color:#4b5468;text-align:left;white-space:nowrap;">${t.name}</td>
        <td style="padding:5px 0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:13px;font-weight:600;color:#111111;text-align:right;white-space:nowrap;">${t.count}</td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="de" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>JS Media</title>
  <style type="text/css">
    @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Inter:wght@400;500;600&display=swap');
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; background-color: #ffffff; -webkit-font-smoothing: antialiased; }
    a { text-decoration: none; }
    img { border: 0; outline: none; }
    @media only screen and (max-width: 640px) {
      .ec { padding-left: 24px !important; padding-right: 24px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;">

  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#ffffff;">
    Ihre Content-Ideen sind bereit zur Freigabe – bitte prüfen und freigeben bis zum ${frist}.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
    style="margin:0;padding:0;background:#ffffff;background-image:radial-gradient(ellipse at 14% 6%, rgba(41,42,145,0.09) 0%, rgba(41,42,145,0) 52%), radial-gradient(ellipse at 86% 96%, rgba(41,42,145,0.07) 0%, rgba(41,42,145,0) 54%), radial-gradient(ellipse at 88% 8%, rgba(236,72,153,0.06) 0%, rgba(236,72,153,0) 44%);">
    <tr>
      <td align="center" style="padding:56px 16px 56px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"
          style="width:600px;max-width:600px;margin:0 auto;background:transparent;">

          <!-- Logo -->
          <tr>
            <td align="center" class="ec" style="padding:0 48px;">
              <a href="https://www.js-media.de" style="display:inline-block;">
                <img src="/logo.png" alt="JS Media" width="64" height="64"
                  style="display:block;width:64px;height:64px;border-radius:14px;border:0;" />
              </a>
            </td>
          </tr>

          <!-- Headline -->
          <tr>
            <td align="center" class="ec" style="padding:28px 48px 0 48px;">
              <p style="margin:0;font-family:'EB Garamond',Georgia,'Times New Roman',serif;font-weight:500;font-size:34px;line-height:1.15;color:#111111;letter-spacing:-0.01em;text-align:center;">
                Ihre Content&#8209;Ideen sind<br/>
                <em style="font-style:italic;font-weight:400;color:#2a2a2a;">bereit zur Bewertung.</em>
              </p>
            </td>
          </tr>

          <!-- Ornament -->
          <tr>
            <td align="center" class="ec" style="padding:22px 48px 0 48px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="width:24px;border-top:1px solid #c8c4bc;line-height:0;font-size:0;">&nbsp;</td>
                  <td style="padding:0 10px;font-family:'EB Garamond',Georgia,serif;font-size:13px;color:#6b6b6b;line-height:1;">✦</td>
                  <td style="width:24px;border-top:1px solid #c8c4bc;line-height:0;font-size:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td align="center" class="ec" style="padding:22px 72px 0 72px;">
              <p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.75;color:#4b5468;text-align:center;">
                Hallo ${name},
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td class="ec" style="padding:16px 72px 0 72px;">
              <p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.75;color:#2a2a2a;text-align:center;">
                wir haben neue Content-Ideen für Ihren Account vorbereitet. Bitte prüfen Sie die Vorschläge und geben Sie diese frei — damit wir die Produktion rechtzeitig starten können.
              </p>
            </td>
          </tr>

          <!-- Stats box -->
          <tr>
            <td align="center" class="ec" style="padding:36px 48px 0 48px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                style="border-top:1px solid #e6e3dd;border-bottom:1px solid #e6e3dd;">
                <tr>
                  <td align="center" style="padding:26px 4px 26px 4px;">
                    <p style="margin:0 0 18px;font-family:'EB Garamond',Georgia,serif;font-style:italic;font-size:10.5px;letter-spacing:0.20em;text-transform:uppercase;color:#8a8680;line-height:1;text-align:center;">
                      Ihre Vorschläge im Überblick
                    </p>
                    <p style="margin:0 0 4px;font-family:'EB Garamond',Georgia,serif;font-weight:500;font-size:48px;line-height:1;color:#111111;text-align:center;">
                      ${total}
                    </p>
                    <p style="margin:0 0 20px;font-family:'EB Garamond',Georgia,serif;font-style:italic;font-size:16px;color:#7a766f;text-align:center;">
                      Ideen zur Freigabe
                    </p>
                    <table role="presentation" width="80%" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 20px auto;">
                      <tr><td style="border-top:1px solid #e6e3dd;line-height:0;font-size:0;">&nbsp;</td></tr>
                    </table>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
                      ${typeRows}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Deadline -->
          <tr>
            <td class="ec" style="padding:28px 72px 0 72px;">
              <p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.75;color:#2a2a2a;text-align:center;">
                Bitte geben Sie die Ideen bis zum
                <strong style="color:#111111;">${frist}</strong>
                frei.
              </p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" class="ec" style="padding:36px 48px 0 48px;">
              <!--[if mso]>
              <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://app.js-media.de/login?callbackUrl=%2Fdashboard%23content" style="height:52px;v-text-anchor:middle;width:240px;" arcsize="50%" stroke="f" fillcolor="#292a91">
                <w:anchorlock/><center style="color:#fff;font-family:Helvetica,Arial,sans-serif;font-size:12px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;">Ideen freigeben →</center>
              </v:roundrect><![endif]-->
              <!--[if !mso]><!-->
              <a href="https://app.js-media.de/login?callbackUrl=%2Fdashboard%23content"
                style="display:inline-block;padding:16px 38px;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:12px;font-weight:600;letter-spacing:0.20em;text-transform:uppercase;color:#111111;text-decoration:none;background-color:rgba(255,255,255,0.30);background-image:linear-gradient(180deg,rgba(255,255,255,0.60) 0%,rgba(255,255,255,0.20) 38%,rgba(255,255,255,0.08) 62%,rgba(255,255,255,0.35) 100%);border-radius:999px;box-shadow:0 1px 0 rgba(255,255,255,0.9) inset,0 -1px 0 rgba(255,255,255,0.35) inset,0 0 0 1px rgba(255,255,255,0.55) inset,0 0 0 1px rgba(17,17,17,0.06),0 8px 24px rgba(17,17,17,0.08),0 2px 6px rgba(17,17,17,0.04),-10px -6px 28px rgba(41,42,145,0.18),10px 6px 28px rgba(41,42,145,0.13);backdrop-filter:blur(22px) saturate(180%);-webkit-backdrop-filter:blur(22px) saturate(180%);">
                Ideen freigeben&nbsp;&nbsp;→
              </a>
              <!--<![endif]-->
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td class="ec" style="padding:40px 48px 0 48px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="border-top:1px solid #e6e3dd;line-height:0;font-size:0;">&nbsp;</td></tr>
              </table>
            </td>
          </tr>

          <!-- Sign-off -->
          <tr>
            <td class="ec" style="padding:28px 72px 0 72px;">
              <p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.7;color:#2a2a2a;text-align:center;">
                Bei Fragen stehen wir jederzeit zur Verfügung —<br/>antworten Sie einfach auf diese E-Mail.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" class="ec" style="padding:10px 48px 0 48px;">
              <p style="margin:0;font-family:'EB Garamond',Georgia,'Times New Roman',serif;font-style:italic;font-size:19px;color:#111111;text-align:center;line-height:1.3;">
                Jonathan Scheele
              </p>
              <p style="margin:5px 0 0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:11px;font-weight:500;color:#7a766f;text-align:center;letter-spacing:0.18em;text-transform:uppercase;line-height:1;">
                JS Media
              </p>
            </td>
          </tr>

          <!-- Footer separator -->
          <tr>
            <td class="ec" style="padding:36px 48px 0 48px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="border-top:1px solid #e6e3dd;line-height:0;font-size:0;">&nbsp;</td></tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" class="ec" style="padding:20px 48px 0 48px;">
              <p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:11px;line-height:1.9;color:#8a8680;letter-spacing:0.06em;text-align:center;">
                JS&nbsp;Media · Jonathan Scheele<br />
                Enderstraße 94 · 01277 Dresden<br />
                <a href="tel:+4901718468848" style="color:#8a8680;text-decoration:none;">0171 846 88 48</a>
                &nbsp;·&nbsp;
                <a href="mailto:kontakt@jonathanscheele.de" style="color:#8a8680;text-decoration:none;">kontakt@jonathanscheele.de</a><br />
                <a href="https://www.js-media.de" style="color:#292a91;text-decoration:none;font-weight:500;">www.js-media.de</a>
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" class="ec" style="padding:10px 48px 48px 48px;">
              <p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:10.5px;color:#b0b7c4;letter-spacing:0.04em;text-align:center;line-height:1.7;">
                Sie erhalten diese Nachricht, weil Sie als Freigabe-Verantwortlicher hinterlegt sind.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
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
        ansprechpartner: true,
        emailAnsprechpartner: true,
        freigabeVerantwortlicher: true,
        emailFreigabeVerantwortlicher: true,
        freigabeVerantwortlicher2: true,
        emailFreigabeVerantwortlicher2: true,
        contentIdeen_: { select: { contentTyp: true } },
      },
    });
  } catch (e) {
    console.error("[content-ideen-email] DB-Fehler:", e);
    return Response.json({ fehler: "Datenbankfehler." }, { status: 500 });
  }

  if (!kunde) return Response.json({ fehler: "Kunde nicht gefunden." }, { status: 404 });

  const empfaenger: { name: string; email: string }[] = [
    { name: kunde.ansprechpartner, email: kunde.emailAnsprechpartner },
    { name: kunde.freigabeVerantwortlicher, email: kunde.emailFreigabeVerantwortlicher },
    { name: kunde.freigabeVerantwortlicher2, email: kunde.emailFreigabeVerantwortlicher2 },
  ].filter((e): e is { name: string; email: string } =>
    typeof e.email === "string" && e.email.trim().length > 0
  );

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

  const fehler: string[] = [];
  for (const emp of empfaenger) {
    const name = emp.name?.trim() || emp.email;
    const html = generateHtml(name, total, typen, frist);
    try {
      await sendEmail({
        to: emp.email,
        subject: "Ihre Content-Ideen sind bereit zur Bewertung · JS Media",
        text: `Hallo ${name},\n\nIhre Content-Ideen sind bereit zur Bewertung. Bitte melden Sie sich an und geben Sie die ${total} Vorschläge bis zum ${frist} frei.\n\nhttps://app.js-media.de/login?callbackUrl=%2Fdashboard%23content\n\nBei Fragen antworten Sie einfach auf diese E-Mail.\n\nJonathan Scheele · JS Media`,
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
