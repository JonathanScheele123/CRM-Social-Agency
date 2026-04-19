"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PLATTFORMEN = ["Instagram", "Facebook", "TikTok", "YouTube", "Sonstiges"];
const CONTENT_TYPEN = ["Reel", "Story", "Bild", "Karussell"];
const PRIORITAETEN = ["Hoch", "Mittel", "Niedrig"];
const FREIGABE_STATUS = ["Ausstehend", "Freigegeben", "Abgelehnt", "Überarbeitung"];

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
  gepostet: boolean;
};

type Props = {
  kundenprofilId: string;
  eintrag?: Eintrag;
  onClose: () => void;
};

const inputKlasse = "w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors";

export default function KalenderEintragModal({ kundenprofilId, eintrag, onClose }: Props) {
  const router = useRouter();
  const bearbeiten = !!eintrag;

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

    const url = bearbeiten
      ? `/api/admin/kalender/${eintrag!.id}`
      : "/api/admin/kalender";

    const res = await fetch(url, {
      method: bearbeiten ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formDaten,
        kundenprofilId,
        geplantAm: formDaten.geplantAm || null,
        eingereichtVon: "Agentur",
      }),
    });

    setLaden(false);

    if (!res.ok) {
      const data = await res.json();
      setFehler(data.fehler ?? "Fehler.");
      return;
    }

    onClose();
    router.refresh();
  }

  async function handleLoeschen() {
    if (!eintrag || !confirm("Eintrag wirklich löschen?")) return;
    await fetch(`/api/admin/kalender/${eintrag.id}`, { method: "DELETE" });
    onClose();
    router.refresh();
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <h3 className="font-semibold">{bearbeiten ? "Eintrag bearbeiten" : "Neuer Kalender-Eintrag"}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Titel */}
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Titel</label>
            <input type="text" value={formDaten.titel} onChange={e => setFormDaten(p => ({ ...p, titel: e.target.value }))}
              placeholder="z.B. Einblick Werkstatt – Reel" className={inputKlasse} />
          </div>

          {/* Beschreibung */}
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Beschreibung</label>
            <textarea value={formDaten.beschreibung} onChange={e => setFormDaten(p => ({ ...p, beschreibung: e.target.value }))}
              placeholder="Kurze Inhaltsbeschreibung..." className={`${inputKlasse} min-h-[70px] resize-none`} />
          </div>

          {/* Caption */}
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Caption / Text</label>
            <textarea value={formDaten.captionText} onChange={e => setFormDaten(p => ({ ...p, captionText: e.target.value }))}
              placeholder="Den vollständigen Post-Text hier eintragen..." className={`${inputKlasse} min-h-[100px] resize-y`} />
          </div>

          {/* Plattform */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">Plattform</label>
            <div className="flex flex-wrap gap-2">
              {PLATTFORMEN.map(p => (
                <button key={p} type="button" onClick={() => togglePlattform(p)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                    formDaten.plattform.includes(p)
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500"
                  }`}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Content-Typ + Priorität */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Content-Typ</label>
              <select value={formDaten.contentTyp} onChange={e => setFormDaten(p => ({ ...p, contentTyp: e.target.value }))}
                className={inputKlasse}>
                <option value="">–</option>
                {CONTENT_TYPEN.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Priorität</label>
              <select value={formDaten.prioritaet} onChange={e => setFormDaten(p => ({ ...p, prioritaet: e.target.value }))}
                className={inputKlasse}>
                <option value="">–</option>
                {PRIORITAETEN.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Datum */}
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Geplant am</label>
            <input type="datetime-local" value={formDaten.geplantAm}
              onChange={e => setFormDaten(p => ({ ...p, geplantAm: e.target.value }))}
              className={inputKlasse} />
          </div>

          {/* Dateizugriff */}
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Dateizugriff (Link)</label>
            <input type="url" value={formDaten.dateizugriff}
              onChange={e => setFormDaten(p => ({ ...p, dateizugriff: e.target.value }))}
              placeholder="https://drive.google.com/..." className={inputKlasse} />
          </div>

          {/* Notizen */}
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Notizen (intern / für Kunden)</label>
            <textarea value={formDaten.notizen} onChange={e => setFormDaten(p => ({ ...p, notizen: e.target.value }))}
              placeholder="..." className={`${inputKlasse} min-h-[60px] resize-none`} />
          </div>

          {/* Status (nur beim Bearbeiten) */}
          {bearbeiten && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-300 mb-1.5">Freigabe-Status</label>
                <select value={formDaten.freigabeStatus}
                  onChange={e => setFormDaten(p => ({ ...p, freigabeStatus: e.target.value }))}
                  className={inputKlasse}>
                  {FREIGABE_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex items-end pb-0.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formDaten.gepostet}
                    onChange={e => setFormDaten(p => ({ ...p, gepostet: e.target.checked }))}
                    className="w-4 h-4 rounded" />
                  <span className="text-sm text-gray-300">Gepostet</span>
                </label>
              </div>
            </div>
          )}

          {fehler && (
            <p className="text-red-400 text-sm bg-red-950 border border-red-800 rounded-xl px-3 py-2">{fehler}</p>
          )}

          {/* Buttons */}
          <div className="flex gap-2 pt-1">
            {bearbeiten && (
              <button type="button" onClick={handleLoeschen}
                className="px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-950/30 transition-colors">
                Löschen
              </button>
            )}
            <div className="flex gap-2 ml-auto">
              <button type="button" onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-sm bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors">
                Abbrechen
              </button>
              <button type="submit" disabled={laden}
                className="px-5 py-2.5 rounded-xl text-sm bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium transition-colors">
                {laden ? "..." : bearbeiten ? "Speichern" : "Erstellen"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
