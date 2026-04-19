"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const PLATTFORMEN = ["Instagram", "Facebook", "TikTok", "YouTube", "Sonstiges"];
const CONTENT_TYPEN = ["Reel", "Story", "Bild", "Karussell"];
const PRIORITAETEN = ["Hoch", "Mittel", "Niedrig"];
const STATUSOPTIONEN = ["Offen", "Angenommen", "Verworfen"];

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
  "w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors";

export default function ContentIdeenModal({ kundenprofilId, idee, onClose }: Props) {
  const router = useRouter();
  const bearbeiten = !!idee;
  const [laden, setLaden] = useState(false);
  const [fehler, setFehler] = useState("");
  const [kommentare, setKommentare] = useState<Kommentar[]>(idee?.kommentare ?? []);
  const [kommentarText, setKommentarText] = useState("");
  const [kommentarPending, startKommentarTransition] = useTransition();

  const [form, setForm] = useState({
    titel: idee?.titel ?? "",
    beschreibung: idee?.beschreibung ?? "",
    plattform: idee?.plattform ?? [],
    contentTyp: idee?.contentTyp ?? "",
    prioritaet: idee?.prioritaet ?? "",
    status: idee?.status ?? "Offen",
    notizen: idee?.notizen ?? "",
    captionText: idee?.captionText ?? "",
    dateizugriff: idee?.dateizugriff ?? "",
    gewuenschtesPostingDatum: idee?.gewuenschtesPostingDatum
      ? new Date(idee.gewuenschtesPostingDatum).toISOString().split("T")[0]
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
      ? `/api/admin/content-ideen/${idee!.id}`
      : "/api/admin/content-ideen";

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
    if (!idee || !confirm("Idee wirklich löschen?")) return;
    await fetch(`/api/admin/content-ideen/${idee.id}`, { method: "DELETE" });
    onClose();
    router.refresh();
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <h3 className="font-semibold">
            {bearbeiten ? "Idee bearbeiten" : "Neue Content-Idee"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Titel</label>
            <input
              type="text"
              value={form.titel}
              onChange={(e) => setForm((p) => ({ ...p, titel: e.target.value }))}
              placeholder="z.B. Zeitraffer Montage"
              className={inputKlasse}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Beschreibung</label>
            <textarea
              value={form.beschreibung}
              onChange={(e) => setForm((p) => ({ ...p, beschreibung: e.target.value }))}
              placeholder="Was ist die Idee?"
              className={`${inputKlasse} min-h-[80px] resize-none`}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Plattform</label>
            <div className="flex flex-wrap gap-2">
              {PLATTFORMEN.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePlattform(p)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                    form.plattform.includes(p)
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Content-Typ</label>
              <select
                value={form.contentTyp}
                onChange={(e) => setForm((p) => ({ ...p, contentTyp: e.target.value }))}
                className={inputKlasse}
              >
                <option value="">–</option>
                {CONTENT_TYPEN.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Priorität</label>
              <select
                value={form.prioritaet}
                onChange={(e) => setForm((p) => ({ ...p, prioritaet: e.target.value }))}
                className={inputKlasse}
              >
                <option value="">–</option>
                {PRIORITAETEN.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                className={inputKlasse}
              >
                {STATUSOPTIONEN.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Gewünschtes Datum</label>
              <input
                type="date"
                value={form.gewuenschtesPostingDatum}
                onChange={(e) =>
                  setForm((p) => ({ ...p, gewuenschtesPostingDatum: e.target.value }))
                }
                className={inputKlasse}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Caption / Text</label>
            <textarea
              value={form.captionText}
              onChange={(e) => setForm((p) => ({ ...p, captionText: e.target.value }))}
              placeholder="Post-Text..."
              className={`${inputKlasse} min-h-[80px] resize-y`}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Dateizugriff</label>
            <input
              type="url"
              value={form.dateizugriff}
              onChange={(e) => setForm((p) => ({ ...p, dateizugriff: e.target.value }))}
              placeholder="https://..."
              className={inputKlasse}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Notizen</label>
            <textarea
              value={form.notizen}
              onChange={(e) => setForm((p) => ({ ...p, notizen: e.target.value }))}
              placeholder="Interne Notizen..."
              className={`${inputKlasse} min-h-[60px] resize-none`}
            />
          </div>

          {fehler && (
            <p className="text-red-400 text-sm bg-red-950 border border-red-800 rounded-xl px-3 py-2">
              {fehler}
            </p>
          )}

          {/* Kommentare — nur im Bearbeitungsmodus */}
          {bearbeiten && (
            <div className="border-t border-gray-800 pt-4">
              <p className="text-sm text-gray-300 font-medium mb-3">
                Kommentare {kommentare.length > 0 && `(${kommentare.length})`}
              </p>
              {kommentare.length > 0 && (
                <div className="space-y-2 mb-3">
                  {kommentare.map((k) => (
                    <div
                      key={k.id}
                      className={`rounded-xl px-3 py-2.5 text-sm ${
                        k.autorTyp === "Agentur"
                          ? "bg-blue-950/40 border border-blue-800/30"
                          : "bg-gray-800 border border-gray-700"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className={`text-xs font-medium ${k.autorTyp === "Agentur" ? "text-blue-300" : "text-gray-300"}`}>
                          {k.autorTyp === "Agentur" ? "Agentur" : (k.autorName ?? "Kunde")}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(k.createdAt).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-gray-200 whitespace-pre-wrap">{k.text}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={kommentarText}
                  onChange={(e) => setKommentarText(e.target.value)}
                  placeholder="Kommentar als Agentur..."
                  className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (!kommentarText.trim() || kommentarPending) return;
                      startKommentarTransition(async () => {
                        const res = await fetch(`/api/ideen/${idee!.id}/kommentare`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ text: kommentarText }),
                        });
                        if (res.ok) {
                          const data = await res.json();
                          setKommentare((prev) => [...prev, { ...data, createdAt: new Date(data.createdAt) }]);
                          setKommentarText("");
                        }
                      });
                    }
                  }}
                />
                <button
                  type="button"
                  disabled={kommentarPending || !kommentarText.trim()}
                  onClick={() => {
                    if (!kommentarText.trim()) return;
                    startKommentarTransition(async () => {
                      const res = await fetch(`/api/ideen/${idee!.id}/kommentare`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ text: kommentarText }),
                      });
                      if (res.ok) {
                        const data = await res.json();
                        setKommentare((prev) => [...prev, { ...data, createdAt: new Date(data.createdAt) }]);
                        setKommentarText("");
                      }
                    });
                  }}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-xl transition-colors shrink-0"
                >
                  {kommentarPending ? "..." : "Senden"}
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            {bearbeiten && (
              <button
                type="button"
                onClick={handleLoeschen}
                className="px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-950/30 transition-colors"
              >
                Löschen
              </button>
            )}
            <div className="flex gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-sm bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={laden}
                className="px-5 py-2.5 rounded-xl text-sm bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium transition-colors"
              >
                {laden ? "..." : bearbeiten ? "Speichern" : "Erstellen"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
