"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const PLATTFORMEN = ["Instagram", "Facebook", "TikTok", "YouTube", "Sonstiges"];

const STATUS_FARBEN: Record<string, string> = {
  Offen:      "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300",
  Angenommen: "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300",
  Verworfen:  "bg-gray-100 dark:bg-gray-500/20 text-gray-500 dark:text-gray-400",
};

const PLATTFORM_FARBEN: Record<string, string> = {
  Instagram: "bg-pink-100 dark:bg-pink-500/20 text-pink-700 dark:text-pink-300",
  Facebook:  "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300",
  TikTok:    "bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-300",
  YouTube:   "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300",
  Sonstiges: "bg-gray-100 dark:bg-gray-600/20 text-gray-500 dark:text-gray-400",
};

type Kommentar = {
  id: string;
  text: string;
  autorTyp: string;
  autorName: string | null;
  createdAt: Date;
};

type Idee = {
  id: string;
  titel: string | null;
  beschreibung: string | null;
  plattform: string[];
  contentTyp: string | null;
  prioritaet: string | null;
  status: string | null;
  notizen: string | null;
  captionText: string | null;
  dateizugriff: string | null;
  gewuenschtesPostingDatum: Date | null;
  eingereichtVon: string | null;
  kommentare: Kommentar[];
};

type Props = {
  kundenprofilId: string;
  idee?: Idee;
  onClose: () => void;
};

const inputKlasse =
  "w-full bg-elevated border border-divider text-fg rounded-xl px-4 py-2.5 text-sm placeholder:text-subtle focus:outline-none focus:border-accent transition-colors";

