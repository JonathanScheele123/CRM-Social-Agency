"use client";

import { useState, useTransition } from "react";

type KalenderEintrag = {
  id: string;
  titel: string | null;
  beschreibung: string | null;
  plattform: string[];
  contentTyp: string | null;
  geplantAm: Date | null;
  captionText: string | null;
  dateizugriff: string | null;
  notizen: string | null;
  freigabeStatus: string;
  freigabeKommentar: string | null;
  freigegebenAm: Date | null;
};

const STATUS_CONFIG = {
  Freigegeben:    { bg: "bg-green-950/40",  border: "border-green-600/40",  badge: "bg-green-500/20 text-green-300",  dot: "bg-green-500" },
  Abgelehnt:      { bg: "bg-red-950/30",    border: "border-red-600/40",    badge: "bg-red-500/20 text-red-300",      dot: "bg-red-500"   },
  Überarbeitung:  { bg: "bg-yellow-950/30", border: "border-yellow-600/40", badge: "bg-yellow-500/20 text-yellow-300",dot: "bg-yellow-500"},
  Ausstehend:     { bg: "bg-gray-900",      border: "border-gray-700",      badge: "bg-blue-500/20 text-blue-300",    dot: "bg-blue-500"  },
};

const PLATTFORM_FARBEN: Record<string, string> = {
  Instagram: "bg-pink-500/20 text-pink-300",
  Facebook:  "bg-blue-500/20 text-blue-300",
  TikTok:    "bg-gray-500/20 text-gray-300",
  YouTube:   "bg-red-500/20 text-red-300",
  Sonstiges: "bg-gray-600/20 text-gray-400",
};

