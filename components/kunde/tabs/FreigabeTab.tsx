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
  Freigegeben: { bg: "bg-green-50 dark:bg-green-950/40",  border: "border-green-200 dark:border-green-600/40",  badge: "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300",  dot: "bg-green-500" },
  Abgelehnt:   { bg: "bg-red-50 dark:bg-red-950/30",      border: "border-red-200 dark:border-red-600/40",      badge: "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300",          dot: "bg-red-500"   },
  Ausstehend:  { bg: "bg-card",                           border: "border-divider",                             badge: "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300",      dot: "bg-blue-500"  },
};

const PLATTFORM_FARBEN: Record<string, string> = {
  Instagram: "bg-pink-100 dark:bg-pink-500/20 text-pink-700 dark:text-pink-300",
  Facebook:  "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300",
  TikTok:    "bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-300",
  YouTube:   "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300",
  Sonstiges: "bg-gray-100 dark:bg-gray-600/20 text-gray-500 dark:text-gray-400",
};

function datumFormatieren(d: Date | null) {
  if (!d) return "–";
  return new Date(d).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function FreigabeKarte({
  eintrag,
  onStatusChange,
}: {
  eintrag: KalenderEintrag;
  onStatusChange: (id: string, status: string, kommentar: string) => Promise<void>;
}) {
  const [offen, setOffen] = useState(false);
  const [aktion, setAktion] = useState<"ablehnen" | "freigeben" | null>(null);
  const [kommentar, setKommentar] = useState("");
  const [pending, startTransition] = useTransition();

  const status = eintrag.freigabeStatus || "Ausstehend";
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.Ausstehend;
  const istAusstehend = status === "Ausstehend";
  const istFreigegeben = eintrag.freigabeStatus === "Freigegeben";

  function handleFreigeben() {
    if (aktion === "freigeben") {
      startTransition(async () => {
        await onStatusChange(eintrag.id, "Freigegeben", kommentar);
        setAktion(null);
        setKommentar("");
      });
    } else {
      setAktion("freigeben");
    }
  }

  function handleAblehnen() {
    setAktion("ablehnen");
  }

  function handleAbschicken() {
    startTransition(async () => {
      await onStatusChange(eintrag.id, aktion === "ablehnen" ? "Abgelehnt" : "Freigegeben", kommentar);
      setAktion(null);
      setKommentar("");
    });
  }

  function handleWiderrufen() {
    startTransition(async () => {
      await onStatusChange(eintrag.id, "Ausstehend", "");
    });
  }

  return (
    <div className={`rounded-2xl border ${cfg.bg} ${cfg.border} overflow-hidden transition-all shadow-sm`}>
      <button className="w-full text-left p-4 sm:p-5" onClick={() => setOffen(!offen)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
              <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.badge}`}>
                {status === "Ausstehend" ? "Offen" : status}
              </span>
            </div>
            <h3 className="font-semibold text-fg">{eintrag.titel ?? "Ohne Titel"}</h3>
            {eintrag.beschreibung && (
              <p className="text-muted text-sm mt-1 line-clamp-2">{eintrag.beschreibung}</p>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-muted text-xs">{datumFormatieren(eintrag.geplantAm)}</p>
            <div className="flex gap-1 mt-1.5 justify-end flex-wrap">
              {eintrag.plattform.map(p => (
                <span key={p} className={`text-xs px-1.5 py-0.5 rounded-md ${PLATTFORM_FARBEN[p] ?? "bg-elevated text-muted"}`}>
                  {p}
                </span>
              ))}
              {eintrag.contentTyp && (
                <span className="text-xs px-1.5 py-0.5 rounded-md bg-elevated text-muted">
                  {eintrag.contentTyp}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end mt-2">
          <span className="text-xs text-subtle">{offen ? "weniger ▲" : "Details ▼"}</span>
        </div>
      </button>

      {offen && (
        <div className="px-4 sm:px-5 pb-5 space-y-4 border-t border-divider pt-4">
          {eintrag.beschreibung && (
            <div>
              <p className="text-xs text-subtle mb-1.5 uppercase tracking-wide font-medium">Beschreibung</p>
              <p className="text-sm text-fg">{eintrag.beschreibung}</p>
            </div>
          )}
          {eintrag.captionText && (
            <div>
              <p className="text-xs text-subtle mb-1.5 uppercase tracking-wide font-medium">Caption / Text</p>
              <div className="bg-elevated rounded-xl p-3 text-sm text-fg whitespace-pre-wrap leading-relaxed">
                {eintrag.captionText}
              </div>
            </div>
          )}
          {eintrag.notizen && (
            <div>
              <p className="text-xs text-subtle mb-1.5 uppercase tracking-wide font-medium">Notizen der Agentur</p>
              <p className="text-sm text-muted">{eintrag.notizen}</p>
            </div>
          )}
          {eintrag.dateizugriff && (
            <div>
              <p className="text-xs text-subtle mb-1.5 uppercase tracking-wide font-medium">Dateizugriff</p>
              <a href={eintrag.dateizugriff} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-accent hover:underline">
                ↗ Datei öffnen
              </a>
            </div>
          )}
          {!istAusstehend && eintrag.freigabeKommentar && (
            <div className="bg-elevated rounded-xl p-3">
              <p className="text-xs text-subtle mb-1">Ihr Kommentar</p>
              <p className="text-sm text-fg">{eintrag.freigabeKommentar}</p>
            </div>
          )}

          {istAusstehend && (
            <div className="pt-1">
              {aktion ? (
                <div className="space-y-3">
                  <p className="text-sm text-fg">
                    {aktion === "ablehnen" ? "Warum wird dieser Inhalt abgelehnt?" : "Optionaler Kommentar zur Freigabe:"}
                  </p>
                  <textarea
                    value={kommentar}
                    onChange={e => setKommentar(e.target.value)}
                    placeholder="Ihr Kommentar (optional)..."
                    className="w-full bg-elevated border border-divider rounded-xl px-4 py-3 text-sm text-fg placeholder:text-subtle focus:outline-none focus:border-accent min-h-[80px] resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setAktion(null); setKommentar(""); }}
                      className="flex-1 bg-elevated text-fg rounded-xl py-2.5 text-sm hover:opacity-80 transition-opacity border border-divider"
                    >
                      Abbrechen
                    </button>
                    <button
                      onClick={handleAbschicken}
                      disabled={pending || (aktion === "ablehnen" && !kommentar.trim())}
                      className={`flex-1 text-white rounded-xl py-2.5 text-sm font-medium transition-colors disabled:opacity-50 ${
                        aktion === "ablehnen"
                          ? "bg-red-600 hover:bg-red-500"
                          : "bg-green-600 hover:bg-green-500"
                      }`}
                    >
                      {pending ? "..." : aktion === "ablehnen" ? "Ablehnen" : "✓ Freigeben"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleFreigeben}
                    disabled={pending}
                    className="flex-1 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-medium rounded-xl py-3 text-sm transition-colors"
                  >
                    ✓ Freigeben
                  </button>
                  <button
                    onClick={handleAblehnen}
                    disabled={pending}
                    className="flex-1 bg-elevated hover:bg-red-50 dark:hover:bg-red-900/30 disabled:opacity-50 text-red-600 dark:text-red-400 font-medium rounded-xl py-3 text-sm transition-colors border border-divider"
                  >
                    ✕ Ablehnen
                  </button>
                </div>
              )}
            </div>
          )}

          {istFreigegeben && (
            <div className="pt-1 border-t border-divider">
              <button
                onClick={handleWiderrufen}
                disabled={pending}
                className="w-full text-sm text-muted hover:text-red-600 dark:hover:text-red-400 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
              >
                {pending ? "..." : "↩ Freigabe widerrufen"}
              </button>
            </div>
          )}

          {!istAusstehend && eintrag.freigegebenAm && (
            <p className="text-xs text-subtle text-right">
              {eintrag.freigabeStatus} am {datumFormatieren(eintrag.freigegebenAm)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function FreigabeTab({ eintraege: initialEintraege }: { eintraege: KalenderEintrag[] }) {
  const [eintraege, setEintraege] = useState(initialEintraege);
  const [filter, setFilter] = useState<"alle" | "Ausstehend" | "Freigegeben" | "Abgelehnt">("Ausstehend");

  const ausstehend = eintraege.filter(e => (e.freigabeStatus || "Ausstehend") === "Ausstehend").length;

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
    filter === "alle" ? true : (e.freigabeStatus || "Ausstehend") === filter
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-semibold text-lg text-fg">Content-Freigabe</h2>
          {ausstehend > 0 && (
            <p className="text-sm text-accent mt-0.5">
              {ausstehend} {ausstehend === 1 ? "Eintrag wartet" : "Einträge warten"} auf Ihre Freigabe
            </p>
          )}
          {ausstehend === 0 && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-0.5">Alles erledigt – kein ausstehender Content</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Ausstehend",  anzeige: "Offen",       farbe: "blue"  },
          { label: "Freigegeben", anzeige: "Freigegeben", farbe: "green" },
          { label: "Abgelehnt",   anzeige: "Abgelehnt",   farbe: "red"   },
        ].map(({ label, anzeige, farbe }) => {
          const anzahl = eintraege.filter(e => (e.freigabeStatus || "Ausstehend") === label).length;
          const farbeKlasse = {
            blue:  "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700/50 text-blue-700 dark:text-blue-300",
            green: "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700/50 text-green-700 dark:text-green-300",
            red:   "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700/50 text-red-700 dark:text-red-300",
          }[farbe];
          return (
            <button
              key={label}
              onClick={() => setFilter(label as typeof filter)}
              className={`rounded-2xl border p-3 text-left transition-all shadow-sm ${farbeKlasse} ${
                filter === label ? "ring-2 ring-accent/30" : "opacity-70 hover:opacity-100"
              }`}
            >
              <p className="text-2xl font-bold">{anzahl}</p>
              <p className="text-xs mt-0.5">{anzeige}</p>
            </button>
          );
        })}
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {(["alle", "Ausstehend", "Freigegeben", "Abgelehnt"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              filter === f ? "bg-accent text-white" : "bg-elevated text-muted hover:text-fg"
            }`}
          >
            {f === "alle" ? "Alle" : f === "Ausstehend" ? "Offen" : f}
          </button>
        ))}
      </div>

      <div className="space-y-3 card-group">
        {gefiltert.map(eintrag => (
          <FreigabeKarte key={eintrag.id} eintrag={eintrag} onStatusChange={handleStatusChange} />
        ))}
        {gefiltert.length === 0 && (
          <div className="text-center py-12 text-subtle">
            Keine Einträge in dieser Kategorie.
          </div>
        )}
      </div>
    </div>
  );
}
