"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ─── Typen ──────────────────────────────────────────────────────────────────

export type KundenprofilFormDaten = {
  unternehmensname: string;
  ansprechpartner: string;
  geschaeftsadresse: string;
  emailAnsprechpartner: string;
  branche: string;
  telefonnummer: string;
  webseite: string;
  emailDirekt: string;
  socialMediaKanaele: string;
  freigabeVerantwortlicher: string;
  emailFreigabeVerantwortlicher: string;
  cloudLink: string;
  zusatzlinks: string;
  vertragsstart: string;
  letzterKontakt: string;
  statusKunde: string;
  kundenKategorie: string;
  kundenzufriedenheit: string;
  vertraglicheFestgelegtePostAnzahl: string;
  archiv: string;
  kundenfeedback: string;
  notizenIntern: string;
  contentIdeen: string;
  contentPlan: string[];
  postingKalender: string;
  besonderheitenPlanung: string;
  mitarbeiterImBildRechtlichGeklaert: string;
  mitarbeiterImBildRechtlichGeregelt: string;
  mitarbeiterNichtZeigen: string;
  welcheMitarbeiterNichtZeigen: string;
  sensibleBereiche: string;
  welcheBereicheNichtZeigen: string;
  drehtageAnWelchenTagen: string[];
  drehtageUhrzeiten: string;
  ansprechpartnerDrehtag: string;
  einschraenkungenVorOrt: string;
  selbstAuftreten: string;
  wunschdatum: string;
  kurzbeschreibung: string;
  kernwerte: string;
  alleinstellungsmerkmale: string;
  haeufigsteProbleme: string;
  haeufigsteEinwaende: string;
  zielgruppeOnline: string;
  wasKundenLieben: string;
  zielgruppe: string;
  hauptziel: string;
  heroProdukte: string;
  wiederkehrendeProdukte: string;
  eventsNaechsteMonate: string;
  herausforderungen: string;
  vorbereiteteFragenBesprechen: string;
};

export const LEERES_FORMULAR: KundenprofilFormDaten = {
  unternehmensname: "", ansprechpartner: "", geschaeftsadresse: "",
  emailAnsprechpartner: "", branche: "", telefonnummer: "", webseite: "",
  emailDirekt: "", socialMediaKanaele: "",
  freigabeVerantwortlicher: "", emailFreigabeVerantwortlicher: "",
  cloudLink: "", zusatzlinks: "",
  vertragsstart: "", letzterKontakt: "", statusKunde: "",
  kundenKategorie: "", kundenzufriedenheit: "",
  vertraglicheFestgelegtePostAnzahl: "", archiv: "", kundenfeedback: "",
  notizenIntern: "", contentIdeen: "", contentPlan: [], postingKalender: "",
  besonderheitenPlanung: "",
  mitarbeiterImBildRechtlichGeklaert: "", mitarbeiterImBildRechtlichGeregelt: "",
  mitarbeiterNichtZeigen: "", welcheMitarbeiterNichtZeigen: "",
  sensibleBereiche: "", welcheBereicheNichtZeigen: "",
  drehtageAnWelchenTagen: [], drehtageUhrzeiten: "", ansprechpartnerDrehtag: "",
  einschraenkungenVorOrt: "", selbstAuftreten: "", wunschdatum: "",
  kurzbeschreibung: "", kernwerte: "", alleinstellungsmerkmale: "",
  haeufigsteProbleme: "", haeufigsteEinwaende: "", zielgruppeOnline: "",
  wasKundenLieben: "", zielgruppe: "", hauptziel: "",
  heroProdukte: "", wiederkehrendeProdukte: "", eventsNaechsteMonate: "",
  herausforderungen: "", vorbereiteteFragenBesprechen: "",
};

// ─── Hilfkomponenten ─────────────────────────────────────────────────────────

