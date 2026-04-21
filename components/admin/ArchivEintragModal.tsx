"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PLATTFORMEN = ["Instagram", "Facebook", "TikTok", "YouTube", "Sonstiges"];
const CONTENT_TYPEN = ["Reel", "Story", "Bild", "Karussell"];
const PRIORITAETEN = ["Hoch", "Mittel", "Niedrig"];

type Kommentar = {
  id: string;
  text: string;
  autorTyp: string;
  autorName: string | null;
  createdAt: Date;
};

type Eintrag = {
  id: string;
  titel: string | null;
  beschreibung: string | null;
  plattform: string[];
  contentTyp: string | null;
  prioritaet: string | null;
  captionText: string | null;
  dateizugriff: string | null;
  notizen: string | null;
  gepostetAm: Date | null;
  kommentare: Kommentar[];
};

type Props = {
  kundenprofilId: string;
  eintrag?: Eintrag;
  onClose: () => void;
};

const inputKlasse =
  "w-full bg-elevated border border-divider text-fg rounded-xl px-4 py-2.5 text-sm placeholder:text-subtle focus:outline-none focus:border-accent transition-colors";

export default function ArchivEintragModal({ kundenprofilId, eintrag, onClose }: Props) {
  const router = useRouter();
  const bearbeiten = !!eintrag;
  const [laden, setLaden] = useState(false);
  const [fehler, setFehler] = useState("");
  const [kommentare, setKommentare] = useState<Kommentar[]>(eintrag?.kommentare ?? []);
  const [neuerKommentar, setNeuerKommentar] = useState("");
  const [sendet, setSendet] = useState(false);

  const [form, setForm] = useState({
    titel: eintrag?.titel ?? "",
    beschreibung: eintrag?.beschreibung ?? "",
    plattform: eintrag?.plattform ?? [],
    contentTyp: eintrag?.contentTyp ?? "",
    prioritaet: eintrag?.prioritaet ?? "",
    captionText: eintrag?.captionText ?? "",
    dateizugriff: eintrag?.dateizugriff ?? "",
    notizen: eintrag?.notizen ?? "",
    gepostetAm: eintrag?.gepostetAm
      ? new Date(eintrag.gepostetAm).toISOString().split("T")[0]
      : "",
  });

  function togglePlattform(p: string) {
    setForm((prev) => ({
      ...prev,
      plattform: prev.plattform.includes(p)
        ? prev.plattform.filter((x) => x !== p)
        : [...prev.plattform, p],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLaden(true);
    setFehler("");

    const url = bearbeiten
      ? `/api/admin/archiv/${eintrag!.id}`
      : "/api/admin/archiv";

    const res = await fetch(url, {
      method: bearbeiten ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, kundenprofilId }),
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
    await fetch(`/api/admin/archiv/${eintrag.id}`, { method: "DELETE" });
    onClose();
    router.refresh();
  }

  async function kommentarSenden() {
    if (!eintrag || !neuerKommentar.trim()) return;
    setSendet(true);
    const res = await fetch(`/api/archiv/${eintrag.id}/kommentare`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: neuerKommentar.trim() }),
    });
    setSendet(false);
    if (res.ok) {
      const k = await res.json();
      setKommentare((prev) => [...prev, k]);
      setNeuerKommentar("");
    }
  }

  return (
    <div className="fixed inset-0 glass-overlay z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="glass-modal rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto " onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-divider flex items-center justify-between">
          <h3 className="font-semibold text-fg">{bearbeiten ? "Archiveintrag bearbeiten" : "Neuer Archiveintrag"}</h3>
          <button onClick={onClose} className="text-muted hover:text-fg transition-colors">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm text-muted mb-1.5">Titel</label>
            <input
              type="text"
              value={form.titel}
              onChange={(e) => setForm((p) => ({ ...p, titel: e.target.value }))}
              placeholder="z.B. Produkt-Reel Mai"
              className={inputKlasse}
            />
          </div>

          <div>
            <label className="block text-sm text-muted mb-1.5">Beschreibung</label>
            <textarea
              value={form.beschreibung}
              onChange={(e) => setForm((p) => ({ ...p, beschreibung: e.target.value }))}
              placeholder="Kurze Inhaltsbeschreibung..."
              className={`${inputKlasse} min-h-[80px] resize-none`}
            />
          </div>

          <div>
            <label className="block text-sm text-muted mb-2">Plattform</label>
            <div className="flex flex-wrap gap-2">
              {PLATTFORMEN.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePlattform(p)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                    form.plattform.includes(p)
                      ? "bg-accent border-accent text-white"
                      : "bg-elevated border-divider text-muted hover:border-muted/60 hover:text-fg"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-muted mb-1.5">Content-Typ</label>
              <select value={form.contentTyp} onChange={(e) => setForm((p) => ({ ...p, contentTyp: e.target.value }))} className={inputKlasse}>
                <option value="">–</option>
                {CONTENT_TYPEN.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-muted mb-1.5">Priorität</label>
              <select value={form.prioritaet} onChange={(e) => setForm((p) => ({ ...p, prioritaet: e.target.value }))} className={inputKlasse}>
                <option value="">–</option>
                {PRIORITAETEN.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-muted mb-1.5">Gepostet am</label>
            <input
              type="date"
              value={form.gepostetAm}
              onChange={(e) => setForm((p) => ({ ...p, gepostetAm: e.target.value }))}
              className={inputKlasse}
            />
          </div>

          <div>
            <label className="block text-sm text-muted mb-1.5">Caption / Text</label>
            <textarea
              value={form.captionText}
              onChange={(e) => setForm((p) => ({ ...p, captionText: e.target.value }))}
              placeholder="Post-Text..."
              className={`${inputKlasse} min-h-[80px] resize-y`}
            />
          </div>

          <div>
            <label className="block text-sm text-muted mb-1.5">Dateizugriff</label>
            <input
              type="url"
              value={form.dateizugriff}
              onChange={(e) => setForm((p) => ({ ...p, dateizugriff: e.target.value }))}
              placeholder="https://..."
              className={inputKlasse}
            />
          </div>

          <div>
            <label className="block text-sm text-muted mb-1.5">Notizen</label>
            <textarea
              value={form.notizen}
              onChange={(e) => setForm((p) => ({ ...p, notizen: e.target.value }))}
              placeholder="Interne Notizen..."
              className={`${inputKlasse} min-h-[60px] resize-none`}
            />
          </div>

          {fehler && (
            <p className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2">{fehler}</p>
          )}

          <div className="flex gap-2 pt-1">
            {bearbeiten && (
              <button type="button" onClick={handleLoeschen} className="px-4 py-2.5 rounded-xl text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                Löschen
              </button>
            )}
            <div className="flex gap-2 ml-auto">
              <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm bg-elevated text-fg hover:opacity-80 transition-opacity border border-divider">
                Abbrechen
              </button>
              <button type="submit" disabled={laden} className="px-5 py-2.5 rounded-xl text-sm bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-medium transition-colors">
                {laden ? "..." : bearbeiten ? "Speichern" : "Erstellen"}
              </button>
            </div>
          </div>
        </form>

        {/* Kommentare — nur bei bestehendem Eintrag */}
        {bearbeiten && (
          <div className="border-t border-divider px-5 py-4">
            <p className="text-xs font-medium text-muted mb-3">Kommentare ({kommentare.length})</p>

            <div className="space-y-3 mb-4">
              {kommentare.length === 0 && (
                <p className="text-subtle text-xs">Noch keine Kommentare.</p>
              )}
              {kommentare.map((k) => (
                <div key={k.id} className="flex gap-2.5">
                  <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 text-xs font-medium ${k.autorTyp === "Agentur" ? "bg-accent" : "bg-muted/50"}`}>
                    {k.autorTyp === "Agentur" ? "A" : "K"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="text-xs font-medium text-fg">{k.autorName ?? k.autorTyp}</span>
                      <span className="text-xs text-subtle">
                        {new Date(k.createdAt).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-sm text-fg">{k.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <textarea
                value={neuerKommentar}
                onChange={(e) => setNeuerKommentar(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); kommentarSenden(); } }}
                placeholder="Kommentar schreiben..."
                rows={2}
                className="flex-1 bg-elevated border border-divider text-fg rounded-xl px-3 py-2 text-sm placeholder:text-subtle focus:outline-none focus:border-accent transition-colors resize-none"
              />
              <button
                onClick={kommentarSenden}
                disabled={sendet || !neuerKommentar.trim()}
                className="self-end px-4 py-2 rounded-xl text-sm bg-accent hover:bg-accent-hover disabled:opacity-40 text-white font-medium transition-colors"
              >
                {sendet ? "..." : "Senden"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
