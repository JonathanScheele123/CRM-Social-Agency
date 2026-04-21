"use client";

import { useState } from "react";
import { useT, useLang } from "@/lib/i18n";

export type KundenprofilFelder = {
  // Grunddaten
  unternehmensname?: string | null;
  ansprechpartner?: string | null;
  emailAnsprechpartner?: string | null;
  telefonnummer?: string | null;
  branche?: string | null;
  webseite?: string | null;
  geschaeftsadresse?: string | null;
  socialMediaKanaele?: string | null;
  // Freigabe & Zugänge
  freigabeVerantwortlicher?: string | null;
  emailFreigabeVerantwortlicher?: string | null;
  freigabeVerantwortlicher2?: string | null;
  emailFreigabeVerantwortlicher2?: string | null;
  cloudLink?: string | null;
  zusatzlinks?: string | null;
  // Vertrag & Status
  statusKunde?: string | null;
  kundenKategorie?: string | null;
  vertragsstart?: Date | null;
  vertraglicheFestgelegtePostAnzahl?: number | null;
  kundenzufriedenheit?: string | null;
  notizenIntern?: string | null;
  // Content-Planung
  besonderheitenPlanung?: string | null;
  // Drehtag
  drehtageAnWelchenTagen?: string[];
  drehtageUhrzeiten?: string | null;
  ansprechpartnerDrehtag?: string | null;
  einschraenkungenVorOrt?: string | null;
  selbstAuftreten?: string | null;
  // Rechtliches
  mitarbeiterImBildRechtlichGeklaert?: string | null;
  mitarbeiterImBildRechtlichGeregelt?: string | null;
  mitarbeiterNichtZeigen?: string | null;
  welcheMitarbeiterNichtZeigen?: string | null;
  sensibleBereiche?: string | null;
  welcheBereicheNichtZeigen?: string | null;
  // Marke & Ziele
  kurzbeschreibung?: string | null;
  kernwerte?: string | null;
  alleinstellungsmerkmale?: string | null;
  zusammenarbeitZiel?: string | null;
  hauptziel?: string | null;
  zielgruppe?: string | null;
  hervorgehobeneDienstleistungen?: string | null;
  haeufigsteProbleme?: string | null;
  haeufigsteEinwaende?: string | null;
  zielgruppeOnlineKanaele?: string[];
  wasKundenLieben?: string | null;
  // Produkte & Events
  heroProdukte?: string | null;
  wiederkehrendeProdukte?: string | null;
  eventsNaechsteMonate?: string | null;
  // Content-Strategie-Fragebogen
  irrtuemerBranche?: string | null;
  geruechteVorurteile?: string | null;
  haeufigsteKundenfragen?: string | null;
  typischeFehlerKunden?: string | null;
  einSacheZielgruppe?: string | null;
  bestPracticesTipps?: string | null;
  contentThemen?: string[];
  contentThemenZusatz?: string | null;
  contentStil?: string[];
};

function Feld({ label, wert }: { label: string; wert: string | null | undefined }) {
  if (!wert) return null;
  return (
    <div>
      <p className="text-xs text-subtle mb-0.5">{label}</p>
      <p className="text-sm text-fg whitespace-pre-wrap">{wert}</p>
    </div>
  );
}

function Tags({ label, werte }: { label: string; werte: string[] | undefined }) {
  if (!werte?.length) return null;
  return (
    <div>
      <p className="text-xs text-subtle mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {werte.map(w => (
          <span key={w} className="text-xs px-2 py-1 rounded-lg bg-elevated border border-divider text-fg">{w}</span>
        ))}
      </div>
    </div>
  );
}

function Sektion({
  titel,
  children,
  defaultOffen = false,
}: {
  titel: string;
  children: React.ReactNode;
  defaultOffen?: boolean;
}) {
  const [offen, setOffen] = useState(defaultOffen);
  return (
    <div className="bg-card border border-divider rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOffen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-elevated/50 transition-colors"
      >
        <span className="font-medium text-fg text-sm">{titel}</span>
        <span className="text-subtle text-xs">{offen ? "▲" : "▼"}</span>
      </button>
      {offen && (
        <div className="px-5 pb-5 border-t border-divider pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {children}
        </div>
      )}
    </div>
  );
}

function FeldBreit({ label, wert }: { label: string; wert: string | null | undefined }) {
  if (!wert) return null;
  return (
    <div className="sm:col-span-2">
      <p className="text-xs text-subtle mb-0.5">{label}</p>
      <p className="text-sm text-fg whitespace-pre-wrap">{wert}</p>
    </div>
  );
}

function TagsBreit({ label, werte }: { label: string; werte: string[] | undefined }) {
  if (!werte?.length) return null;
  return (
    <div className="sm:col-span-2">
      <p className="text-xs text-subtle mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {werte.map(w => (
          <span key={w} className="text-xs px-2 py-1 rounded-lg bg-elevated border border-divider text-fg">{w}</span>
        ))}
      </div>
    </div>
  );
}

