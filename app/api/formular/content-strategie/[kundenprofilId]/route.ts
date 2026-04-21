import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

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

  return Response.json({ success: true }, { status: 200 });
}
