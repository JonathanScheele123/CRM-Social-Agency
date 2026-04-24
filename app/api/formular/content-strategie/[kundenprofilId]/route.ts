import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { sendEmail } from "@/lib/email";
import { sendSms } from "@/lib/sms";
import { benachrichtigungContentStrategieHtml } from "@/lib/benachrichtigung-content-strategie-email";

const ADMIN_PHONE = "+4917184688848";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ kundenprofilId: string }> }
) {
  const { kundenprofilId } = await params;
  const d = await req.json();

  const exists = await prisma.kundenprofil.findUnique({ where: { id: kundenprofilId }, select: { id: true } });
  if (!exists) {
    return Response.json({ fehler: "Kundenprofil nicht gefunden." }, { status: 404 });
  }

  await prisma.kundenprofil.update({
    where: { id: kundenprofilId },
    data: {
      unternehmensname:               d.unternehmensname || undefined,
      kurzbeschreibung:               d.kurzbeschreibung || null,
      kernwerte:                      d.kernwerte || null,
      alleinstellungsmerkmale:        d.alleinstellungsmerkmale || null,
      zusammenarbeitZiel:             d.zusammenarbeitZiel || null,
      hauptziel:                      d.hauptziel || null,
      zielgruppe:                     d.zielgruppe || null,
      hervorgehobeneDienstleistungen: d.hervorgehobeneDienstleistungen || null,
      haeufigsteProbleme:             d.haeufigsteProbleme || null,
      haeufigsteEinwaende:            d.haeufigsteEinwaende || null,
      zielgruppeOnlineKanaele:        Array.isArray(d.zielgruppeOnlineKanaele) ? d.zielgruppeOnlineKanaele : [],
      wasKundenLieben:                d.wasKundenLieben || null,
      heroProdukte:                   d.heroProdukte || null,
      wiederkehrendeProdukte:         d.wiederkehrendeProdukte || null,
      eventsNaechsteMonate:           d.eventsNaechsteMonate || null,
      irrtuemerBranche:               d.irrtuemerBranche || null,
      geruechteVorurteile:            d.geruechteVorurteile || null,
      haeufigsteKundenfragen:         d.haeufigsteKundenfragen || null,
      typischeFehlerKunden:           d.typischeFehlerKunden || null,
      einSacheZielgruppe:             d.einSacheZielgruppe || null,
      bestPracticesTipps:             d.bestPracticesTipps || null,
      contentThemen:                  Array.isArray(d.contentThemen) ? d.contentThemen : [],
      contentThemenZusatz:            d.contentThemenZusatz || null,
      contentStil:                    Array.isArray(d.contentStil) ? d.contentStil : [],
      freigabeVerantwortlicher:       d.freigabeVerantwortlicher || undefined,
      besonderheitenPlanung:          d.besonderheitenPlanung || null,
      mitarbeiterImBildRechtlichGeklaert: d.mitarbeiterImBildRechtlichGeklaert || null,
      mitarbeiterImBildRechtlichGeregelt: d.mitarbeiterImBildRechtlichGeregelt || null,
      mitarbeiterNichtZeigen:         d.mitarbeiterNichtZeigen || null,
      welcheMitarbeiterNichtZeigen:   d.welcheMitarbeiterNichtZeigen || null,
      sensibleBereiche:               d.sensibleBereiche || null,
      welcheBereicheNichtZeigen:      d.welcheBereicheNichtZeigen || null,
      drehtageAnWelchenTagen:         Array.isArray(d.drehtageAnWelchenTagen) ? d.drehtageAnWelchenTagen : [],
      drehtageUhrzeiten:              d.drehtageUhrzeiten || null,
      ansprechpartnerDrehtag:         d.ansprechpartnerDrehtag || null,
      einschraenkungenVorOrt:         d.einschraenkungenVorOrt || null,
      selbstAuftreten:                d.selbstAuftreten || null,
    },
  });

  // ── Admin-Benachrichtigung ─────────────────────────────────────────────────
  try {
    const profil = await prisma.kundenprofil.findUnique({
      where: { id: kundenprofilId },
      select: {
        unternehmensname: true,
        freigabeVerantwortlicher: true,
        emailFreigabeVerantwortlicher: true,
        hauptziel: true,
        zielgruppe: true,
        contentThemen: true,
        contentStil: true,
        drehtageAnWelchenTagen: true,
        drehtageUhrzeiten: true,
      },
    });

    if (profil) {
      const base = (process.env.NEXTAUTH_URL ?? "https://crm.jonathanscheele.de").replace(/\/$/, "");
      const adminLink = `${base}/admin/kunden/${kundenprofilId}`;
      const unternehmensname = profil.unternehmensname ?? "Unbekannt";

      const html = benachrichtigungContentStrategieHtml({
        unternehmensname,
        freigabeVerantwortlicher: profil.freigabeVerantwortlicher,
        emailFreigabeVerantwortlicher: profil.emailFreigabeVerantwortlicher,
        hauptziel: profil.hauptziel,
        zielgruppe: profil.zielgruppe,
        contentThemen: profil.contentThemen,
        contentStil: profil.contentStil,
        drehtageAnWelchenTagen: profil.drehtageAnWelchenTagen,
        drehtageUhrzeiten: profil.drehtageUhrzeiten,
        adminLink,
      });

      await sendEmail({
        to: "kontakt@jonathanscheele.de",
        subject: `Content-Strategie ausgefüllt: ${unternehmensname}`,
        text: `${unternehmensname} hat den Content-Strategie-Fragebogen ausgefüllt.\n\nIm CRM öffnen: ${adminLink}`,
        html,
      });
    }
  } catch (e) {
    console.error("[content-strategie] Admin-Benachrichtigung fehlgeschlagen:", e);
  }

  // ── SMS-Benachrichtigung ───────────────────────────────────────────────────
  try {
    const profil = await prisma.kundenprofil.findUnique({
      where: { id: kundenprofilId },
      select: { unternehmensname: true },
    });
    await sendSms(ADMIN_PHONE, `📊 Content-Strategie ausgefüllt: ${profil?.unternehmensname ?? "Unbekannt"}`);
  } catch (e) {
    console.error("[content-strategie] SMS fehlgeschlagen:", e);
  }

  return Response.json({ success: true }, { status: 200 });
}