export default function KundenprofilSektionen({ profil, kundenAnsicht = false }: { profil: KundenprofilFelder; kundenAnsicht?: boolean }) {
  const t = useT();
  const { lang } = useLang();
  const dateLocale = lang === "de" ? "de-DE" : "en-GB";
  const s = t.kundenprofilSektionen;
  const datumFmt = (d: Date | null | undefined) =>
    d ? new Date(d).toLocaleDateString(dateLocale) : null;

  return (
    <div className="space-y-2">

      <Sektion titel={s.grunddaten} defaultOffen>
        <Feld label={s.unternehmensname} wert={profil.unternehmensname} />
        <Feld label={s.ansprechpartner} wert={profil.ansprechpartner} />
        <Feld label={s.email} wert={profil.emailAnsprechpartner} />
        <Feld label={s.telefon} wert={profil.telefonnummer} />
        <Feld label={s.branche} wert={profil.branche} />
        <Feld label={s.webseite} wert={profil.webseite} />
        <FeldBreit label={s.adresse} wert={profil.geschaeftsadresse} />
        <FeldBreit label={s.socialMedia} wert={profil.socialMediaKanaele} />
      </Sektion>

      <Sektion titel={s.freigabeZugaenge}>
        <Feld label={s.freigabePerson1} wert={profil.freigabeVerantwortlicher} />
        <Feld label={s.emailPerson1} wert={profil.emailFreigabeVerantwortlicher} />
        <Feld label={s.freigabePerson2} wert={profil.freigabeVerantwortlicher2} />
        <Feld label={s.emailPerson2} wert={profil.emailFreigabeVerantwortlicher2} />
        <FeldBreit label={s.cloudLink} wert={profil.cloudLink} />
        <FeldBreit label={s.zusatzlinks} wert={profil.zusatzlinks} />
      </Sektion>

      <Sektion titel={s.vertragStatus}>
        {!kundenAnsicht && <Feld label={s.statusLabel} wert={profil.statusKunde} />}
        {!kundenAnsicht && <Feld label={s.kategorie} wert={profil.kundenKategorie} />}
        <Feld label={s.vertragsstart} wert={datumFmt(profil.vertragsstart)} />
        <Feld label={s.postAnzahl} wert={profil.vertraglicheFestgelegtePostAnzahl?.toString()} />
        {!kundenAnsicht && <Feld label={s.kundenzufriedenheit} wert={profil.kundenzufriedenheit} />}
        {!kundenAnsicht && <FeldBreit label={s.interneNotizen} wert={profil.notizenIntern} />}
      </Sektion>

      <Sektion titel={s.markeZiele}>
        <FeldBreit label={s.kurzbeschreibung} wert={profil.kurzbeschreibung} />
        <FeldBreit label={s.kernwerte} wert={profil.kernwerte} />
        <FeldBreit label={s.alleinstellungsmerkmale} wert={profil.alleinstellungsmerkmale} />
        <Feld label={s.zusammenarbeitZiel} wert={profil.zusammenarbeitZiel} />
        <FeldBreit label={s.hauptziel} wert={profil.hauptziel} />
        <FeldBreit label={s.idealerKunde} wert={profil.zielgruppe} />
        <FeldBreit label={s.hervorgehobeneDL} wert={profil.hervorgehobeneDienstleistungen} />
        <FeldBreit label={s.haeufigsteProbleme} wert={profil.haeufigsteProbleme} />
        <FeldBreit label={s.haeufigsteEinwaende} wert={profil.haeufigsteEinwaende} />
        <TagsBreit label={s.zielgruppeOnline} werte={profil.zielgruppeOnlineKanaele} />
        <FeldBreit label={s.wasKundenLieben} wert={profil.wasKundenLieben} />
      </Sektion>

      <Sektion titel={s.produkteEvents}>
        <FeldBreit label={s.heroProdukte} wert={profil.heroProdukte} />
        <FeldBreit label={s.wiederkehrendeProdukte} wert={profil.wiederkehrendeProdukte} />
        <FeldBreit label={s.events} wert={profil.eventsNaechsteMonate} />
      </Sektion>

      <Sektion titel={s.contentStrategie}>
        <FeldBreit label={s.irrtuemerBranche} wert={profil.irrtuemerBranche} />
        <FeldBreit label={s.geruechteVorurteile} wert={profil.geruechteVorurteile} />
        <FeldBreit label={s.haeufigsteKundenfragen} wert={profil.haeufigsteKundenfragen} />
        <FeldBreit label={s.typischeFehler} wert={profil.typischeFehlerKunden} />
        <FeldBreit label={s.einSache} wert={profil.einSacheZielgruppe} />
        <FeldBreit label={s.bestPractices} wert={profil.bestPracticesTipps} />
        <TagsBreit label={s.contentThemen} werte={profil.contentThemen} />
        <FeldBreit label={s.weitereThemen} wert={profil.contentThemenZusatz} />
        <TagsBreit label={s.stil} werte={profil.contentStil} />
      </Sektion>

      <Sektion titel={s.contentPlanung}>
        <FeldBreit label={s.besonderheiten} wert={profil.besonderheitenPlanung} />
      </Sektion>

      <Sektion titel={s.rechtliches}>
        <Feld label={s.mitarbeiterGeklaert} wert={profil.mitarbeiterImBildRechtlichGeklaert} />
        <Feld label={s.mitarbeiterGeregelt} wert={profil.mitarbeiterImBildRechtlichGeregelt} />
        <Feld label={s.mitarbeiterNichtZeigen} wert={profil.mitarbeiterNichtZeigen} />
        <FeldBreit label={s.welcheMitarbeiter} wert={profil.welcheMitarbeiterNichtZeigen} />
        <Feld label={s.sensibleBereiche} wert={profil.sensibleBereiche} />
        <FeldBreit label={s.welcheBereiche} wert={profil.welcheBereicheNichtZeigen} />
      </Sektion>

      <Sektion titel={s.drehtag}>
        <TagsBreit label={s.drehtageWelcheTage} werte={profil.drehtageAnWelchenTagen} />
        <Feld label={s.drehtageUhrzeiten} wert={profil.drehtageUhrzeiten} />
        <Feld label={s.ansprechpartnerDrehtag} wert={profil.ansprechpartnerDrehtag} />
        <FeldBreit label={s.einschraenkungenVorOrt} wert={profil.einschraenkungenVorOrt} />
        <Feld label={s.selbstAuftreten} wert={profil.selbstAuftreten} />
      </Sektion>

    </div>
  );
}
