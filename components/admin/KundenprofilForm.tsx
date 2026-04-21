"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { useT } from "@/lib/i18n";

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
  linkInstagram: string;
  linkFacebook: string;
  linkTikTok: string;
  linkYouTube: string;
  freigabeVerantwortlicher: string;
  emailFreigabeVerantwortlicher: string;
  cloudLink: string;
  zusatzlinks: string;
  vertragsstart: string;
  statusKunde: string;
  vertraglicheFestgelegtePostAnzahl: string;
  limitReel: string;
  limitStory: string;
  limitBild: string;
  limitKarussell: string;
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
  linkInstagram: "", linkFacebook: "", linkTikTok: "", linkYouTube: "",
  freigabeVerantwortlicher: "", emailFreigabeVerantwortlicher: "",
  cloudLink: "", zusatzlinks: "",
  vertragsstart: "", statusKunde: "",
  vertraglicheFestgelegtePostAnzahl: "",
  limitReel: "", limitStory: "", limitBild: "", limitKarussell: "",
  kundenfeedback: "",
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

function Feld({ label, pflicht, children }: { label: string; pflicht?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-fg mb-1.5">
        {label}
        {pflicht && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputKlasse = "w-full bg-elevated border border-divider text-fg rounded-xl px-4 py-2.5 text-sm placeholder:text-subtle focus:outline-none focus:border-accent transition-colors";
const textareaKlasse = `${inputKlasse} min-h-[80px] resize-y`;

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
    <select value={wert} onChange={e => onChange(name, e.target.value)} className={inputKlasse}>
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
              ? "bg-accent border-accent text-white"
              : "bg-elevated border-divider text-muted hover:border-muted/60 hover:text-fg"
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
      <h3 className="text-xs font-semibold text-subtle uppercase tracking-wider mb-3">{titel}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function VollBreit({ children }: { children: React.ReactNode }) {
  return <div className="sm:col-span-2">{children}</div>;
}

type Props = {
  initialDaten?: Partial<KundenprofilFormDaten>;
  modus: "erstellen" | "bearbeiten";
  kundeId?: string;
};

export default function KundenprofilForm({ initialDaten, modus, kundeId }: Props) {
  const router = useRouter();
  const t = useT();
  const kpf = t.kundenprofilForm;

  const TABS = [
    { id: "grunddaten", label: kpf.grunddaten },
    { id: "freigabe", label: kpf.freigabeVertrag },
    { id: "content", label: kpf.contentPlanung },
    { id: "drehtag", label: kpf.drehtag },
    { id: "rechtliches", label: kpf.rechtliches },
    { id: "marke", label: kpf.markeZiele },
    { id: "produkte", label: kpf.produkteEvents },
  ];

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
      const data = await res.json().catch(() => ({}));
      setFehler((data as { fehler?: string }).fehler ?? "Ein Fehler ist aufgetreten.");
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
    if (!confirm(kpf.loeschenBestaetigung)) return;
    const res = await fetch(`/api/admin/kunden/${kundeId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen text-fg">
      <header className="border-b border-divider px-4 sm:px-6 py-4 sticky top-0 glass-bar z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => router.back()} className="text-muted hover:text-fg text-sm shrink-0 transition-colors">
              ← Zurück
            </button>
            <span className="text-subtle">/</span>
            <h1 className="font-semibold text-fg truncate">
              {modus === "erstellen" ? kpf.neuerKunde : (formDaten.unternehmensname || kpf.kundeBearbeiten)}
            </h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {modus === "bearbeiten" && (
              <button type="button" onClick={handleLoeschen}
                className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 text-sm px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                Löschen
              </button>
            )}
            <ThemeToggle />
            <button type="submit" form="kunden-form" disabled={laden || gespeichert}
              className={`text-sm px-4 py-2 rounded-xl font-medium transition-colors ${
                gespeichert
                  ? "bg-green-600 text-white cursor-default"
                  : "bg-accent hover:bg-accent-hover disabled:opacity-50 text-white"
              }`}>
              {gespeichert ? "✓ Gespeichert" : laden ? "Speichern..." : modus === "erstellen" ? "Erstellen" : "Speichern"}
            </button>
          </div>
        </div>
      </header>

      <div className="border-b border-divider px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex gap-0 overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab.id} type="button" onClick={() => setAktuellerTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                aktuellerTab === tab.id
                  ? "border-accent text-accent"
                  : "border-transparent text-muted hover:text-fg"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <form id="kunden-form" onSubmit={handleSubmit}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          {fehler && (
            <div className="mb-4 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
              {fehler}
            </div>
          )}

          {aktuellerTab === "grunddaten" && (
            <div>
              <Abschnitt titel={kpf.kontaktdaten}>
                <Feld label={kpf.unternehmensname}>
                  <TextInput name="unternehmensname" wert={formDaten.unternehmensname} onChange={onChange} placeholder={kpf.unternehmensnameP} />
                </Feld>
                <Feld label={kpf.branche}>
                  <TextInput name="branche" wert={formDaten.branche} onChange={onChange} placeholder={kpf.brancheP} />
                </Feld>
                <Feld label={kpf.ansprechpartner}>
                  <TextInput name="ansprechpartner" wert={formDaten.ansprechpartner} onChange={onChange} placeholder={kpf.ansprechpartnerP} />
                </Feld>
                <Feld label={kpf.emailAnsprechpartner}>
                  <TextInput name="emailAnsprechpartner" wert={formDaten.emailAnsprechpartner} onChange={onChange} placeholder={kpf.emailAnsprechpartnerP} />
                </Feld>
                <Feld label={kpf.telefon}>
                  <TextInput name="telefonnummer" wert={formDaten.telefonnummer} onChange={onChange} placeholder={kpf.telefonP} />
                </Feld>
                <Feld label={kpf.emailDirekt}>
                  <TextInput name="emailDirekt" wert={formDaten.emailDirekt} onChange={onChange} placeholder={kpf.emailDirektP} />
                </Feld>
                <Feld label={kpf.webseite}>
                  <TextInput name="webseite" wert={formDaten.webseite} onChange={onChange} placeholder={kpf.webseiteP} />
                </Feld>
                <VollBreit>
                  <Feld label={kpf.adresse}>
                    <TextArea name="geschaeftsadresse" wert={formDaten.geschaeftsadresse} onChange={onChange} placeholder={kpf.adresseP} />
                  </Feld>
                </VollBreit>
                <VollBreit>
                  <Feld label={kpf.socialMediaKanaele}>
                    <TextArea name="socialMediaKanaele" wert={formDaten.socialMediaKanaele} onChange={onChange}
                      placeholder="Instagram: @muster_gmbh&#10;TikTok: @mustergmbh&#10;Facebook: Mustermann GmbH" />
                  </Feld>
                </VollBreit>
                <Feld label={kpf.instagramLink}>
                  <TextInput name="linkInstagram" wert={formDaten.linkInstagram} onChange={onChange} placeholder="https://instagram.com/..." />
                </Feld>
                <Feld label={kpf.facebookLink}>
                  <TextInput name="linkFacebook" wert={formDaten.linkFacebook} onChange={onChange} placeholder="https://facebook.com/..." />
                </Feld>
                <Feld label={kpf.tiktokLink}>
                  <TextInput name="linkTikTok" wert={formDaten.linkTikTok} onChange={onChange} placeholder="https://tiktok.com/@..." />
                </Feld>
                <Feld label={kpf.youtubeLink}>
                  <TextInput name="linkYouTube" wert={formDaten.linkYouTube} onChange={onChange} placeholder="https://youtube.com/@..." />
                </Feld>
              </Abschnitt>

              <Abschnitt titel={kpf.internes}>
                <Feld label={kpf.statusKunde}>
                  <SelectInput name="statusKunde" wert={formDaten.statusKunde} onChange={onChange}
                    optionen={[kpf.statusAktiv, kpf.statusBestand, kpf.statusNeu, kpf.statusInaktiv]} />
                </Feld>
                <VollBreit>
                  <Feld label={kpf.notizenIntern}>
                    <TextArea name="notizenIntern" wert={formDaten.notizenIntern} onChange={onChange}
                      placeholder={kpf.notizenInternP} />
                  </Feld>
                </VollBreit>
                <VollBreit>
                  <Feld label={kpf.kundenfeedback}>
                    <TextArea name="kundenfeedback" wert={formDaten.kundenfeedback} onChange={onChange} placeholder="..." />
                  </Feld>
                </VollBreit>
              </Abschnitt>
            </div>
          )}

          {aktuellerTab === "freigabe" && (
            <div>
              <Abschnitt titel={kpf.freigabe}>
                <Feld label={kpf.freigabeVerantwortlicher}>
                  <TextInput name="freigabeVerantwortlicher" wert={formDaten.freigabeVerantwortlicher} onChange={onChange} placeholder="Name der Person" />
                </Feld>
                <Feld label={kpf.emailFreigabe}>
                  <TextInput name="emailFreigabeVerantwortlicher" wert={formDaten.emailFreigabeVerantwortlicher} onChange={onChange} placeholder="freigabe@unternehmen.de" />
                </Feld>
                <VollBreit>
                  <Feld label={kpf.cloudLink}>
                    <TextInput name="cloudLink" wert={formDaten.cloudLink} onChange={onChange} placeholder={kpf.cloudLinkP} />
                  </Feld>
                </VollBreit>
                <VollBreit>
                  <Feld label={kpf.zusatzlinks}>
                    <TextArea name="zusatzlinks" wert={formDaten.zusatzlinks} onChange={onChange}
                      placeholder="Canva-Link: ...&#10;Instagram-Passwort: ...&#10;..." />
                  </Feld>
                </VollBreit>
              </Abschnitt>

              <Abschnitt titel={kpf.vertrag}>
                <Feld label={kpf.vertragsstart}>
                  <input type="date" value={formDaten.vertragsstart}
                    onChange={e => onChange("vertragsstart", e.target.value)} className={inputKlasse} />
                </Feld>
                <Feld label={kpf.postAnzahl}>
                  <input type="number" min="0" step="0.5"
                    value={formDaten.vertraglicheFestgelegtePostAnzahl}
                    onChange={e => onChange("vertraglicheFestgelegtePostAnzahl", e.target.value)}
                    placeholder={kpf.postAnzahlP} className={inputKlasse} />
                </Feld>
                <Feld label={kpf.limitReels}>
                  <input type="number" min="0" step="1" value={formDaten.limitReel}
                    onChange={e => onChange("limitReel", e.target.value)}
                    placeholder={kpf.limitP} className={inputKlasse} />
                </Feld>
                <Feld label={kpf.limitStories}>
                  <input type="number" min="0" step="1" value={formDaten.limitStory}
                    onChange={e => onChange("limitStory", e.target.value)}
                    placeholder={kpf.limitP} className={inputKlasse} />
                </Feld>
                <Feld label={kpf.limitBilder}>
                  <input type="number" min="0" step="1" value={formDaten.limitBild}
                    onChange={e => onChange("limitBild", e.target.value)}
                    placeholder={kpf.limitP} className={inputKlasse} />
                </Feld>
                <Feld label={kpf.limitKarussells}>
                  <input type="number" min="0" step="1" value={formDaten.limitKarussell}
                    onChange={e => onChange("limitKarussell", e.target.value)}
                    placeholder={kpf.limitP} className={inputKlasse} />
                </Feld>
              </Abschnitt>
            </div>
          )}

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
                  <Feld label={kpf.besonderheiten}>
                    <TextArea name="besonderheitenPlanung" wert={formDaten.besonderheitenPlanung} onChange={onChange}
                      placeholder="z.B. saisonale Schwankungen, Feiertage, ..." />
                  </Feld>
                </VollBreit>
              </Abschnitt>

              <Abschnitt titel="Herausforderungen & Fragen">
                <VollBreit>
                  <Feld label={kpf.herausforderungenFrage}>
                    <TextArea name="herausforderungen" wert={formDaten.herausforderungen} onChange={onChange} placeholder="..." />
                  </Feld>
                </VollBreit>
                <VollBreit>
                  <Feld label={kpf.vorbereitete}>
                    <TextArea name="vorbereiteteFragenBesprechen" wert={formDaten.vorbereiteteFragenBesprechen} onChange={onChange} placeholder="..." />
                  </Feld>
                </VollBreit>
              </Abschnitt>
            </div>
          )}

          {aktuellerTab === "drehtag" && (
            <div>
              <Abschnitt titel="Drehtag-Verfügbarkeit">
                <VollBreit>
                  <Feld label={kpf.drehtageWelcheTage}>
                    <MultiCheckbox name="drehtageAnWelchenTagen" wert={formDaten.drehtageAnWelchenTagen} onChange={onChange}
                      optionen={["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"]} />
                  </Feld>
                </VollBreit>
                <Feld label={kpf.drehtageUhrzeiten}>
                  <TextArea name="drehtageUhrzeiten" wert={formDaten.drehtageUhrzeiten} onChange={onChange}
                    placeholder="z.B. Montag–Freitag 8–17 Uhr" />
                </Feld>
                <Feld label={kpf.wunschdatum}>
                  <input type="datetime-local" value={formDaten.wunschdatum}
                    onChange={e => onChange("wunschdatum", e.target.value)} className={inputKlasse} />
                </Feld>
                <Feld label={kpf.ansprechpartnerDrehtag}>
                  <TextArea name="ansprechpartnerDrehtag" wert={formDaten.ansprechpartnerDrehtag} onChange={onChange}
                    placeholder="Name, Telefonnummer..." />
                </Feld>
                <VollBreit>
                  <Feld label={kpf.einschraenkungenVorOrt}>
                    <TextArea name="einschraenkungenVorOrt" wert={formDaten.einschraenkungenVorOrt} onChange={onChange} placeholder="..." />
                  </Feld>
                </VollBreit>
                <Feld label={kpf.selbstAuftreten}>
                  <JaNeinUnsicher name="selbstAuftreten" wert={formDaten.selbstAuftreten} onChange={onChange} />
                </Feld>
              </Abschnitt>
            </div>
          )}

          {aktuellerTab === "rechtliches" && (
            <div>
              <Abschnitt titel={kpf.mitarbeiterBildrechte}>
                <Feld label={kpf.mitarbeiterGeklaert}>
                  <JaNeinUnsicher name="mitarbeiterImBildRechtlichGeklaert" wert={formDaten.mitarbeiterImBildRechtlichGeklaert} onChange={onChange} />
                </Feld>
                <Feld label={kpf.mitarbeiterGeregelt}>
                  <SelectInput name="mitarbeiterImBildRechtlichGeregelt" wert={formDaten.mitarbeiterImBildRechtlichGeregelt} onChange={onChange}
                    optionen={[kpf.schriftlichGeregelt, kpf.unsicher, "Nein"]} />
                </Feld>
                <Feld label={kpf.mitarbeiterNichtZeigen}>
                  <JaNeinUnsicher name="mitarbeiterNichtZeigen" wert={formDaten.mitarbeiterNichtZeigen} onChange={onChange} />
                </Feld>
                <VollBreit>
                  <Feld label={kpf.welcheMitarbeiter}>
                    <TextArea name="welcheMitarbeiterNichtZeigen" wert={formDaten.welcheMitarbeiterNichtZeigen} onChange={onChange} placeholder="Namen..." />
                  </Feld>
                </VollBreit>
                <Feld label={kpf.sensibleBereiche}>
                  <JaNeinUnsicher name="sensibleBereiche" wert={formDaten.sensibleBereiche} onChange={onChange} />
                </Feld>
                <VollBreit>
                  <Feld label={kpf.welcheBereiche}>
                    <TextArea name="welcheBereicheNichtZeigen" wert={formDaten.welcheBereicheNichtZeigen} onChange={onChange} placeholder="Bereiche..." />
                  </Feld>
                </VollBreit>
              </Abschnitt>
            </div>
          )}

          {aktuellerTab === "marke" && (
            <div>
              <Abschnitt titel={kpf.unternehmenMarke}>
                <VollBreit>
                  <Feld label={kpf.kurzbeschreibung}>
                    <TextArea name="kurzbeschreibung" wert={formDaten.kurzbeschreibung} onChange={onChange}
                      placeholder={kpf.kurzbeschreibungP} />
                  </Feld>
                </VollBreit>
                <VollBreit>
                  <Feld label={kpf.kernwerte}>
                    <TextArea name="kernwerte" wert={formDaten.kernwerte} onChange={onChange}
                      placeholder="z.B. Qualität, Verlässlichkeit, Nachhaltigkeit..." />
                  </Feld>
                </VollBreit>
                <VollBreit>
                  <Feld label={kpf.alleinstellungsmerkmale}>
                    <TextArea name="alleinstellungsmerkmale" wert={formDaten.alleinstellungsmerkmale} onChange={onChange}
                      placeholder={kpf.alleinstellungsmerkmaleP} />
                  </Feld>
                </VollBreit>
              </Abschnitt>

              <Abschnitt titel={kpf.zielgruppe}>
                <Feld label={kpf.hauptziel}>
                  <SelectInput name="hauptziel" wert={formDaten.hauptziel} onChange={onChange}
                    optionen={[kpf.neueMitarbeiter, kpf.neueKunden, kpf.sichtbarkeit, kpf.sonstiges]} />
                </Feld>
                <VollBreit>
                  <Feld label={kpf.zielgruppeErreichen}>
                    <TextArea name="zielgruppe" wert={formDaten.zielgruppe} onChange={onChange}
                      placeholder="Alter, Interessen, Region, ..." />
                  </Feld>
                </VollBreit>
                <VollBreit>
                  <Feld label={kpf.zielgruppeOnline}>
                    <TextArea name="zielgruppeOnline" wert={formDaten.zielgruppeOnline} onChange={onChange}
                      placeholder="Instagram, Facebook-Gruppen, ..." />
                  </Feld>
                </VollBreit>
                <VollBreit>
                  <Feld label={kpf.haeufigsteProbleme}>
                    <TextArea name="haeufigsteProbleme" wert={formDaten.haeufigsteProbleme} onChange={onChange} placeholder="..." />
                  </Feld>
                </VollBreit>
                <VollBreit>
                  <Feld label={kpf.haeufigsteEinwaende}>
                    <TextArea name="haeufigsteEinwaende" wert={formDaten.haeufigsteEinwaende} onChange={onChange} placeholder="..." />
                  </Feld>
                </VollBreit>
                <VollBreit>
                  <Feld label={kpf.wasKundenLieben}>
                    <TextArea name="wasKundenLieben" wert={formDaten.wasKundenLieben} onChange={onChange} placeholder="..." />
                  </Feld>
                </VollBreit>
              </Abschnitt>
            </div>
          )}

          {aktuellerTab === "produkte" && (
            <div>
              <Abschnitt titel="Produkte & Leistungen">
                <VollBreit>
                  <Feld label={kpf.heroProdukte}>
                    <TextArea name="heroProdukte" wert={formDaten.heroProdukte} onChange={onChange}
                      placeholder="Die wichtigsten Produkte oder Dienstleistungen..." />
                  </Feld>
                </VollBreit>
                <VollBreit>
                  <Feld label={kpf.wiederkehrendeProdukte}>
                    <TextArea name="wiederkehrendeProdukte" wert={formDaten.wiederkehrendeProdukte} onChange={onChange}
                      placeholder={kpf.wiederkehrendeP} />
                  </Feld>
                </VollBreit>
              </Abschnitt>

              <Abschnitt titel="Events & Termine">
                <VollBreit>
                  <Feld label={kpf.eventsNaechsteMonate}>
                    <TextArea name="eventsNaechsteMonate" wert={formDaten.eventsNaechsteMonate} onChange={onChange}
                      placeholder={kpf.eventsP} />
                  </Feld>
                </VollBreit>
              </Abschnitt>
            </div>
          )}

          <div className="flex items-center justify-between mt-6 pt-6 border-t border-divider">
            <button type="button"
              onClick={() => {
                const idx = TABS.findIndex(t => t.id === aktuellerTab);
                if (idx > 0) setAktuellerTab(TABS[idx - 1].id);
              }}
              disabled={aktuellerTab === TABS[0].id}
              className="text-muted hover:text-fg text-sm px-3 py-2 rounded-lg hover:bg-elevated disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              ← Zurück
            </button>
            <span className="text-subtle text-xs">
              Tab {TABS.findIndex(t => t.id === aktuellerTab) + 1} {kpf.tabVon} {TABS.length}
            </span>
            <button type="button"
              onClick={() => {
                const idx = TABS.findIndex(t => t.id === aktuellerTab);
                if (idx < TABS.length - 1) setAktuellerTab(TABS[idx + 1].id);
              }}
              disabled={aktuellerTab === TABS[TABS.length - 1].id}
              className="text-muted hover:text-fg text-sm px-3 py-2 rounded-lg hover:bg-elevated disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              {kpf.weiter}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
