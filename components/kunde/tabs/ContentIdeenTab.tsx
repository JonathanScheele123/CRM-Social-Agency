"use client";

import { useState, useTransition } from "react";

type Kommentar = {
  id: string;
  text: string;
  autorTyp: string;
  autorName: string | null;
  createdAt: Date;
};

type ContentIdea = {
  id: string;
  titel: string | null;
  beschreibung: string | null;
  plattform: string[];
  contentTyp: string | null;
  eingereichtVon: string | null;
  prioritaet: string | null;
  status: string | null;
  notizen: string | null;
  gewuenschtesPostingDatum: Date | null;
  captionText: string | null;
  dateizugriff: string | null;
  createdAt: Date;
  kommentare: Kommentar[];
};

const STATUS_FARBEN: Record<string, string> = {
  Offen:      "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  Angenommen: "bg-green-500/20 text-green-300 border-green-500/30",
  Verworfen:  "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const PRIORITAET_FARBEN: Record<string, string> = {
  Hoch:    "bg-red-500/20 text-red-300",
  Mittel:  "bg-yellow-500/20 text-yellow-300",
  Niedrig: "bg-gray-500/20 text-gray-400",
};

const PLATTFORM_FARBEN: Record<string, string> = {
  Instagram: "bg-pink-500/20 text-pink-300",
  Facebook:  "bg-blue-500/20 text-blue-300",
  TikTok:    "bg-gray-500/20 text-gray-300",
  YouTube:   "bg-red-500/20 text-red-300",
  Sonstiges: "bg-gray-600/20 text-gray-400",
};

const PLATTFORMEN = ["Instagram", "Facebook", "TikTok", "YouTube", "Sonstiges"];
const CONTENT_TYPEN = ["Reel", "Story", "Bild", "Karussell"];

// ─── Einreich-Formular ───────────────────────────────────────────────────────

function IdeaEinreichenForm({
  kundenprofilId,
  onErfolg,
}: {
  kundenprofilId: string;
  onErfolg: (neueIdee: ContentIdea) => void;
}) {
  const [offen, setOffen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [fehler, setFehler] = useState("");
  const [form, setForm] = useState({
    beschreibung: "",
    plattform: [] as string[],
    contentTyp: "",
    gewuenschtesPostingDatum: "",
  });

  function toggleP(p: string) {
    setForm((prev) => ({
      ...prev,
      plattform: prev.plattform.includes(p)
        ? prev.plattform.filter((x) => x !== p)
        : [...prev.plattform, p],
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.beschreibung.trim()) return;
    setFehler("");

    startTransition(async () => {
      const res = await fetch("/api/ideen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, kundenprofilId }),
      });

      if (!res.ok) {
        setFehler("Fehler beim Einreichen. Bitte versuche es erneut.");
        return;
      }

      const data = await res.json();
      onErfolg({
        id: data.id,
        titel: null,
        beschreibung: form.beschreibung,
        plattform: form.plattform,
        contentTyp: form.contentTyp || null,
        eingereichtVon: "Kunde",
        prioritaet: null,
        status: "Offen",
        notizen: null,
        gewuenschtesPostingDatum: form.gewuenschtesPostingDatum
          ? new Date(form.gewuenschtesPostingDatum)
          : null,
        captionText: null,
        dateizugriff: null,
        createdAt: new Date(),
        kommentare: [],
      });

      setForm({ beschreibung: "", plattform: [], contentTyp: "", gewuenschtesPostingDatum: "" });
      setOffen(false);
    });
  }

  if (!offen) {
    return (
      <button
        onClick={() => setOffen(true)}
        className="w-full border-2 border-dashed border-gray-700 hover:border-blue-500/50 rounded-xl p-4 text-gray-400 hover:text-blue-400 text-sm transition-colors flex items-center justify-center gap-2"
      >
        <span className="text-lg">+</span> Eigene Idee einreichen
      </button>
    );
  }

  return (
    <div className="bg-gray-900 border border-blue-500/30 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm text-blue-300">Neue Idee einreichen</h3>
        <button onClick={() => setOffen(false)} className="text-gray-500 hover:text-white text-xs">Abbrechen</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={form.beschreibung}
          onChange={(e) => setForm((p) => ({ ...p, beschreibung: e.target.value }))}
          placeholder="Beschreibe deine Content-Idee..."
          required
          className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 min-h-[80px] resize-none"
        />

        <div>
          <p className="text-xs text-gray-400 mb-1.5">Plattform</p>
          <div className="flex flex-wrap gap-1.5">
            {PLATTFORMEN.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => toggleP(p)}
                className={`px-2.5 py-1 rounded-lg text-xs border transition-colors ${
                  form.plattform.includes(p)
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-gray-800 border-gray-700 text-gray-300"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs text-gray-400 mb-1.5">Content-Typ</p>
            <select
              value={form.contentTyp}
              onChange={(e) => setForm((p) => ({ ...p, contentTyp: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="">–</option>
              {CONTENT_TYPEN.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1.5">Gewünschtes Datum</p>
            <input
              type="date"
              value={form.gewuenschtesPostingDatum}
              onChange={(e) => setForm((p) => ({ ...p, gewuenschtesPostingDatum: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {fehler && <p className="text-red-400 text-xs">{fehler}</p>}

        <button
          type="submit"
          disabled={pending || !form.beschreibung.trim()}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl py-2.5 transition-colors"
        >
          {pending ? "Wird eingereicht..." : "Idee einreichen"}
        </button>
      </form>
    </div>
  );
}

// ─── Kommentar-Bereich ────────────────────────────────────────────────────────

function KommentarBereich({
  ideaId,
  kommentare,
  onNeu,
}: {
  ideaId: string;
  kommentare: Kommentar[];
  onNeu: (k: Kommentar) => void;
}) {
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();
  const [fehler, setFehler] = useState("");

  function absenden(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setFehler("");

    startTransition(async () => {
      const res = await fetch(`/api/ideen/${ideaId}/kommentare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        setFehler("Fehler beim Senden.");
        return;
      }

      const data = await res.json();
      onNeu({ ...data, createdAt: new Date(data.createdAt) });
      setText("");
    });
  }

  return (
    <div className="border-t border-gray-800 pt-4 mt-4">
      <p className="text-xs text-gray-400 font-medium mb-3">
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

      <form onSubmit={absenden} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Kommentar schreiben..."
          className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={pending || !text.trim()}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-xl transition-colors shrink-0"
        >
          {pending ? "..." : "Senden"}
        </button>
      </form>
      {fehler && <p className="text-red-400 text-xs mt-1">{fehler}</p>}
    </div>
  );
}

