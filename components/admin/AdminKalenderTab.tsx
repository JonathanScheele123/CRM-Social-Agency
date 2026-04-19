"use client";

import { useState } from "react";
import KalenderEintragModal from "./KalenderEintragModal";
import KalenderGrafik, { KalenderGrafikEintrag } from "@/components/shared/KalenderGrafik";

type KalenderEintrag = {
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
  gepostet: boolean;
  freigabeStatus: string;
  freigabeKommentar: string | null;
  freigegebenAm: Date | null;
};

const FREIGABE_CONFIG: Record<string, { badge: string; row: string; dot: string }> = {
  Ausstehend:    { badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",       row: "border-l-blue-500",   dot: "bg-blue-500" },
  Freigegeben:   { badge: "bg-green-500/20 text-green-300 border-green-500/30",    row: "border-l-green-500",  dot: "bg-green-500" },
  Abgelehnt:     { badge: "bg-red-500/20 text-red-300 border-red-500/30",          row: "border-l-red-500",    dot: "bg-red-500" },
  Überarbeitung: { badge: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", row: "border-l-yellow-500", dot: "bg-yellow-500" },
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
  return new Date(d).toLocaleDateString("de-DE", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function AdminKalenderTab({
  eintraege,
  kundenprofilId,
}: {
  eintraege: KalenderEintrag[];
  kundenprofilId: string;
}) {
  const [filter, setFilter] = useState<"alle" | "Ausstehend" | "Freigegeben" | "Überarbeitung" | "Abgelehnt">("alle");
  const [ansicht, setAnsicht] = useState<"liste" | "kalender">("liste");
  const [modalOffen, setModalOffen] = useState(false);
  const [ausgewaehlt, setAusgewaehlt] = useState<KalenderEintrag | null>(null);

  const gefiltert = eintraege.filter((e) =>
    filter === "alle" ? true : e.freigabeStatus === filter
  );

  const ausstehend = eintraege.filter((e) => e.freigabeStatus === "Ausstehend").length;
  const ueberarbeitung = eintraege.filter((e) => e.freigabeStatus === "Überarbeitung").length;

  const grafikEintraege: KalenderGrafikEintrag[] = eintraege.map((e) => ({
    id: e.id,
    titel: e.titel,
    geplantAm: e.geplantAm,
    dotFarbe: e.gepostet
      ? "bg-green-400"
      : (FREIGABE_CONFIG[e.freigabeStatus] ?? FREIGABE_CONFIG.Ausstehend).dot,
  }));

  function eintragById(id: string) {
    return eintraege.find((e) => e.id === id) ?? null;
  }

  return (
    <div>
      {/* Statusübersicht */}
      {(ausstehend > 0 || ueberarbeitung > 0) && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {ausstehend > 0 && (
            <div className="flex items-center gap-2 bg-blue-950/40 border border-blue-700/40 rounded-xl px-3 py-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
              <span className="text-blue-300">{ausstehend} warten auf Freigabe</span>
            </div>
          )}
          {ueberarbeitung > 0 && (
            <div className="flex items-center gap-2 bg-yellow-950/40 border border-yellow-700/40 rounded-xl px-3 py-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-yellow-500 shrink-0" />
              <span className="text-yellow-300">{ueberarbeitung} Überarbeitungen nötig</span>
            </div>
          )}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="flex gap-1 flex-wrap">
          {(["alle", "Ausstehend", "Freigegeben", "Überarbeitung", "Abgelehnt"] as const).map((f) => (
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
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Ansicht-Toggle */}
          <div className="flex bg-gray-800 rounded-lg p-0.5 gap-0.5">
            <button
              onClick={() => setAnsicht("liste")}
              className={`px-3 py-1 rounded-md text-xs transition-colors ${
                ansicht === "liste" ? "bg-gray-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              Liste
            </button>
            <button
              onClick={() => setAnsicht("kalender")}
              className={`px-3 py-1 rounded-md text-xs transition-colors ${
                ansicht === "kalender" ? "bg-gray-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              Kalender
            </button>
          </div>

          <button
            onClick={() => { setAusgewaehlt(null); setModalOffen(true); }}
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-1.5 rounded-lg transition-colors"
          >
            + Eintrag
          </button>
        </div>
      </div>

      {/* Kalender-Ansicht */}
      {ansicht === "kalender" && (
        <>
          <div className="flex flex-wrap gap-3 mb-4">
            {(["Ausstehend", "Freigegeben", "Überarbeitung", "Abgelehnt"] as const).map((s) => (
              <div key={s} className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className={`w-2 h-2 rounded-full ${FREIGABE_CONFIG[s].dot}`} />
                {s}
              </div>
            ))}
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              Gepostet
            </div>
          </div>
          <KalenderGrafik
            eintraege={grafikEintraege}
            onEintragKlick={(id) => {
              const e = eintragById(id);
              if (e) { setAusgewaehlt(e); setModalOffen(true); }
            }}
          />
        </>
      )}

      {/* Listen-Ansicht */}
      {ansicht === "liste" && (
        <div className="space-y-2">
          {gefiltert.map((eintrag) => {
            const cfg = FREIGABE_CONFIG[eintrag.freigabeStatus] ?? FREIGABE_CONFIG.Ausstehend;
            return (
              <button
                key={eintrag.id}
                onClick={() => { setAusgewaehlt(eintrag); setModalOffen(true); }}
                className={`w-full text-left bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl p-4 border-l-4 ${cfg.row} transition-all`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm truncate">{eintrag.titel ?? "Ohne Titel"}</p>
                      {eintrag.gepostet && (
                        <span className="text-xs bg-green-500/20 text-green-300 px-1.5 py-0.5 rounded-md shrink-0">Gepostet</span>
                      )}
                    </div>
                    {eintrag.beschreibung && (
                      <p className="text-gray-400 text-xs line-clamp-1">{eintrag.beschreibung}</p>
                    )}
                    {eintrag.freigabeKommentar && (
                      <p className="text-yellow-300/70 text-xs mt-1 line-clamp-1">
                        ↩ &quot;{eintrag.freigabeKommentar}&quot;
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <p className="text-gray-400 text-xs">{datumFormatieren(eintrag.geplantAm)}</p>
                    <div className="flex gap-1 flex-wrap justify-end">
                      <span className={`text-xs px-1.5 py-0.5 rounded-md border ${cfg.badge}`}>
                        {eintrag.freigabeStatus}
                      </span>
                      {eintrag.plattform.map((p) => (
                        <span key={p} className={`text-xs px-1.5 py-0.5 rounded-md ${PLATTFORM_FARBEN[p] ?? "bg-gray-700 text-gray-300"}`}>
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}

          {gefiltert.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              {filter === "alle" ? "Noch keine Einträge vorhanden." : `Keine Einträge mit Status „${filter}".`}
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {modalOffen && (
        <KalenderEintragModal
          kundenprofilId={kundenprofilId}
          eintrag={ausgewaehlt ?? undefined}
          onClose={() => { setModalOffen(false); setAusgewaehlt(null); }}
        />
      )}
    </div>
  );
}
