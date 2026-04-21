"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DateizugriffVorschau from "@/components/shared/DateizugriffVorschau";

const PLATTFORMEN = ["Instagram", "Facebook", "TikTok", "YouTube", "Sonstiges"];
const CONTENT_TYPEN = ["Reel", "Story", "Bild", "Karussell"];
const PRIORITAETEN = ["Hoch", "Mittel", "Niedrig"];
const FREIGABE_STATUS = ["Ausstehend", "Freigegeben", "Abgelehnt"];
const FREIGABE_LABEL: Record<string, string> = { Ausstehend: "Offen", Freigegeben: "Freigegeben", Abgelehnt: "Abgelehnt" };

const PLATTFORM_FARBEN: Record<string, string> = {
  Instagram: "bg-pink-100 dark:bg-pink-500/20 text-pink-700 dark:text-pink-300",
  Facebook:  "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300",
  TikTok:    "bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-300",
  YouTube:   "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300",
  Sonstiges: "bg-gray-100 dark:bg-gray-600/20 text-gray-500 dark:text-gray-400",
};

const FREIGABE_FARBEN: Record<string, string> = {
  Ausstehend: "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300",
  Freigegeben: "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300",
  Abgelehnt: "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300",
};

type Eintrag = {
  id: string;
  titel: string | null;
  beschreibung: string | null;
  plattform: string[];
  contentTyp: string | null;
  geplantAm: Date | null;
  captionText: string | null;
  dateizugriff: string | null;
  prioritaet: string | null;
  notizen: string | null;
  freigabeStatus: string;
  freigabeKommentar: string | null;
  freigegebenAm: Date | null;
  gepostet: boolean;
};

type Props = {
  kundenprofilId: string;
  eintrag?: Eintrag;
  onClose: () => void;
  onGespeichert?: (eintrag: Eintrag) => void;
  onGeloescht?: (id: string) => void;
};

const inputKlasse = "w-full bg-elevated border border-divider text-fg rounded-xl px-4 py-2.5 text-sm placeholder:text-subtle focus:outline-none focus:border-accent transition-colors";

function InfoZeile({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-subtle uppercase tracking-wide font-medium mb-1">{label}</p>
      <div className="text-sm text-fg">{value}</div>
    </div>
  );
}