// ─── Detail-Modal ─────────────────────────────────────────────────────────────

function IdeaDetailModal({
  idee,
  onSchliessen,
  onGespeichert,
  onKommentarHinzugefuegt,
}: {
  idee: ContentIdea;
  onSchliessen: () => void;
  onGespeichert: (aktualisiert: Partial<ContentIdea>) => void;
  onKommentarHinzugefuegt: (ideaId: string, k: Kommentar) => void;
}) {
  const [bearbeitenModus, setBearbeitenModus] = useState(false);
  const [pending, startTransition] = useTransition();
  const [fehler, setFehler] = useState("");

  const [editForm, setEditForm] = useState({
    beschreibung: idee.beschreibung ?? "",
    plattform: idee.plattform,
    contentTyp: idee.contentTyp ?? "",
    gewuenschtesPostingDatum: idee.gewuenschtesPostingDatum
      ? new Date(idee.gewuenschtesPostingDatum).toISOString().split("T")[0]
      : "",
  });

  function toggleP(p: string) {
    setEditForm((prev) => ({
      ...prev,
      plattform: prev.plattform.includes(p)
        ? prev.plattform.filter((x) => x !== p)
        : [...prev.plattform, p],
    }));
  }

  function handleSpeichern(e: React.FormEvent) {
    e.preventDefault();
    setFehler("");

    startTransition(async () => {
      const res = await fetch(`/api/ideen/${idee.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          beschreibung: editForm.beschreibung,
          plattform: editForm.plattform,
          contentTyp: editForm.contentTyp || null,
          gewuenschtesPostingDatum: editForm.gewuenschtesPostingDatum || null,
        }),
      });

      if (!res.ok) {
        setFehler("Fehler beim Speichern.");
        return;
      }

      onGespeichert({
        beschreibung: editForm.beschreibung,
        plattform: editForm.plattform,
        contentTyp: editForm.contentTyp || null,
        gewuenschtesPostingDatum: editForm.gewuenschtesPostingDatum
          ? new Date(editForm.gewuenschtesPostingDatum)
          : null,
      });
      setBearbeitenModus(false);
    });
  }

  const kannBearbeiten = idee.eingereichtVon === "Kunde";

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onSchliessen}
    >
      <div
        className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold">{idee.titel ?? (idee.beschreibung?.slice(0, 40) ?? "Idee")}</h3>
            {idee.status && (
              <span className={`text-xs px-2 py-0.5 rounded-md border mt-1 inline-block ${STATUS_FARBEN[idee.status] ?? ""}`}>
                {idee.status}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 ml-3 shrink-0">
            {kannBearbeiten && !bearbeitenModus && (
              <button
                onClick={() => setBearbeitenModus(true)}
                className="text-xs text-blue-400 hover:text-blue-300 px-2.5 py-1 rounded-lg bg-blue-950/30 border border-blue-800/30 transition-colors"
              >
                Bearbeiten
              </button>
            )}
            <button onClick={onSchliessen} className="text-gray-400 hover:text-white">✕</button>
          </div>
        </div>

        {/* Bearbeiten-Formular */}
        {bearbeitenModus ? (
          <form onSubmit={handleSpeichern} className="space-y-3 mb-4">
            <div>
              <p className="text-xs text-gray-400 mb-1.5">Beschreibung</p>
              <textarea
                value={editForm.beschreibung}
                onChange={(e) => setEditForm((p) => ({ ...p, beschreibung: e.target.value }))}
                required
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 min-h-[80px] resize-none"
              />
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-1.5">Plattform</p>
              <div className="flex flex-wrap gap-1.5">
                {PLATTFORMEN.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => toggleP(p)}
                    className={`px-2.5 py-1 rounded-lg text-xs border transition-colors ${
                      editForm.plattform.includes(p)
                        ? "bg-blue-600 border-blue-500 text-white"
                        : "bg-gray-800 border-gray-700 text-gray-300"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-gray-400 mb-1.5">Content-Typ</p>
                <select
                  value={editForm.contentTyp}
                  onChange={(e) => setEditForm((p) => ({ ...p, contentTyp: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="">–</option>
                  {CONTENT_TYPEN.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1.5">Gewünschtes Datum</p>
                <input
                  type="date"
                  value={editForm.gewuenschtesPostingDatum}
                  onChange={(e) => setEditForm((p) => ({ ...p, gewuenschtesPostingDatum: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {fehler && <p className="text-red-400 text-xs">{fehler}</p>}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setBearbeitenModus(false)}
                className="flex-1 bg-gray-800 text-gray-300 text-sm rounded-xl py-2 hover:bg-gray-700 transition-colors"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={pending}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm rounded-xl py-2 transition-colors"
              >
                {pending ? "Speichert..." : "Speichern"}
              </button>
            </div>
          </form>
        ) : (
          /* Anzeigemodus */
          <div className="space-y-3 text-sm mb-4">
            {idee.beschreibung && (
              <div>
                <p className="text-gray-400 text-xs mb-1">Beschreibung</p>
                <p className="text-gray-200">{idee.beschreibung}</p>
              </div>
            )}
            {idee.captionText && (
              <div>
                <p className="text-gray-400 text-xs mb-1">Caption</p>
                <p className="text-gray-200 whitespace-pre-wrap">{idee.captionText}</p>
              </div>
            )}
            {idee.notizen && (
              <div>
                <p className="text-gray-400 text-xs mb-1">Notizen der Agentur</p>
                <p className="text-gray-200">{idee.notizen}</p>
              </div>
            )}
            <div className="flex flex-wrap gap-1.5">
              {idee.plattform.map((p) => (
                <span key={p} className={`text-xs px-1.5 py-0.5 rounded-md ${PLATTFORM_FARBEN[p] ?? "bg-gray-700 text-gray-300"}`}>{p}</span>
              ))}
              {idee.contentTyp && (
                <span className="text-xs px-1.5 py-0.5 rounded-md bg-gray-700 text-gray-300">{idee.contentTyp}</span>
              )}
              {idee.prioritaet && (
                <span className={`text-xs px-1.5 py-0.5 rounded-md ${PRIORITAET_FARBEN[idee.prioritaet] ?? ""}`}>{idee.prioritaet}</span>
              )}
            </div>
            {idee.gewuenschtesPostingDatum && (
              <div>
                <p className="text-gray-400 text-xs mb-1">Gewünschtes Datum</p>
                <p>{new Date(idee.gewuenschtesPostingDatum).toLocaleDateString("de-DE")}</p>
              </div>
            )}
            {idee.dateizugriff && (
              <a href={idee.dateizugriff} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline block text-sm">
                ↗ Datei öffnen
              </a>
            )}
          </div>
        )}

        {/* Kommentar-Bereich */}
        <KommentarBereich
          ideaId={idee.id}
          kommentare={idee.kommentare}
          onNeu={(k) => onKommentarHinzugefuegt(idee.id, k)}
        />
      </div>
    </div>
  );
}

// ─── Hauptkomponente ──────────────────────────────────────────────────────────

export default function ContentIdeenTab({
  ideen: initialIdeen,
  kundenprofilId,
}: {
  ideen: ContentIdea[];
  kundenprofilId: string;
}) {
  const [ideen, setIdeen] = useState(initialIdeen);
  const [statusFilter, setStatusFilter] = useState("alle");
  const [ausgewaehlt, setAusgewaehlt] = useState<ContentIdea | null>(null);

  const gefiltert = ideen.filter((i) =>
    statusFilter === "alle" ? true : i.status === statusFilter
  );

  function ideaAktualisieren(id: string, aenderungen: Partial<ContentIdea>) {
    setIdeen((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...aenderungen } : i))
    );
    setAusgewaehlt((prev) => (prev?.id === id ? { ...prev, ...aenderungen } : prev));
  }

  function kommentarHinzufuegen(ideaId: string, k: Kommentar) {
    setIdeen((prev) =>
      prev.map((i) =>
        i.id === ideaId ? { ...i, kommentare: [...i.kommentare, k] } : i
      )
    );
    setAusgewaehlt((prev) =>
      prev?.id === ideaId ? { ...prev, kommentare: [...prev.kommentare, k] } : prev
    );
  }

  return (
    <div>
      <div className="flex gap-2 mb-5 flex-wrap">
        {["alle", "Offen", "Angenommen", "Verworfen"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              statusFilter === s ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            {s === "alle" ? "Alle" : s}
          </button>
        ))}
        <span className="ml-auto text-gray-500 text-sm self-center">{gefiltert.length} Ideen</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        {gefiltert.map((idee) => (
          <button
            key={idee.id}
            onClick={() => setAusgewaehlt(idee)}
            className="bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl p-4 text-left transition-all hover:bg-gray-800/50"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-medium text-sm line-clamp-2 flex-1">
                {idee.titel ?? idee.beschreibung?.slice(0, 40) ?? "Ohne Titel"}
              </h3>
              {idee.status && (
                <span className={`text-xs px-2 py-0.5 rounded-md border shrink-0 ${STATUS_FARBEN[idee.status] ?? ""}`}>
                  {idee.status}
                </span>
              )}
            </div>
            {idee.beschreibung && (
              <p className="text-gray-400 text-xs line-clamp-2 mb-3">{idee.beschreibung}</p>
            )}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {idee.plattform.map((p) => (
                <span key={p} className={`text-xs px-1.5 py-0.5 rounded-md ${PLATTFORM_FARBEN[p] ?? "bg-gray-700 text-gray-300"}`}>
                  {p}
                </span>
              ))}
              {idee.contentTyp && (
                <span className="text-xs px-1.5 py-0.5 rounded-md bg-gray-700 text-gray-300">{idee.contentTyp}</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {idee.eingereichtVon === "Kunde" && (
                  <span className="text-xs text-blue-400">von dir</span>
                )}
                {idee.kommentare.length > 0 && (
                  <span className="text-xs text-gray-500">💬 {idee.kommentare.length}</span>
                )}
              </div>
              {idee.gewuenschtesPostingDatum && (
                <p className="text-xs text-gray-500">
                  {new Date(idee.gewuenschtesPostingDatum).toLocaleDateString("de-DE")}
                </p>
              )}
            </div>
          </button>
        ))}

        {gefiltert.length === 0 && statusFilter === "alle" && (
          <div className="col-span-3 text-center py-8 text-gray-500">Noch keine Ideen vorhanden.</div>
        )}
      </div>

      <IdeaEinreichenForm
        kundenprofilId={kundenprofilId}
        onErfolg={(neueIdee) => setIdeen((prev) => [neueIdee, ...prev])}
      />

      {ausgewaehlt && (
        <IdeaDetailModal
          idee={ausgewaehlt}
          onSchliessen={() => setAusgewaehlt(null)}
          onGespeichert={(aenderungen) => ideaAktualisieren(ausgewaehlt.id, aenderungen)}
          onKommentarHinzugefuegt={kommentarHinzufuegen}
        />
      )}
    </div>
  );
}
