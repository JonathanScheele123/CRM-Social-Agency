"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TAGS = [
  "Allgemeine Informationen",
  "Zielgruppe",
  "Produkte",
  "Auftreten des Betriebes",
  "Wünsche des Kunden",
  "Events/Termine",
  "Drehtag",
  "Zusatzinformationen",
];

type Eintrag = {
  id: string;
  beschreibung: string | null;
  inhalt: string | null;
  tags: string[];
  datum: Date | null;
  veraltet: boolean;
  hinzugefuegtVon: string | null;
};

type Props = {
  kundenprofilId: string;
  eintrag?: Eintrag;
  onClose: () => void;
};

const inputKlasse =
  "w-full bg-elevated border border-divider text-fg rounded-xl px-4 py-2.5 text-sm placeholder:text-subtle focus:outline-none focus:border-accent transition-colors";

export default function KundendatenModal({ kundenprofilId, eintrag, onClose }: Props) {
  const router = useRouter();
  const bearbeiten = !!eintrag;
  const [laden, setLaden] = useState(false);
  const [fehler, setFehler] = useState("");

  const [form, setForm] = useState({
    beschreibung: eintrag?.beschreibung ?? "",
    inhalt: eintrag?.inhalt ?? "",
    tags: eintrag?.tags ?? [],
    datum: eintrag?.datum ? new Date(eintrag.datum).toISOString().split("T")[0] : "",
    veraltet: eintrag?.veraltet ?? false,
    hinzugefuegtVon: eintrag?.hinzugefuegtVon ?? "",
  });

  function toggleTag(tag: string) {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLaden(true);
    setFehler("");

    const url = bearbeiten
      ? `/api/admin/kundendaten/${eintrag!.id}`
      : "/api/admin/kundendaten";

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
    await fetch(`/api/admin/kundendaten/${eintrag.id}`, { method: "DELETE" });
    onClose();
    router.refresh();
  }

  return (
    <div className="fixed inset-0 glass-overlay z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="glass-modal rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto " onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-divider flex items-center justify-between">
          <h3 className="font-semibold text-fg">{bearbeiten ? "Eintrag bearbeiten" : "Neuer Kundendaten-Eintrag"}</h3>
          <button onClick={onClose} className="text-muted hover:text-fg transition-colors">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm text-muted mb-1.5">Beschreibung / Titel</label>
            <input
              type="text"
              value={form.beschreibung}
              onChange={(e) => setForm((p) => ({ ...p, beschreibung: e.target.value }))}
              placeholder="z.B. Zielgruppe: Frauen 25–40"
              className={inputKlasse}
            />
          </div>

          <div>
            <label className="block text-sm text-muted mb-1.5">Inhalt</label>
            <textarea
              value={form.inhalt}
              onChange={(e) => setForm((p) => ({ ...p, inhalt: e.target.value }))}
              placeholder="Detaillierte Informationen..."
              className={`${inputKlasse} min-h-[100px] resize-y`}
            />
          </div>

          <div>
            <label className="block text-sm text-muted mb-2">Kategorie / Tags</label>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                    form.tags.includes(tag)
                      ? "bg-accent border-accent text-white"
                      : "bg-elevated border-divider text-muted hover:border-muted/60 hover:text-fg"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-muted mb-1.5">Datum</label>
              <input
                type="date"
                value={form.datum}
                onChange={(e) => setForm((p) => ({ ...p, datum: e.target.value }))}
                className={inputKlasse}
              />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1.5">Hinzugefügt von</label>
              <input
                type="text"
                value={form.hinzugefuegtVon}
                onChange={(e) => setForm((p) => ({ ...p, hinzugefuegtVon: e.target.value }))}
                placeholder="Name..."
                className={inputKlasse}
              />
            </div>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.veraltet}
              onChange={(e) => setForm((p) => ({ ...p, veraltet: e.target.checked }))}
              className="w-4 h-4 rounded accent-[var(--accent)]"
            />
            <span className="text-sm text-muted">Als veraltet markieren</span>
          </label>

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
      </div>
    </div>
  );
}