function Feld({ label, pflicht, children }: { label: string; pflicht?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm text-gray-300 mb-1.5">
        {label}
        {pflicht && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputKlasse = "w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors";
const textareaKlasse = `${inputKlasse} min-h-[80px] resize-y`;
const selectKlasse = `${inputKlasse}`;

function TextInput({ name, wert, onChange, placeholder }: {
  name: keyof KundenprofilFormDaten; wert: string; onChange: (n: keyof KundenprofilFormDaten, v: string) => void; placeholder?: string;
}) {
  return (
    <input type="text" value={wert} onChange={e => onChange(name, e.target.value)}
      placeholder={placeholder} className={inputKlasse} />
  );
}

function TextArea({ name, wert, onChange, placeholder }: {
  name: keyof KundenprofilFormDaten; wert: string; onChange: (n: keyof KundenprofilFormDaten, v: string) => void; placeholder?: string;
}) {
  return (
    <textarea value={wert} onChange={e => onChange(name, e.target.value)}
      placeholder={placeholder} className={textareaKlasse} />
  );
}

function SelectInput({ name, wert, onChange, optionen }: {
  name: keyof KundenprofilFormDaten; wert: string; onChange: (n: keyof KundenprofilFormDaten, v: string) => void;
  optionen: string[];
}) {
  return (
    <select value={wert} onChange={e => onChange(name, e.target.value)} className={selectKlasse}>
      <option value="">– Bitte wählen –</option>
      {optionen.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function JaNeinUnsicher({ name, wert, onChange }: {
  name: keyof KundenprofilFormDaten; wert: string; onChange: (n: keyof KundenprofilFormDaten, v: string) => void;
}) {
  return (
    <SelectInput name={name} wert={wert} onChange={onChange}
      optionen={["Ja", "Nein", "Ich bin mir unsicher"]} />
  );
}

function MultiCheckbox({ name, wert, onChange, optionen }: {
  name: keyof KundenprofilFormDaten; wert: string[]; onChange: (n: keyof KundenprofilFormDaten, v: string[]) => void;
  optionen: string[];
}) {
  function toggle(option: string) {
    onChange(name, wert.includes(option) ? wert.filter(v => v !== option) : [...wert, option]);
  }
  return (
    <div className="flex flex-wrap gap-2">
      {optionen.map(o => (
        <button key={o} type="button" onClick={() => toggle(o)}
          className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
            wert.includes(o)
              ? "bg-blue-600 border-blue-500 text-white"
              : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500"
          }`}>
          {o}
        </button>
      ))}
    </div>
  );
}

function Abschnitt({ titel, children }: { titel: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{titel}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function VollBreit({ children }: { children: React.ReactNode }) {
  return <div className="sm:col-span-2">{children}</div>;
}

// ─── Tabs ────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "grunddaten", label: "Grunddaten" },
  { id: "freigabe", label: "Freigabe & Vertrag" },
  { id: "content", label: "Content & Planung" },
  { id: "drehtag", label: "Drehtag" },
  { id: "rechtliches", label: "Rechtliches" },
  { id: "marke", label: "Marke & Ziele" },
  { id: "produkte", label: "Produkte & Events" },
];

// ─── Haupt-Component ─────────────────────────────────────────────────────────

type Props = {
  initialDaten?: Partial<KundenprofilFormDaten>;
  modus: "erstellen" | "bearbeiten";
  kundeId?: string;
};

export default function KundenprofilForm({ initialDaten, modus, kundeId }: Props) {
  const router = useRouter();
  const [aktuellerTab, setAktuellerTab] = useState("grunddaten");
  const [laden, setLaden] = useState(false);
  const [fehler, setFehler] = useState("");
  const [gespeichert, setGespeichert] = useState(false);

  const [formDaten, setFormDaten] = useState<KundenprofilFormDaten>({
    ...LEERES_FORMULAR,
    ...initialDaten,
  });

  function onChange(name: keyof KundenprofilFormDaten, wert: string | string[]) {
    setFormDaten(prev => ({ ...prev, [name]: wert }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLaden(true);
    setFehler("");

    const url = modus === "erstellen"
      ? "/api/admin/kunden"
      : `/api/admin/kunden/${kundeId}`;

    const res = await fetch(url, {
      method: modus === "erstellen" ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formDaten),
    });

    setLaden(false);

    if (!res.ok) {
      const data = await res.json();
      setFehler(data.fehler ?? "Ein Fehler ist aufgetreten.");
      return;
    }

    const data = await res.json();
    setGespeichert(true);

    setTimeout(() => {
      router.push(`/admin/kunden/${modus === "erstellen" ? data.id : kundeId}`);
      router.refresh();
    }, 800);
  }

  async function handleLoeschen() {
    if (!confirm("Kunden wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.")) return;
    const res = await fetch(`/api/admin/kunden/${kundeId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-4 sm:px-6 py-4 sticky top-0 bg-gray-950 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => router.back()} className="text-gray-400 hover:text-white text-sm shrink-0">
              ← Zurück
            </button>
            <span className="text-gray-600">/</span>
            <h1 className="font-medium truncate">
              {modus === "erstellen" ? "Neuer Kunde" : (formDaten.unternehmensname || "Kunde bearbeiten")}
            </h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {modus === "bearbeiten" && (
              <button type="button" onClick={handleLoeschen}
                className="text-red-400 hover:text-red-300 text-sm px-3 py-1.5 rounded-lg hover:bg-red-950/30 transition-colors">
                Löschen
              </button>
            )}
            <button type="submit" form="kunden-form" disabled={laden || gespeichert}
              className={`text-sm px-4 py-2 rounded-xl font-medium transition-colors ${
                gespeichert
                  ? "bg-green-600 text-white cursor-default"
                  : "bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white"
              }`}>
              {gespeichert ? "✓ Gespeichert" : laden ? "Speichern..." : modus === "erstellen" ? "Erstellen" : "Speichern"}
            </button>
          </div>
        </div>
      </header>

      {/* Tab-Navigation */}
      <div className="border-b border-gray-800 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex gap-0 overflow-x-auto scrollbar-hide">
          {TABS.map(tab => (
            <button key={tab.id} type="button" onClick={() => setAktuellerTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                aktuellerTab === tab.id
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <form id="kunden-form" onSubmit={handleSubmit}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          {fehler && (
            <div className="mb-4 text-red-400 text-sm bg-red-950 border border-red-800 rounded-xl px-4 py-3">
              {fehler}
            </div>
          )}

          {/* ── Tab: Grunddaten ── */}
          {aktuellerTab === "grunddaten" && (
            <div>
              <Abschnitt titel="Kontaktdaten">
                <Feld label="Unternehmensname" pflicht>
                  <TextInput name="unternehmensname" wert={formDaten.unternehmensname} onChange={onChange} placeholder="Mustermann GmbH" />
                </Feld>
                <Feld label="Branche">
                  <TextInput name="branche" wert={formDaten.branche} onChange={onChange} placeholder="Handwerk, Gastronomie, ..." />
                </Feld>
                <Feld label="Ansprechpartner">
                  <TextInput name="ansprechpartner" wert={formDaten.ansprechpartner} onChange={onChange} placeholder="Max Mustermann" />
                </Feld>
                <Feld label="E-Mail Ansprechpartner">
                  <TextInput name="emailAnsprechpartner" wert={formDaten.emailAnsprechpartner} onChange={onChange} placeholder="max@unternehmen.de" />
                </Feld>
                <Feld label="Telefonnummer">
                  <TextInput name="telefonnummer" wert={formDaten.telefonnummer} onChange={onChange} placeholder="+49 ..." />
                </Feld>
                <Feld label="E-Mail (direkt)">
                  <TextInput name="emailDirekt" wert={formDaten.emailDirekt} onChange={onChange} placeholder="info@unternehmen.de" />
                </Feld>
                <Feld label="Webseite">
                  <TextInput name="webseite" wert={formDaten.webseite} onChange={onChange} placeholder="https://..." />
                </Feld>
                <VollBreit>
                  <Feld label="Geschäftsadresse">
                    <TextArea name="geschaeftsadresse" wert={formDaten.geschaeftsadresse} onChange={onChange} placeholder="Musterstraße 1, 12345 Musterstadt" />
                  </Feld>
                </VollBreit>
                <VollBreit>
                  <Feld label="Social-Media-Kanäle">
                    <TextArea name="socialMediaKanaele" wert={formDaten.socialMediaKanaele} onChange={onChange}
                      placeholder="Instagram: @muster_gmbh&#10;TikTok: @mustergmbh&#10;Facebook: Mustermann GmbH" />
                  </Feld>
                </VollBreit>
              </Abschnitt>

              <Abschnitt titel="Internes">
                <Feld label="Status Kunde">
                  <TextInput name="statusKunde" wert={formDaten.statusKunde} onChange={onChange} placeholder="z.B. Aktiv, pausiert, ..." />
                </Feld>
                <Feld label="Kunden-Kategorie">
                  <SelectInput name="kundenKategorie" wert={formDaten.kundenKategorie} onChange={onChange}
                    optionen={["A-Kunde", "B-Kunde", "C-Kunde", "Bestandskunde", "Neukunde", "Potenzial", "Inaktiv"]} />
                </Feld>
                <Feld label="Kundenzufriedenheit (intern)">
                  <SelectInput name="kundenzufriedenheit" wert={formDaten.kundenzufriedenheit} onChange={onChange}
                    optionen={["Sehr zufrieden", "Zufrieden", "Neutral", "Hoch", "Sehr Hoch", "Niedrig", "Kritisch"]} />
                </Feld>
                <Feld label="Archiv">
                  <SelectInput name="archiv" wert={formDaten.archiv} onChange={onChange} optionen={["Ja", "Nein"]} />
                </Feld>
                <VollBreit>
                  <Feld label="Notizen intern">
                    <TextArea name="notizenIntern" wert={formDaten.notizenIntern} onChange={onChange}
                      placeholder="Interne Notizen, die der Kunde nicht sieht..." />
                  </Feld>
                </VollBreit>
                <VollBreit>
                  <Feld label="Kundenfeedback">
                    <TextArea name="kundenfeedback" wert={formDaten.kundenfeedback} onChange={onChange} placeholder="..." />
                  </Feld>
                </VollBreit>
              </Abschnitt>
            </div>
          )}

          {/* ── Tab: Freigabe & Vertrag ── */}
          {aktuellerTab === "freigabe" && (
            <div>
              <Abschnitt titel="Freigabe">
                <Feld label="Freigabe-Verantwortlicher">
                  <TextInput name="freigabeVerantwortlicher" wert={formDaten.freigabeVerantwortlicher} onChange={onChange} placeholder="Name der Person" />
                </Feld>
                <Feld label="E-Mail Freigabe-Verantwortlicher">
                  <TextInput name="emailFreigabeVerantwortlicher" wert={formDaten.emailFreigabeVerantwortlicher} onChange={onChange} placeholder="freigabe@unternehmen.de" />
                </Feld>
                <VollBreit>
                  <Feld label="Cloud-Link">
                    <TextInput name="cloudLink" wert={formDaten.cloudLink} onChange={onChange} placeholder="https://drive.google.com/..." />
                  </Feld>
                </VollBreit>
                <VollBreit>
                  <Feld label="Zusatzlinks / Zugänge">
                    <TextArea name="zusatzlinks" wert={formDaten.zusatzlinks} onChange={onChange}
                      placeholder="Canva-Link: ...&#10;Instagram-Passwort: ...&#10;..." />
                  </Feld>
                </VollBreit>
              </Abschnitt>

              <Abschnitt titel="Vertrag">
                <Feld label="Vertragsstart">
                  <input type="date" value={formDaten.vertragsstart}
                    onChange={e => onChange("vertragsstart", e.target.value)} className={inputKlasse} />
                </Feld>
                <Feld label="Letzter Kontakt">
                  <input type="date" value={formDaten.letzterKontakt}
                    onChange={e => onChange("letzterKontakt", e.target.value)} className={inputKlasse} />
                </Feld>
                <Feld label="Vertraglich festgelegte Post-Anzahl">
                  <input type="number" min="0" step="0.5"
                    value={formDaten.vertraglicheFestgelegtePostAnzahl}
                    onChange={e => onChange("vertraglicheFestgelegtePostAnzahl", e.target.value)}
                    placeholder="z.B. 12" className={inputKlasse} />
                </Feld>
              </Abschnitt>
            </div>
          )}

          {/* ── Tab: Content & Planung ── */}
          {aktuellerTab === "content" && (
            <div>
              <Abschnitt titel="Content-Planung">
                <VollBreit>
                  <Feld label="Content-Ideen (Freitext)">
                    <TextArea name="contentIdeen" wert={formDaten.contentIdeen} onChange={onChange}
                      placeholder="Ideen für zukünftigen Content..." />
                  </Feld>
                </VollBreit>
                <VollBreit>
                  <Feld label="Content-Plan (Kategorien)">
                    <MultiCheckbox name="contentPlan" wert={formDaten.contentPlan} onChange={onChange}
                      optionen={["Einblicke in den Arbeitsalltag", "Team-Vorstellung", "Projekte", "Ausbildung / Karriere", "Erklärvideos", "Sonstiges"]} />
                  </Feld>
                </VollBreit>
                <VollBreit>
                  <Feld label="Posting-Kalender (Notizen)">
                    <TextArea name="postingKalender" wert={formDaten.postingKalender} onChange={onChange}
                      placeholder="Kalender-Hinweise, fixe Termine, Zyklen..." />
                  </Feld>
                </VollBreit>
                <VollBreit>
                  <Feld label="Gibt es Besonderheiten bei der Planung?">
                    <TextArea name="besonderheitenPlanung" wert={formDaten.besonderheitenPlanung} onChange={onChange}
                      placeholder="z.B. saisonale Schwankungen, Feiertage, ..." />
                  </Feld>
                </VollBreit>
              </Abschnitt>

              <Abschnitt titel="Herausforderungen & Fragen">
                <VollBreit>
                  <Feld label="Gibt es konkrete Herausforderungen, bei denen Sie Unterstützung wünschen?">
                    <TextArea name="herausforderungen" wert={formDaten.herausforderungen} onChange={onChange} placeholder="..." />
                  </Feld>
                </VollBreit>
                <VollBreit>
                  <Feld label="Gibt es bestimmte Fragen, die Sie vorbereitet besprechen möchten?">
                    <TextArea name="vorbereiteteFragenBesprechen" wert={formDaten.vorbereiteteFragenBesprechen} onChange={onChange} placeholder="..." />
                  </Feld>
                </VollBreit>
              </Abschnitt>
            </div>
          )}

          {/* ── Tab: Drehtag ── */}
          {aktuellerTab === "drehtag" && (
            <div>
              <Abschnitt titel="Drehtag-Verfügbarkeit">
                <VollBreit>
                  <Feld label="An welchen Tagen wären Drehtage möglich?">
                    <MultiCheckbox name="drehtageAnWelchenTagen" wert={formDaten.drehtageAnWelchenTagen} onChange={onChange}
                      optionen={["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"]} />
                  </Feld>
                </VollBreit>
                <Feld label="Zu welchen Uhrzeiten sind Dreharbeiten möglich?">
                  <TextArea name="drehtageUhrzeiten" wert={formDaten.drehtageUhrzeiten} onChange={onChange}
                    placeholder="z.B. Montag–Freitag 8–17 Uhr" />
                </Feld>
                <Feld label="Wunschdatum für ersten Drehtag">
                  <input type="datetime-local" value={formDaten.wunschdatum}
                    onChange={e => onChange("wunschdatum", e.target.value)} className={inputKlasse} />
                </Feld>
                <Feld label="Wer ist Ansprechpartner während des Drehtags?">
                  <TextArea name="ansprechpartnerDrehtag" wert={formDaten.ansprechpartnerDrehtag} onChange={onChange}
                    placeholder="Name, Telefonnummer..." />
                </Feld>
                <VollBreit>
                  <Feld label="Gibt es Einschränkungen vor Ort (Lärm, Licht, Zugang etc.)?">
                    <TextArea name="einschraenkungenVorOrt" wert={formDaten.einschraenkungenVorOrt} onChange={onChange} placeholder="..." />
                  </Feld>
                </VollBreit>
                <Feld label="Möchten Sie selbst in Reels, Stories oder auf Fotos auftreten?">
                  <JaNeinUnsicher name="selbstAuftreten" wert={formDaten.selbstAuftreten} onChange={onChange} />
                </Feld>
              </Abschnitt>
            </div>
          )}

          {/* ── Tab: Rechtliches ── */}
          {aktuellerTab === "rechtliches" && (
            <div>
              <Abschnitt titel="Mitarbeiter & Bildrechte">
                <Feld label="Ist die Nutzung von Mitarbeitern im Bild rechtlich geklärt?">
                  <JaNeinUnsicher name="mitarbeiterImBildRechtlichGeklaert" wert={formDaten.mitarbeiterImBildRechtlichGeklaert} onChange={onChange} />
                </Feld>
                <Feld label="Ist die Nutzung von Mitarbeitern im Bild rechtlich geregelt?">
                  <SelectInput name="mitarbeiterImBildRechtlichGeregelt" wert={formDaten.mitarbeiterImBildRechtlichGeregelt} onChange={onChange}
                    optionen={["Ja, schriftlich geregelt", "Ich bin mir unsicher", "Nein"]} />
                </Feld>
                <Feld label="Gibt es Mitarbeitende, die nicht gezeigt werden dürfen?">
                  <JaNeinUnsicher name="mitarbeiterNichtZeigen" wert={formDaten.mitarbeiterNichtZeigen} onChange={onChange} />
                </Feld>
                <VollBreit>
                  <Feld label="Welche Mitarbeiter dürfen nicht gezeigt werden?">
                    <TextArea name="welcheMitarbeiterNichtZeigen" wert={formDaten.welcheMitarbeiterNichtZeigen} onChange={onChange} placeholder="Namen..." />
                  </Feld>
                </VollBreit>
                <Feld label="Gibt es sensible Betriebsbereiche, die nicht gezeigt werden sollen?">
                  <JaNeinUnsicher name="sensibleBereiche" wert={formDaten.sensibleBereiche} onChange={onChange} />
                </Feld>
                <VollBreit>
                  <Feld label="Welche Bereiche dürfen nicht gezeigt werden?">
                    <TextArea name="welcheBereicheNichtZeigen" wert={formDaten.welcheBereicheNichtZeigen} onChange={onChange} placeholder="Bereiche..." />
                  </Feld>
                </VollBreit>
              </Abschnitt>
            </div>
          )}

          {/* ── Tab: Marke & Ziele ── */}
          {aktuellerTab === "marke" && (
            <div>
              <Abschnitt titel="Unternehmen & Marke">
                <VollBreit>
                  <Feld label="Kurzbeschreibung des Betriebs">
                    <TextArea name="kurzbeschreibung" wert={formDaten.kurzbeschreibung} onChange={onChange}
                      placeholder="Was macht das Unternehmen?" />
                  </Feld>
                </VollBreit>
                <VollBreit>
                  <Feld label="Kernwerte">
                    <TextArea name="kernwerte" wert={formDaten.kernwerte} onChange={onChange}
                      placeholder="z.B. Qualität, Verlässlichkeit, Nachhaltigkeit..." />
                  </Feld>
                </VollBreit>
                <VollBreit>
                  <Feld label="Alleinstellungsmerkmale (USP)">
                    <TextArea name="alleinstellungsmerkmale" wert={formDaten.alleinstellungsmerkmale} onChange={onChange}
                      placeholder="Was macht das Unternehmen besonders?" />
                  </Feld>
                </VollBreit>
              </Abschnitt>

              <Abschnitt titel="Zielgruppe">
                <Feld label="Was ist das Hauptziel der Zusammenarbeit?">
                  <SelectInput name="hauptziel" wert={formDaten.hauptziel} onChange={onChange}
                    optionen={["Neue Mitarbeiter gewinnen", "Neue Kunden gewinnen", "Sichtbarkeit steigern", "Sonstiges"]} />
                </Feld>
                <VollBreit>
                  <Feld label="Welche Zielgruppe möchten Sie vorrangig erreichen?">
                    <TextArea name="zielgruppe" wert={formDaten.zielgruppe} onChange={onChange}
                      placeholder="Alter, Interessen, Region, ..." />
                  </Feld>
                </VollBreit>
                <VollBreit>
                  <Feld label="Wo hält sich die Zielgruppe online auf?">
                    <TextArea name="zielgruppeOnline" wert={formDaten.zielgruppeOnline} onChange={onChange}
                      placeholder="Instagram, Facebook-Gruppen, ..." />
                  </Feld>
                </VollBreit>
                <VollBreit>
                  <Feld label="Häufigste Probleme / Wünsche dieser Kunden">
                    <TextArea name="haeufigsteProbleme" wert={formDaten.haeufigsteProbleme} onChange={onChange} placeholder="..." />
                  </Feld>
                </VollBreit>
                <VollBreit>
                  <Feld label="Häufigste Einwände">
                    <TextArea name="haeufigsteEinwaende" wert={formDaten.haeufigsteEinwaende} onChange={onChange} placeholder="..." />
                  </Feld>
                </VollBreit>
                <VollBreit>
                  <Feld label="Was Kunden lieben">
                    <TextArea name="wasKundenLieben" wert={formDaten.wasKundenLieben} onChange={onChange} placeholder="..." />
                  </Feld>
                </VollBreit>
              </Abschnitt>
            </div>
          )}

          {/* ── Tab: Produkte & Events ── */}
          {aktuellerTab === "produkte" && (
            <div>
              <Abschnitt titel="Produkte & Leistungen">
                <VollBreit>
                  <Feld label="Hero-Produkte (Hauptleistungen)">
                    <TextArea name="heroProdukte" wert={formDaten.heroProdukte} onChange={onChange}
                      placeholder="Die wichtigsten Produkte oder Dienstleistungen..." />
                  </Feld>
                </VollBreit>
                <VollBreit>
                  <Feld label="Wiederkehrende Produkte / Content-Serien">
                    <TextArea name="wiederkehrendeProdukte" wert={formDaten.wiederkehrendeProdukte} onChange={onChange}
                      placeholder="z.B. wöchentlicher Tipp, monatliche Aktion, ..." />
                  </Feld>
                </VollBreit>
              </Abschnitt>

              <Abschnitt titel="Events & Termine">
                <VollBreit>
                  <Feld label="Events der nächsten Monate">
                    <TextArea name="eventsNaechsteMonate" wert={formDaten.eventsNaechsteMonate} onChange={onChange}
                      placeholder="z.B. Tag der offenen Tür am 15.06., Sommerfest..." />
                  </Feld>
                </VollBreit>
              </Abschnitt>
            </div>
          )}

          {/* Navigations-Buttons */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-800">
            <button type="button"
              onClick={() => {
                const idx = TABS.findIndex(t => t.id === aktuellerTab);
                if (idx > 0) setAktuellerTab(TABS[idx - 1].id);
              }}
              disabled={aktuellerTab === TABS[0].id}
              className="text-gray-400 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              ← Zurück
            </button>
            <span className="text-gray-500 text-xs">
              Tab {TABS.findIndex(t => t.id === aktuellerTab) + 1} / {TABS.length}
            </span>
            <button type="button"
              onClick={() => {
                const idx = TABS.findIndex(t => t.id === aktuellerTab);
                if (idx < TABS.length - 1) setAktuellerTab(TABS[idx + 1].id);
              }}
              disabled={aktuellerTab === TABS[TABS.length - 1].id}
              className="text-gray-400 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              Weiter →
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
