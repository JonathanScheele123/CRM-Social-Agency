"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";

const inputClass =
  "w-full bg-elevated border border-divider text-fg rounded-xl px-4 py-3 text-sm placeholder:text-subtle focus:outline-none focus:border-accent transition-colors";
const textareaClass =
  "w-full bg-elevated border border-divider text-fg rounded-xl px-4 py-3 text-sm placeholder:text-subtle focus:outline-none focus:border-accent transition-colors resize-none min-h-[100px]";
const labelClass = "block text-sm font-medium text-fg mb-1.5";
const sectionClass = "space-y-5";

function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="text-fg text-base font-semibold mb-4 pb-2 border-b border-divider">{title}</h2>
  );
}

function MultiSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  function toggle(opt: string) {
    onChange(value.includes(opt) ? value.filter(x => x !== opt) : [...value, opt]);
  }
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="flex flex-wrap gap-2 mt-1">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`px-3 py-1.5 rounded-xl text-sm border transition-colors ${
              value.includes(opt)
                ? "bg-accent border-accent text-white"
                : "bg-elevated border-divider text-muted hover:text-fg"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function SingleSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="flex flex-wrap gap-2 mt-1">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt === value ? "" : opt)}
            className={`px-3 py-1.5 rounded-xl text-sm border transition-colors ${
              value === opt
                ? "bg-accent border-accent text-white"
                : "bg-elevated border-divider text-muted hover:text-fg"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ContentStrategieFormularPage() {
  const router = useRouter();
  const params = useParams();
  const kundenprofilId = params.kundenprofilId as string;
  const [laden, setLaden] = useState(false);
  const [fehler, setFehler] = useState("");

  const [form, setForm] = useState({
    // Marke & Ziele
    kurzbeschreibung: "",
    kernwerte: "",
    alleinstellungsmerkmale: "",
    zusammenarbeitZiel: "",
    zusammenarbeitZielSonstiges: "",
    hauptziel: "",
    zielgruppe: "",
    hervorgehobeneDienstleistungen: "",
    haeufigsteProbleme: "",
    haeufigsteEinwaende: "",
    zielgruppeOnlineKanaele: [] as string[],
    zielgruppeOnlineKanaeleSonstiges: "",
    wasKundenLieben: "",
    // Produkte & Events
    heroProdukte: "",
    wiederkehrendeProdukte: "",
    eventsNaechsteMonate: "",
    // Content-Ideen
    irrtuemerBranche: "",
    geruechteVorurteile: "",
    haeufigsteKundenfragen: "",
    typischeFehlerKunden: "",
    einSacheZielgruppe: "",
    bestPracticesTipps: "",
    contentThemen: [] as string[],
    contentThemenZusatz: "",
    contentThemenSonstiges: "",
    contentStil: [] as string[],
    contentStilSonstiges: "",
    // Planung
    besonderheitenPlanung: "",
    // Modul
    modul: "Modul 2 – All-in mit Vor-Ort-Drehtag",
    // Rechtliches
    mitarbeiterImBildRechtlichGeklaert: "",
    mitarbeiterImBildRechtlichGeregelt: "",
    mitarbeiterNichtZeigen: "",
    welcheMitarbeiterNichtZeigen: "",
    sensibleBereiche: "",
    welcheBereicheNichtZeigen: "",
    // Drehtag
    drehtageAnWelchenTagen: [] as string[],
    drehtageUhrzeiten: "",
    ansprechpartnerDrehtag: "",
    einschraenkungenVorOrt: "",
    selbstAuftreten: "",
  });

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }
  function setArr(field: string, value: string[]) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFehler("");
    setLaden(true);

    const res = await fetch(`/api/formular/content-strategie/${kundenprofilId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLaden(false);

    if (res.ok) {
      router.push(`/formular/content-strategie/${kundenprofilId}/danke`);
    } else {
      const data = await res.json().catch(() => ({}));
      setFehler(data.fehler || "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
    }
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <img src="/logo.png" alt="JS Media" width={80} height={80} className="dark:hidden" />
            <img src="/logo-white.png" alt="JS Media" width={80} height={80} className="hidden dark:block" />
          </div>
          <h1 className="text-fg text-2xl font-semibold tracking-tight">Content-Strategie-Fragebogen</h1>
          <p className="text-muted text-sm mt-3 max-w-md mx-auto leading-relaxed">
            Bitte füllen Sie diesen Fragebogen so vollständig wie möglich aus. Ihre Antworten helfen uns, eine maßgeschneiderte Content-Strategie zu entwickeln.
          </p>
          <div className="mt-4 max-w-md mx-auto bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-700/40 rounded-xl px-4 py-3 text-left">
            <p className="text-amber-800 dark:text-amber-300 text-xs font-medium mb-0.5">Wichtiger Hinweis</p>
            <p className="text-amber-700 dark:text-amber-400 text-xs leading-relaxed">
              Bitte wählen Sie nur Felder aus, bei denen Sie sich wirklich sicher sind. Felder, bei denen Sie unsicher sind, lieber freilassen – eine unbeabsichtigte Auswahl hilft uns weniger als keine Angabe.
            </p>
          </div>
        </div>

        <div className="glass-modal rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-10">

            {/* Marke & Ziele */}
            <div className={sectionClass}>
              <SectionHeader title="Marke & Ziele" />
              <div>
                <label className={labelClass}>Kurzbeschreibung des Betriebs</label>
                <textarea value={form.kurzbeschreibung} onChange={e => set("kurzbeschreibung", e.target.value)}
                  placeholder="Beschreiben Sie Ihren Betrieb in wenigen Sätzen..." className={textareaClass} />
              </div>
              <div>
                <label className={labelClass}>Kernwerte</label>
                <textarea value={form.kernwerte} onChange={e => set("kernwerte", e.target.value)}
                  placeholder="Welche Werte stehen im Mittelpunkt Ihres Unternehmens?" className={textareaClass} />
              </div>
              <div>
                <label className={labelClass}>Alleinstellungsmerkmale (USPs)</label>
                <textarea value={form.alleinstellungsmerkmale} onChange={e => set("alleinstellungsmerkmale", e.target.value)}
                  placeholder="Was unterscheidet Sie von der Konkurrenz?" className={textareaClass} />
              </div>
              <SingleSelect
                label="Was ist das Hauptziel Ihrer Zusammenarbeit mit uns?"
                options={["Neue Mitarbeiter gewinnen", "Neue Kunden gewinnen", "Sichtbarkeit steigern", "Sonstiges"]}
                value={form.zusammenarbeitZiel}
                onChange={v => set("zusammenarbeitZiel", v)}
              />
              {form.zusammenarbeitZiel === "Sonstiges" && (
                <div>
                  <label className={labelClass}>Sonstiges – bitte beschreiben</label>
                  <textarea value={form.zusammenarbeitZielSonstiges} onChange={e => set("zusammenarbeitZielSonstiges", e.target.value)}
                    placeholder="Ihr Ziel..." className={textareaClass} />
                </div>
              )}
              <div>
                <label className={labelClass}>Was ist Ihr Hauptziel? (Details)</label>
                <textarea value={form.hauptziel} onChange={e => set("hauptziel", e.target.value)}
                  placeholder="Beschreiben Sie Ihr Ziel genauer..." className={textareaClass} />
              </div>
            </div>

            {/* Zielgruppe */}
            <div className={sectionClass}>
              <SectionHeader title="Zielgruppe" />
              <div>
                <label className={labelClass}>Idealer Kunde im Detail</label>
                <textarea value={form.zielgruppe} onChange={e => set("zielgruppe", e.target.value)}
                  placeholder="Alter, Interessen, Probleme, Beruf, Wohnort..." className={textareaClass} />
              </div>
              <div>
                <label className={labelClass}>Welche Dienstleistungen oder Produkte sollen besonders hervorgehoben werden?</label>
                <textarea value={form.hervorgehobeneDienstleistungen} onChange={e => set("hervorgehobeneDienstleistungen", e.target.value)}
                  placeholder="Beschreiben Sie die wichtigsten Angebote..." className={textareaClass} />
              </div>
              <div>
                <label className={labelClass}>Häufigste Probleme / Wünsche dieser Kunden</label>
                <textarea value={form.haeufigsteProbleme} onChange={e => set("haeufigsteProbleme", e.target.value)}
                  placeholder="Womit kämpfen Ihre Kunden am häufigsten?" className={textareaClass} />
              </div>
              <div>
                <label className={labelClass}>Häufigste Einwände</label>
                <textarea value={form.haeufigsteEinwaende} onChange={e => set("haeufigsteEinwaende", e.target.value)}
                  placeholder="Warum zögern potenzielle Kunden?" className={textareaClass} />
              </div>
              <MultiSelect
                label="Wo hält die Zielgruppe sich online auf?"
                options={["Instagram", "Facebook", "LinkedIn", "YouTube", "TikTok", "Google / Suchmaschinen", "Foren / Communities", "Branchenportale", "Sonstiges"]}
                value={form.zielgruppeOnlineKanaele}
                onChange={v => setArr("zielgruppeOnlineKanaele", v)}
              />
              {form.zielgruppeOnlineKanaele.includes("Sonstiges") && (
                <div>
                  <label className={labelClass}>Sonstiges – bitte beschreiben</label>
                  <textarea value={form.zielgruppeOnlineKanaeleSonstiges} onChange={e => set("zielgruppeOnlineKanaeleSonstiges", e.target.value)}
                    placeholder="Weitere Kanäle..." className={textareaClass} />
                </div>
              )}
              <div>
                <label className={labelClass}>Was Kunden lieben (an Ihrem Unternehmen)</label>
                <textarea value={form.wasKundenLieben} onChange={e => set("wasKundenLieben", e.target.value)}
                  placeholder="Welches Feedback hören Sie am häufigsten?" className={textareaClass} />
              </div>
            </div>

            {/* Produkte & Events */}
            <div className={sectionClass}>
              <SectionHeader title="Produkte & Events" />
              <div>
                <label className={labelClass}>Hero-Produkte / Flaggschiff-Angebote</label>
                <textarea value={form.heroProdukte} onChange={e => set("heroProdukte", e.target.value)}
                  placeholder="Ihre wichtigsten Produkte oder Dienstleistungen..." className={textareaClass} />
              </div>
              <div>
                <label className={labelClass}>Wiederkehrende Produkte / Serien</label>
                <textarea value={form.wiederkehrendeProdukte} onChange={e => set("wiederkehrendeProdukte", e.target.value)}
                  placeholder="Regelmäßige Aktionen, Serien oder Angebote..." className={textareaClass} />
              </div>
              <div>
                <label className={labelClass}>Events der nächsten Monate</label>
                <textarea value={form.eventsNaechsteMonate} onChange={e => set("eventsNaechsteMonate", e.target.value)}
                  placeholder="Geplante Veranstaltungen, Messen, Jubiläen..." className={textareaClass} />
              </div>
            </div>

            {/* Content-Ideen */}
            <div className={sectionClass}>
              <SectionHeader title="Content-Ideen & Expertise" />
              <div>
                <label className={labelClass}>Welche Irrtümer oder falschen Vorstellungen gibt es über Ihre Branche oder Ihr Angebot?</label>
                <textarea value={form.irrtuemerBranche} onChange={e => set("irrtuemerBranche", e.target.value)}
                  placeholder="Was wissen viele Menschen falsch?" className={textareaClass} />
              </div>
              <div>
                <label className={labelClass}>Was glauben andere Menschen über Ihre Branche, was aus Ihrer Sicht einfach nicht stimmt?</label>
                <textarea value={form.geruechteVorurteile} onChange={e => set("geruechteVorurteile", e.target.value)}
                  placeholder="Welche Vorurteile begegnen Ihnen regelmäßig?" className={textareaClass} />
              </div>
              <div>
                <label className={labelClass}>Welche Fragen werden Ihnen von Kunden am häufigsten gestellt?</label>
                <textarea value={form.haeufigsteKundenfragen} onChange={e => set("haeufigsteKundenfragen", e.target.value)}
                  placeholder="Die Top 5 Fragen Ihrer Kunden..." className={textareaClass} />
              </div>
              <div>
                <label className={labelClass}>Welche typischen Fehler machen Ihre Kunden, bevor sie zu Ihnen kommen?</label>
                <textarea value={form.typischeFehlerKunden} onChange={e => set("typischeFehlerKunden", e.target.value)}
                  placeholder="Häufige Fehler oder Missverständnisse..." className={textareaClass} />
              </div>
              <div>
                <label className={labelClass}>Wenn Sie Ihrer Zielgruppe eine Sache mitgeben könnten – was wäre das?</label>
                <textarea value={form.einSacheZielgruppe} onChange={e => set("einSacheZielgruppe", e.target.value)}
                  placeholder="Ihr wichtigster Rat an Ihre Zielgruppe..." className={textareaClass} />
              </div>
              <div>
                <label className={labelClass}>Best Practices, Tipps oder „Geheimtricks" aus Ihrem Alltag</label>
                <textarea value={form.bestPracticesTipps} onChange={e => set("bestPracticesTipps", e.target.value)}
                  placeholder="Was würden Sie gerne mit Ihrer Community teilen?" className={textareaClass} />
              </div>
              <MultiSelect
                label="Welche Themen oder Inhalte wären Ihnen wichtig?"
                options={["Einblicke in den Arbeitsalltag", "Team-Vorstellung", "Projekte", "Ausbildung / Karriere", "Erklärvideos", "Kundenstimmen / Referenzen", "Behind the Scenes", "Sonstiges"]}
                value={form.contentThemen}
                onChange={v => setArr("contentThemen", v)}
              />
              {form.contentThemen.includes("Sonstiges") && (
                <div>
                  <label className={labelClass}>Sonstiges – bitte beschreiben</label>
                  <textarea value={form.contentThemenSonstiges} onChange={e => set("contentThemenSonstiges", e.target.value)}
                    placeholder="Weitere Themenideen..." className={textareaClass} />
                </div>
              )}
              <div>
                <label className={labelClass}>Welche zusätzlichen Themen wären Ihnen wichtig?</label>
                <textarea value={form.contentThemenZusatz} onChange={e => set("contentThemenZusatz", e.target.value)}
                  placeholder="Weitere Themenideen..." className={textareaClass} />
              </div>
              <MultiSelect
                label="Haben Sie bestimmte Wünsche zum Stil oder Tonfall des Contents?"
                options={["Locker", "Humorvoll", "Sachlich", "Seriös", "Emotional", "Persönlich / nahbar", "Professionell", "Sonstiges"]}
                value={form.contentStil}
                onChange={v => setArr("contentStil", v)}
              />
              {form.contentStil.includes("Sonstiges") && (
                <div>
                  <label className={labelClass}>Sonstiges – bitte beschreiben</label>
                  <textarea value={form.contentStilSonstiges} onChange={e => set("contentStilSonstiges", e.target.value)}
                    placeholder="Gewünschter Stil..." className={textareaClass} />
                </div>
              )}
            </div>

            {/* Planung */}
            <div className={sectionClass}>
              <SectionHeader title="Planung" />
              <div>
                <label className={labelClass}>Gibt es Besonderheiten bei der Planung?</label>
                <textarea value={form.besonderheitenPlanung} onChange={e => set("besonderheitenPlanung", e.target.value)}
                  placeholder="Besondere Zeiträume, Themen, Einschränkungen..." className={textareaClass} />
              </div>
            </div>

            {/* Rechtliches */}
            <div className={sectionClass}>
              <SectionHeader title="Mitarbeiter & Bildrechte" />
              <SingleSelect
                label="Ist die Nutzung von Mitarbeitern im Bild rechtlich geklärt?"
                options={["Ja", "Ich bin mir unsicher", "Nein"]}
                value={form.mitarbeiterImBildRechtlichGeklaert}
                onChange={v => set("mitarbeiterImBildRechtlichGeklaert", v)}
              />
              <SingleSelect
                label="Ist die Nutzung von Mitarbeitern im Bild rechtlich geregelt?"
                options={["Ja, schriftlich geregelt", "Ich bin mir unsicher", "Nein"]}
                value={form.mitarbeiterImBildRechtlichGeregelt}
                onChange={v => set("mitarbeiterImBildRechtlichGeregelt", v)}
              />
              <SingleSelect
                label="Gibt es Mitarbeitende, die nicht gezeigt werden dürfen?"
                options={["Ja", "Ich bin mir unsicher", "Nein"]}
                value={form.mitarbeiterNichtZeigen}
                onChange={v => set("mitarbeiterNichtZeigen", v)}
              />
              <div>
                <label className={labelClass}>Welche Mitarbeiter dürfen nicht gezeigt werden?</label>
                <textarea value={form.welcheMitarbeiterNichtZeigen} onChange={e => set("welcheMitarbeiterNichtZeigen", e.target.value)}
                  placeholder="Namen oder Beschreibungen..." className={textareaClass} />
              </div>
              <SingleSelect
                label="Gibt es sensible Betriebsbereiche, die nicht gezeigt werden sollen?"
                options={["Ja", "Ich bin mir unsicher", "Nein"]}
                value={form.sensibleBereiche}
                onChange={v => set("sensibleBereiche", v)}
              />
              <div>
                <label className={labelClass}>Welche Bereiche dürfen nicht gezeigt werden?</label>
                <textarea value={form.welcheBereicheNichtZeigen} onChange={e => set("welcheBereicheNichtZeigen", e.target.value)}
                  placeholder="Beschreibung der Bereiche..." className={textareaClass} />
              </div>
            </div>

            {/* Drehtag */}
            <div className={sectionClass}>
              <SectionHeader title="Drehtag" />
              <SingleSelect
                label="Welches Modul haben Sie gebucht?"
                options={["Modul 1 – Strategie & Betreuung", "Modul 2 – All-in mit Vor-Ort-Drehtag"]}
                value={form.modul}
                onChange={v => set("modul", v)}
              />
              {form.modul !== "Modul 1 – Strategie & Betreuung" && (
                <>
                  <MultiSelect
                    label="An welchen Tagen wären Drehtage möglich?"
                    options={["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"]}
                    value={form.drehtageAnWelchenTagen}
                    onChange={v => setArr("drehtageAnWelchenTagen", v)}
                  />
                  <div>
                    <label className={labelClass}>Zu welchen Uhrzeiten sind Dreharbeiten möglich?</label>
                    <input type="text" value={form.drehtageUhrzeiten} onChange={e => set("drehtageUhrzeiten", e.target.value)}
                      placeholder="z. B. 9:00–17:00 Uhr" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Wer ist Ansprechpartner während des Drehtags? (Name / Rolle / Kontakt)</label>
                    <input type="text" value={form.ansprechpartnerDrehtag} onChange={e => set("ansprechpartnerDrehtag", e.target.value)}
                      placeholder="Max Mustermann / Marketing / +49 123 456" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Gibt es Einschränkungen vor Ort (Lärm, Licht, Zugang etc.)?</label>
                    <textarea value={form.einschraenkungenVorOrt} onChange={e => set("einschraenkungenVorOrt", e.target.value)}
                      placeholder="Beschreiben Sie besondere Gegebenheiten..." className={textareaClass} />
                  </div>
                  <SingleSelect
                    label="Möchten Sie selbst in Reels, Stories oder auf Fotos auftreten?"
                    options={["Ja", "Ich bin mir unsicher", "Nein"]}
                    value={form.selbstAuftreten}
                    onChange={v => set("selbstAuftreten", v)}
                  />
                </>
              )}
            </div>

            {fehler && (
              <p className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
                {fehler}
              </p>
            )}

            <button type="submit" disabled={laden}
              className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3.5 text-sm transition-colors">
              {laden ? "Wird gesendet..." : "Fragebogen absenden"}
            </button>

            <p className="text-subtle text-xs text-center">
              Mit dem Absenden stimmen Sie der Verarbeitung Ihrer Daten durch JS Media zu.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