function datumFormatieren(d: Date | string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("de-DE", {
    weekday: "short", day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function KalenderEintragModal({ kundenprofilId, eintrag, onClose, onGespeichert, onGeloescht }: Props) {
  const router = useRouter();
  const istNeu = !eintrag;
  const [bearbeitenModus, setBearbeitenModus] = useState(istNeu);
  const [laden, setLaden] = useState(false);
  const [fehler, setFehler] = useState("");

  const [formDaten, setFormDaten] = useState({
    titel: eintrag?.titel ?? "",
    beschreibung: eintrag?.beschreibung ?? "",
    plattform: eintrag?.plattform ?? [],
    contentTyp: eintrag?.contentTyp ?? "",
    prioritaet: eintrag?.prioritaet ?? "",
    captionText: eintrag?.captionText ?? "",
    dateizugriff: eintrag?.dateizugriff ?? "",
    notizen: eintrag?.notizen ?? "",
    geplantAm: eintrag?.geplantAm
      ? new Date(eintrag.geplantAm).toISOString().slice(0, 16)
      : "",
    freigabeStatus: eintrag?.freigabeStatus ?? "Ausstehend",
    gepostet: eintrag?.gepostet ?? false,
  });

  function togglePlattform(p: string) {
    setFormDaten(prev => ({
      ...prev,
      plattform: prev.plattform.includes(p)
        ? prev.plattform.filter(x => x !== p)
        : [...prev.plattform, p],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLaden(true);
    setFehler("");

    const url = !istNeu
      ? `/api/admin/kalender/${eintrag!.id}`
      : "/api/admin/kalender";

    const res = await fetch(url, {
      method: !istNeu ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formDaten,
        kundenprofilId,
        geplantAm: formDaten.geplantAm || null,
        eingereichtVon: "Agentur",
      }),
    });

    setLaden(false);

    const data = await res.json();
    if (!res.ok) {
      setFehler(data.fehler ?? "Fehler.");
      return;
    }

    onGespeichert?.(data);
    onClose();
    router.refresh();
  }

  async function handleLoeschen() {
    if (!eintrag || !confirm("Eintrag wirklich löschen?")) return;
    await fetch(`/api/admin/kalender/${eintrag.id}`, { method: "DELETE" });
    onGeloescht?.(eintrag.id);
    onClose();
    router.refresh();
  }

  return (
    <div className="fixed inset-0 glass-overlay z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div
        className="glass-modal rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5 border-b border-divider flex items-center justify-between">
          <h3 className="font-semibold text-fg">
            {istNeu ? "Neuer Kalender-Eintrag" : (bearbeitenModus ? "Eintrag bearbeiten" : (eintrag?.titel ?? "Eintrag"))}
          </h3>
          <button onClick={onClose} className="text-muted hover:text-fg transition-colors">✕</button>
        </div>

        {/* ── Leseansicht ── */}
        {!bearbeitenModus && eintrag && (
          <div className="p-5 space-y-4">
            {/* Badges */}
            <div className="flex flex-wrap gap-1.5">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${FREIGABE_FARBEN[eintrag.freigabeStatus] ?? "bg-elevated text-muted"}`}>
                {FREIGABE_LABEL[eintrag.freigabeStatus] ?? eintrag.freigabeStatus}
              </span>
              {eintrag.gepostet && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 font-medium">
                  Gepostet
                </span>
              )}
              {eintrag.prioritaet && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-elevated text-muted border border-divider">
                  {eintrag.prioritaet}
                </span>
              )}
              {eintrag.plattform.map(p => (
                <span key={p} className={`text-xs px-2 py-0.5 rounded-full ${PLATTFORM_FARBEN[p] ?? "bg-elevated text-muted"}`}>{p}</span>
              ))}
              {eintrag.contentTyp && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-elevated text-muted border border-divider">{eintrag.contentTyp}</span>
              )}
            </div>

            <InfoZeile label="Geplant am" value={datumFormatieren(eintrag.geplantAm)} />
            <InfoZeile label="Beschreibung" value={eintrag.beschreibung} />
            {eintrag.captionText && (
              <div>
                <p className="text-xs text-subtle uppercase tracking-wide font-medium mb-1">Caption</p>
                <div className="bg-elevated rounded-xl p-3 text-sm text-fg whitespace-pre-wrap leading-relaxed">
                  {eintrag.captionText}
                </div>
              </div>
            )}
            <InfoZeile label="Notizen" value={eintrag.notizen} />
            {eintrag.dateizugriff && (
              <DateizugriffVorschau url={eintrag.dateizugriff} />
            )}
            {eintrag.freigabeKommentar && (
              <InfoZeile label="Freigabe-Kommentar" value={eintrag.freigabeKommentar} />
            )}

            {/* Aktionen */}
            <div className="flex gap-2 pt-2">
              <button onClick={handleLoeschen}
                className="px-4 py-2.5 rounded-xl text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                Löschen
              </button>
              <button onClick={() => setBearbeitenModus(true)}
                className="ml-auto px-5 py-2.5 rounded-xl text-sm bg-accent hover:bg-accent-hover text-white font-medium transition-colors">
                Bearbeiten
              </button>
            </div>
          </div>
        )}

        {/* ── Bearbeitungsformular ── */}
        {bearbeitenModus && (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-sm text-muted mb-1.5">Titel</label>
              <input type="text" value={formDaten.titel} onChange={e => setFormDaten(p => ({ ...p, titel: e.target.value }))}
                placeholder="z.B. Einblick Werkstatt – Reel" className={inputKlasse} />
            </div>

            <div>
              <label className="block text-sm text-muted mb-1.5">Beschreibung</label>
              <textarea value={formDaten.beschreibung} onChange={e => setFormDaten(p => ({ ...p, beschreibung: e.target.value }))}
                placeholder="Kurze Inhaltsbeschreibung..." className={`${inputKlasse} min-h-[70px] resize-none`} />
            </div>

            <div>
              <label className="block text-sm text-muted mb-1.5">Caption / Text</label>
              <textarea value={formDaten.captionText} onChange={e => setFormDaten(p => ({ ...p, captionText: e.target.value }))}
                placeholder="Den vollständigen Post-Text hier eintragen..." className={`${inputKlasse} min-h-[100px] resize-y`} />
            </div>

            <div>
              <label className="block text-sm text-muted mb-2">Plattform</label>
              <div className="flex flex-wrap gap-2">
                {PLATTFORMEN.map(p => (
                  <button key={p} type="button" onClick={() => togglePlattform(p)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                      formDaten.plattform.includes(p)
                        ? "bg-accent border-accent text-white"
                        : "bg-elevated border-divider text-muted hover:border-muted/60 hover:text-fg"
                    }`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-muted mb-1.5">Content-Typ</label>
                <select value={formDaten.contentTyp} onChange={e => setFormDaten(p => ({ ...p, contentTyp: e.target.value }))}
                  className={inputKlasse}>
                  <option value="">–</option>
                  {CONTENT_TYPEN.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-muted mb-1.5">Priorität</label>
                <select value={formDaten.prioritaet} onChange={e => setFormDaten(p => ({ ...p, prioritaet: e.target.value }))}
                  className={inputKlasse}>
                  <option value="">–</option>
                  {PRIORITAETEN.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-muted mb-1.5">Geplant am</label>
              <input type="datetime-local" value={formDaten.geplantAm}
                onChange={e => setFormDaten(p => ({ ...p, geplantAm: e.target.value }))}
                className={inputKlasse} />
            </div>

            <div>
              <label className="block text-sm text-muted mb-1.5">Dateizugriff (Link)</label>
              <input type="url" value={formDaten.dateizugriff}
                onChange={e => setFormDaten(p => ({ ...p, dateizugriff: e.target.value }))}
                placeholder="https://drive.google.com/..." className={inputKlasse} />
            </div>

            <div>
              <label className="block text-sm text-muted mb-1.5">Notizen (intern / für Kunden)</label>
              <textarea value={formDaten.notizen} onChange={e => setFormDaten(p => ({ ...p, notizen: e.target.value }))}
                placeholder="..." className={`${inputKlasse} min-h-[60px] resize-none`} />
            </div>

            {!istNeu && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-muted mb-1.5">Freigabe-Status</label>
                  <select value={formDaten.freigabeStatus}
                    onChange={e => setFormDaten(p => ({ ...p, freigabeStatus: e.target.value }))}
                    className={inputKlasse}>
                    {FREIGABE_STATUS.map(s => <option key={s} value={s}>{FREIGABE_LABEL[s] ?? s}</option>)}
                  </select>
                </div>
                <div className="flex items-end pb-0.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formDaten.gepostet}
                      onChange={e => setFormDaten(p => ({ ...p, gepostet: e.target.checked }))}
                      className="w-4 h-4 rounded" />
                    <span className="text-sm text-muted">Gepostet</span>
                  </label>
                </div>
              </div>
            )}

            {fehler && (
              <p className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2">{fehler}</p>
            )}

            <div className="flex gap-2 pt-1">
              <button type="button"
                onClick={() => istNeu ? onClose() : setBearbeitenModus(false)}
                className="px-4 py-2.5 rounded-xl text-sm bg-elevated text-fg hover:opacity-80 transition-opacity border border-divider">
                Abbrechen
              </button>
              <button type="submit" disabled={laden}
                className="ml-auto px-5 py-2.5 rounded-xl text-sm bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-medium transition-colors">
                {laden ? "..." : istNeu ? "Erstellen" : "Speichern"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
