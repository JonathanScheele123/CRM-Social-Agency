const STRING_FELDER = [
  "unternehmensname", "ansprechpartner", "geschaeftsadresse", "emailAnsprechpartner",
  "branche", "telefonnummer", "webseite", "emailDirekt", "socialMediaKanaele",
  "freigabeVerantwortlicher", "emailFreigabeVerantwortlicher",
  "freigabeVerantwortlicher2", "emailFreigabeVerantwortlicher2",
  "cloudLink", "kundeDriveLink", "zusatzlinks",
  "linkInstagram", "linkFacebook", "linkTikTok", "linkYouTube",
  "statusKunde", "kundenKategorie", "kundenzufriedenheit", "archiv", "kundenfeedback",
  "notizenIntern", "contentIdeen", "postingKalender", "mitarbeiterImBildRechtlichGeklaert",
  "mitarbeiterImBildRechtlichGeregelt", "mitarbeiterNichtZeigen", "welcheMitarbeiterNichtZeigen",
  "sensibleBereiche", "welcheBereicheNichtZeigen", "drehtageUhrzeiten", "ansprechpartnerDrehtag",
  "einschraenkungenVorOrt", "selbstAuftreten", "kurzbeschreibung", "kernwerte",
  "alleinstellungsmerkmale", "haeufigsteProbleme", "haeufigsteEinwaende", "zielgruppeOnline",
  "wasKundenLieben", "zielgruppe", "hauptziel", "heroProdukte", "wiederkehrendeProdukte",
  "eventsNaechsteMonate", "besonderheitenPlanung", "herausforderungen", "vorbereiteteFragenBesprechen",
  "zusammenarbeitZiel", "hervorgehobeneDienstleistungen", "irrtuemerBranche",
  "geruechteVorurteile", "haeufigsteKundenfragen", "typischeFehlerKunden",
  "einSacheZielgruppe", "bestPracticesTipps", "contentThemenZusatz",
  "startVideoUrl", "dsgvoStatus",
] as const;

const ARRAY_FELDER = [
  "contentPlan", "drehtageAnWelchenTagen",
  "zielgruppeOnlineKanaele", "contentThemen", "contentStil", "startFaqItems",
] as const;

const ZAHL_FELDER = [
  "vertraglicheFestgelegtePostAnzahl",
  "limitReel", "limitStory", "limitBild", "limitKarussell",
] as const;

const DATUM_FELDER = [
  "vertragsstart", "letzterKontakt", "wunschdatum", "limitGesperrtAb", "dsgvoLoeschdatum",
] as const;

const BOOL_FELDER = [
  "keinMarketing", "verarbeitungEinschraenken", "kpisFreigegeben",
] as const;

export function bereinigeDaten(daten: Record<string, unknown>): Record<string, unknown> {
  const ergebnis: Record<string, unknown> = {};

  for (const feld of STRING_FELDER) {
    if (feld in daten) ergebnis[feld] = daten[feld] === "" ? null : daten[feld];
  }
  for (const feld of ARRAY_FELDER) {
    if (feld in daten) ergebnis[feld] = Array.isArray(daten[feld]) ? daten[feld] : [];
  }
  for (const feld of ZAHL_FELDER) {
    if (feld in daten) {
      ergebnis[feld] = daten[feld] === "" || daten[feld] == null ? null : Number(daten[feld]);
    }
  }
  for (const feld of DATUM_FELDER) {
    if (feld in daten) {
      ergebnis[feld] = daten[feld] === "" || daten[feld] == null ? null : new Date(daten[feld] as string);
    }
  }
  for (const feld of BOOL_FELDER) {
    if (feld in daten) ergebnis[feld] = daten[feld] === true || daten[feld] === "true";
  }

  return ergebnis;
}