function datumFormatieren(d: Date | null) {
  if (!d) return "–";
  return new Date(d).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// ─── Einzelne Freigabe-Karte ────────────────────────────────────────────────

function FreigabeKarte({
  eintrag,
  onStatusChange,
}: {
  eintrag: KalenderEintrag;
  onStatusChange: (id: string, status: string, kommentar: string) => Promise<void>;
}) {
  const [offen, setOffen] = useState(false);
  const [kommentarOffen, setKommentarOffen] = useState<"Abgelehnt" | "Überarbeitung" | null>(null);
  const [kommentar, setKommentar] = useState("");
  const [pending, startTransition] = useTransition();

  const cfg = STATUS_CONFIG[eintrag.freigabeStatus as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.Ausstehend;
  const istAusstehend = eintrag.freigabeStatus === "Ausstehend";

  function handleAktion(status: "Freigegeben" | "Abgelehnt" | "Überarbeitung") {
    if (status === "Freigegeben") {
      startTransition(() => onStatusChange(eintrag.id, status, ""));
    } else {
      setKommentarOffen(status);
    }
  }

  function handleKommentarAbschicken() {
    if (!kommentarOffen) return;
    startTransition(async () => {
      await onStatusChange(eintrag.id, kommentarOffen, kommentar);
      setKommentarOffen(null);
      setKommentar("");
    });
  }

  return (
    <div className={`rounded-2xl border ${cfg.bg} ${cfg.border} overflow-hidden transition-all`}>
      {/* Karten-Header */}
      <button
        className="w-full text-left p-4 sm:p-5"
        onClick={() => setOffen(!offen)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
              <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.badge}`}>
                {eintrag.freigabeStatus}
              </span>
            </div>
            <h3 className="font-semibold text-white">{eintrag.titel ?? "Ohne Titel"}</h3>
            {eintrag.beschreibung && (
              <p className="text-gray-400 text-sm mt-1 line-clamp-2">{eintrag.beschreibung}</p>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-gray-400 text-xs">{datumFormatieren(eintrag.geplantAm)}</p>
            <div className="flex gap-1 mt-1.5 justify-end flex-wrap">
              {eintrag.plattform.map(p => (
                <span key={p} className={`text-xs px-1.5 py-0.5 rounded-md ${PLATTFORM_FARBEN[p] ?? "bg-gray-700 text-gray-300"}`}>
                  {p}
                </span>
              ))}
              {eintrag.contentTyp && (
                <span className="text-xs px-1.5 py-0.5 rounded-md bg-gray-700 text-gray-300">
                  {eintrag.contentTyp}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end mt-2">
          <span className="text-xs text-gray-500">{offen ? "weniger ▲" : "Details ▼"}</span>
        </div>
      </button>

      {/* Ausgeklappter Inhalt */}
      {offen && (
        <div className="px-4 sm:px-5 pb-5 space-y-4 border-t border-gray-700/50 pt-4">
          {eintrag.captionText && (
            <div>
              <p className="text-xs text-gray-400 mb-1.5 uppercase tracking-wide">Caption / Text</p>
              <div className="bg-gray-900/60 rounded-xl p-3 text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
                {eintrag.captionText}
              </div>
            </div>
          )}

          {eintrag.notizen && (
            <div>
              <p className="text-xs text-gray-400 mb-1.5 uppercase tracking-wide">Notizen der Agentur</p>
              <p className="text-sm text-gray-300">{eintrag.notizen}</p>
            </div>
          )}

          {eintrag.dateizugriff && (
            <div>
              <p className="text-xs text-gray-400 mb-1.5 uppercase tracking-wide">Dateizugriff</p>
              <a
                href={eintrag.dateizugriff}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 hover:underline"
              >
                ↗ Datei öffnen
              </a>
            </div>
          )}

          {/* Aktuelles Feedback */}
          {!istAusstehend && eintrag.freigabeKommentar && (
            <div className="bg-gray-900/60 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Ihr Kommentar</p>
              <p className="text-sm text-gray-200">{eintrag.freigabeKommentar}</p>
            </div>
          )}

          {/* Freigabe-Aktionen */}
          {istAusstehend && (
            <div className="pt-1">
              {kommentarOffen ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-300">
                    {kommentarOffen === "Abgelehnt"
                      ? "Warum wird dieser Inhalt abgelehnt?"
                      : "Was soll überarbeitet werden?"}
                  </p>
                  <textarea
                    value={kommentar}
                    onChange={e => setKommentar(e.target.value)}
                    placeholder="Ihr Kommentar..."
                    className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 min-h-[80px] resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setKommentarOffen(null); setKommentar(""); }}
                      className="flex-1 bg-gray-800 text-gray-300 rounded-xl py-2.5 text-sm hover:bg-gray-700 transition-colors"
                    >
                      Abbrechen
                    </button>
                    <button
                      onClick={handleKommentarAbschicken}
                      disabled={pending}
                      className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-colors ${
                        kommentarOffen === "Abgelehnt"
                          ? "bg-red-600 hover:bg-red-500 text-white"
                          : "bg-yellow-600 hover:bg-yellow-500 text-white"
                      } disabled:opacity-50`}
                    >
                      {pending ? "..." : kommentarOffen === "Abgelehnt" ? "Ablehnen" : "Überarbeitung anfragen"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAktion("Freigegeben")}
                    disabled={pending}
                    className="flex-1 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-medium rounded-xl py-3 text-sm transition-colors"
                  >
                    {pending ? "..." : "✓ Freigeben"}
                  </button>
                  <button
                    onClick={() => handleAktion("Überarbeitung")}
                    disabled={pending}
                    className="flex-1 bg-yellow-600/80 hover:bg-yellow-600 disabled:opacity-50 text-white font-medium rounded-xl py-3 text-sm transition-colors"
                  >
                    ↺ Überarbeitung
                  </button>
                  <button
                    onClick={() => handleAktion("Abgelehnt")}
                    disabled={pending}
                    className="flex-1 bg-gray-700 hover:bg-red-900/60 disabled:opacity-50 text-red-300 font-medium rounded-xl py-3 text-sm transition-colors"
                  >
                    ✕ Ablehnen
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Status bereits erteilt */}
          {!istAusstehend && eintrag.freigegebenAm && (
            <p className="text-xs text-gray-500 text-right">
              {eintrag.freigabeStatus} am {datumFormatieren(eintrag.freigegebenAm)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── FreigabeTab ─────────────────────────────────────────────────────────────

export default function FreigabeTab({ eintraege: initialEintraege }: { eintraege: KalenderEintrag[] }) {
  const [eintraege, setEintraege] = useState(initialEintraege);
  const [filter, setFilter] = useState<"alle" | "Ausstehend" | "Freigegeben" | "Abgelehnt" | "Überarbeitung">("Ausstehend");

  const ausstehend = eintraege.filter(e => e.freigabeStatus === "Ausstehend").length;

  async function handleStatusChange(id: string, status: string, kommentar: string) {
    const res = await fetch(`/api/freigabe/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, kommentar: kommentar || null }),
    });

    if (res.ok) {
      setEintraege(prev =>
        prev.map(e =>
          e.id === id
            ? { ...e, freigabeStatus: status, freigabeKommentar: kommentar || null, freigegebenAm: new Date() }
            : e
        )
      );
    }
  }

  const gefiltert = eintraege.filter(e =>
    filter === "alle" ? true : e.freigabeStatus === filter
  );

  return (
    <div>
      {/* Header mit Badges */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-semibold text-lg">Content-Freigabe</h2>
          {ausstehend > 0 && (
            <p className="text-sm text-blue-400 mt-0.5">
              {ausstehend} {ausstehend === 1 ? "Eintrag wartet" : "Einträge warten"} auf Ihre Freigabe
            </p>
          )}
          {ausstehend === 0 && (
            <p className="text-sm text-green-400 mt-0.5">Alles erledigt – kein ausstehender Content</p>
          )}
        </div>
      </div>

      {/* Statistik-Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Ausstehend", farbe: "blue" },
          { label: "Freigegeben", farbe: "green" },
          { label: "Überarbeitung", farbe: "yellow" },
          { label: "Abgelehnt", farbe: "red" },
        ].map(({ label, farbe }) => {
          const anzahl = eintraege.filter(e => e.freigabeStatus === label).length;
          const farbeKlasse = {
            blue:   "bg-blue-900/30 border-blue-700/50 text-blue-300",
            green:  "bg-green-900/30 border-green-700/50 text-green-300",
            yellow: "bg-yellow-900/30 border-yellow-700/50 text-yellow-300",
            red:    "bg-red-900/30 border-red-700/50 text-red-300",
          }[farbe];
          return (
            <button
              key={label}
              onClick={() => setFilter(label as typeof filter)}
              className={`rounded-xl border p-3 text-left transition-all ${farbeKlasse} ${
                filter === label ? "ring-2 ring-white/20" : "opacity-70 hover:opacity-100"
              }`}
            >
              <p className="text-2xl font-bold">{anzahl}</p>
              <p className="text-xs mt-0.5">{label}</p>
            </button>
          );
        })}
      </div>

      {/* Filter-Toggle */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {(["alle", "Ausstehend", "Freigegeben", "Überarbeitung", "Abgelehnt"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              filter === f ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            {f === "alle" ? "Alle" : f}
          </button>
        ))}
        <span className="ml-auto text-gray-500 text-sm self-center">{gefiltert.length} Einträge</span>
      </div>

      {/* Karten */}
      <div className="space-y-3">
        {gefiltert.map(eintrag => (
          <FreigabeKarte
            key={eintrag.id}
            eintrag={eintrag}
            onStatusChange={handleStatusChange}
          />
        ))}
        {gefiltert.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Keine Einträge in dieser Kategorie.
          </div>
        )}
      </div>
    </div>
  );
}