export default function ContentIdeenModal({ kundenprofilId, idee, onClose }: Props) {
  const router = useRouter();
  const istNeu = !idee;
  const [bearbeitenModus, setBearbeitenModus] = useState(istNeu);
  const [laden, setLaden] = useState(false);
  const [fehler, setFehler] = useState("");
  const [kommentare, setKommentare] = useState<Kommentar[]>(idee?.kommentare ?? []);
  const [kommentarText, setKommentarText] = useState("");
  const [kommentarPending, startKommentarTransition] = useTransition();

  const [titelLaden, setTitelLaden] = useState(false);

  async function titelGenerieren() {
    if (!form.beschreibung.trim()) return;
    setTitelLaden(true);
    try {
      const res = await fetch("/api/admin/content-ideen/titel-generieren", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ beschreibung: form.beschreibung }),
      });
      if (res.ok) {
        const data = await res.json();
        setForm(p => ({ ...p, titel: data.titel }));
      }
    } finally {
      setTitelLaden(false);
    }
  }

  const [form, setForm] = useState({
    titel: idee?.titel ?? "",
    beschreibung: idee?.beschreibung ?? "",
    plattform: idee?.plattform ?? [],
    gewuenschtesPostingDatum: idee?.gewuenschtesPostingDatum
      ? new Date(idee.gewuenschtesPostingDatum).toISOString().split("T")[0]
      : "",
  });

  function togglePlattform(p: string) {
    setForm(prev => ({
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

    const url = !istNeu ? `/api/admin/content-ideen/${idee!.id}` : "/api/admin/content-ideen";
    const res = await fetch(url, {
      method: !istNeu ? "PATCH" : "POST",
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
    if (!idee || !confirm("Idee wirklich löschen?")) return;
    await fetch(`/api/admin/content-ideen/${idee.id}`, { method: "DELETE" });
    onClose();
    router.refresh();
  }

  async function kommentarSenden() {
    if (!kommentarText.trim() || !idee) return;
    startKommentarTransition(async () => {
      const res = await fetch(`/api/ideen/${idee.id}/kommentare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: kommentarText }),
      });
      if (res.ok) {
        const data = await res.json();
        setKommentare(prev => [...prev, { ...data, createdAt: new Date(data.createdAt) }]);
        setKommentarText("");
      }
    });
  }

  return (
    <div className="fixed inset-0 glass-overlay z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="glass-modal rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="p-5 border-b border-divider flex items-center justify-between">
          <h3 className="font-semibold text-fg">
            {istNeu ? "Neue Content-Idee" : (idee?.titel || idee?.beschreibung?.slice(0, 40) || "Idee")}
          </h3>
          <button onClick={onClose} className="text-muted hover:text-fg transition-colors">✕</button>
        </div>

        {/* ── Lese-Ansicht ── */}
        {!bearbeitenModus && idee && (
          <div className="p-5 space-y-4">
            {/* Status + Plattform + Typ */}
            <div className="flex flex-wrap gap-1.5">
              {idee.status && (
                <span className={`text-xs px-2 py-0.5 rounded-lg ${STATUS_FARBEN[idee.status] ?? "bg-elevated text-muted"}`}>
                  {idee.status}
                </span>
              )}
              {idee.plattform.map(p => (
                <span key={p} className={`text-xs px-1.5 py-0.5 rounded-md ${PLATTFORM_FARBEN[p] ?? "bg-elevated text-muted"}`}>{p}</span>
              ))}
              {idee.contentTyp && (
                <span className="text-xs px-1.5 py-0.5 rounded-md bg-elevated text-muted">{idee.contentTyp}</span>
              )}
            </div>

            {/* Kerninfo */}
            <div className="space-y-2">
              {idee.beschreibung && (
                <div>
                  <p className="text-xs text-subtle mb-0.5">Beschreibung</p>
                  <p className="text-sm text-fg">{idee.beschreibung}</p>
                </div>
              )}
              {idee.gewuenschtesPostingDatum && (
                <div>
                  <p className="text-xs text-subtle mb-0.5">Gewünschtes Datum</p>
                  <p className="text-sm text-fg">{new Date(idee.gewuenschtesPostingDatum).toLocaleDateString("de-DE")}</p>
                </div>
              )}
              {idee.eingereichtVon && (
                <p className="text-xs text-subtle">Eingereicht von: {idee.eingereichtVon}</p>
              )}
            </div>

            {/* Kommentare */}
            <div className="border-t border-divider pt-4">
              <p className="text-sm font-medium text-fg mb-3">
                Kommentare {kommentare.length > 0 && `(${kommentare.length})`}
              </p>
              {kommentare.length > 0 && (
                <div className="space-y-2 mb-3">
                  {kommentare.map(k => (
                    <div key={k.id} className={`rounded-xl px-3 py-2.5 text-sm ${
                      k.autorTyp === "Agentur"
                        ? "bg-accent/5 dark:bg-accent/10 border border-accent/20"
                        : "bg-elevated border border-divider"
                    }`}>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className={`text-xs font-medium ${k.autorTyp === "Agentur" ? "text-accent" : "text-fg"}`}>
                          {k.autorTyp === "Agentur" ? "Agentur" : (k.autorName ?? "Kunde")}
                        </span>
                        <span className="text-xs text-subtle">
                          {new Date(k.createdAt).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-fg whitespace-pre-wrap">{k.text}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={kommentarText}
                  onChange={e => setKommentarText(e.target.value)}
                  placeholder="Kommentar als Agentur..."
                  className="flex-1 bg-elevated border border-divider text-fg rounded-xl px-3 py-2 text-sm placeholder:text-subtle focus:outline-none focus:border-accent"
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); kommentarSenden(); } }}
                />
                <button type="button" disabled={kommentarPending || !kommentarText.trim()}
                  onClick={kommentarSenden}
                  className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-sm px-4 py-2 rounded-xl transition-colors shrink-0">
                  {kommentarPending ? "..." : "Senden"}
                </button>
              </div>
            </div>

            {/* Aktionen */}
            <div className="flex items-center justify-between pt-1 border-t border-divider">
              <button type="button" onClick={handleLoeschen}
                className="text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 px-3 py-2 rounded-xl transition-colors">
                Löschen
              </button>
              <button type="button" onClick={() => setBearbeitenModus(true)}
                className="text-sm bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-xl transition-colors font-medium">
                Bearbeiten
              </button>
            </div>
          </div>
        )}

        {/* ── Bearbeiten / Erstellen ── */}
        {bearbeitenModus && (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-sm text-muted mb-1.5">Titel</label>
              <div className="relative">
                <input type="text" value={form.titel}
                  onChange={e => setForm(p => ({ ...p, titel: e.target.value }))}
                  placeholder="z.B. Zeitraffer Montage" className={inputKlasse} />
                {titelLaden && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-subtle animate-pulse">KI…</span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm text-muted mb-1.5">Beschreibung</label>
              <textarea value={form.beschreibung}
                onChange={e => setForm(p => ({ ...p, beschreibung: e.target.value }))}
                onBlur={() => { if (form.beschreibung.trim() && !form.titel.trim()) titelGenerieren(); }}
                placeholder="Was ist die Idee?"
                className={`${inputKlasse} min-h-[80px] resize-none`} />
            </div>

            <div>
              <label className="block text-sm text-muted mb-2">Plattform</label>
              <div className="flex flex-wrap gap-2">
                {PLATTFORMEN.map(p => (
                  <button key={p} type="button" onClick={() => togglePlattform(p)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                      form.plattform.includes(p)
                        ? "bg-accent border-accent text-white"
                        : "bg-elevated border-divider text-muted hover:border-muted/60 hover:text-fg"
                    }`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-muted mb-1.5">Gewünschtes Datum</label>
              <input type="date" value={form.gewuenschtesPostingDatum}
                onChange={e => setForm(p => ({ ...p, gewuenschtesPostingDatum: e.target.value }))}
                className={inputKlasse} />
            </div>

            {fehler && (
              <p className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2">
                {fehler}
              </p>
            )}

            <div className="flex gap-2 pt-1">
              {!istNeu && (
                <button type="button" onClick={handleLoeschen}
                  className="px-4 py-2.5 rounded-xl text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                  Löschen
                </button>
              )}
              <div className="flex gap-2 ml-auto">
                <button type="button"
                  onClick={() => istNeu ? onClose() : setBearbeitenModus(false)}
                  className="px-4 py-2.5 rounded-xl text-sm bg-elevated text-fg hover:opacity-80 transition-opacity border border-divider">
                  Abbrechen
                </button>
                <button type="submit" disabled={laden}
                  className="px-5 py-2.5 rounded-xl text-sm bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-medium transition-colors">
                  {laden ? "..." : istNeu ? "Erstellen" : "Speichern"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
