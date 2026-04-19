"use client";

import { useState } from "react";
import KalenderGrafik, { KalenderGrafikEintrag } from "@/components/shared/KalenderGrafik";

type KalenderEintrag = {
  id: string;
  titel: string | null;
  beschreibung: string | null;
  plattform: string[];
  contentTyp: string | null;
  geplantAm: Date | null;
  gepostet: boolean;
  captionText: string | null;
  dateizugriff: string | null;
  prioritaet: string | null;
  notizen: string | null;
};

const PLATTFORM_FARBEN: Record<string, string> = {
  Instagram: "bg-pink-500/20 text-pink-300",
  Facebook: "bg-blue-500/20 text-blue-300",
  TikTok: "bg-gray-500/20 text-gray-300",
  YouTube: "bg-red-500/20 text-red-300",
  Sonstiges: "bg-gray-600/20 text-gray-400",
};

const PRIORITAET_FARBEN: Record<string, string> = {
  Hoch: "bg-red-500/20 text-red-300 border-red-500/30",
  Mittel: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  Niedrig: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

function eintragFarbe(eintrag: KalenderEintrag): string {
  if (eintrag.gepostet) return "border-l-4 border-l-green-500 bg-green-950/20";
  const heute = new Date();
  heute.setHours(0, 0, 0, 0);
  if (eintrag.geplantAm) {
    const datum = new Date(eintrag.geplantAm);
    datum.setHours(0, 0, 0, 0);
    if (datum.getTime() === heute.getTime()) return "border-l-4 border-l-blue-500 bg-blue-950/20";
    if (datum < heute) return "border-l-4 border-l-orange-500 bg-orange-950/10 opacity-75";
  }
  return "border-l-4 border-l-gray-700";
}

function dotFarbe(eintrag: KalenderEintrag): string {
  if (eintrag.gepostet) return "bg-green-500";
  const heute = new Date();
  heute.setHours(0, 0, 0, 0);
  if (eintrag.geplantAm) {
    const datum = new Date(eintrag.geplantAm);
    datum.setHours(0, 0, 0, 0);
    if (datum.getTime() === heute.getTime()) return "bg-blue-500";
    if (datum < heute) return "bg-orange-500";
  }
  return "bg-gray-500";
}

function datumFormatieren(datum: Date | null): string {
  if (!datum) return "–";
  return new Date(datum).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function KalenderTab({ eintraege }: { eintraege: KalenderEintrag[] }) {
  const [filter, setFilter] = useState<"alle" | "offen" | "gepostet">("alle");
  const [ansicht, setAnsicht] = useState<"liste" | "kalender">("liste");
  const [ausgewaehlt, setAusgewaehlt] = useState<KalenderEintrag | null>(null);

  const gefiltert = eintraege.filter((e) => {
    if (filter === "offen") return !e.gepostet;
    if (filter === "gepostet") return e.gepostet;
    return true;
  });

  const grafikEintraege: KalenderGrafikEintrag[] = eintraege.map((e) => ({
    id: e.id,
    titel: e.titel,
    geplantAm: e.geplantAm,
    dotFarbe: dotFarbe(e),
  }));

  function eintragById(id: string) {
    return eintraege.find((e) => e.id === id) ?? null;
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="flex gap-1">
          {(["alle", "offen", "gepostet"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                filter === f
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              {f === "alle" ? "Alle" : f === "offen" ? "Ausstehend" : "Gepostet"}
            </button>
          ))}
        </div>

        {/* Ansicht-Toggle */}
        <div className="ml-auto flex bg-gray-800 rounded-lg p-0.5 gap-0.5">
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
      </div>

      {/* Legende */}
      {ansicht === "liste" && (
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="w-3 h-3 rounded-sm bg-blue-500/40 border-l-2 border-blue-500" />
            Heute geplant
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="w-3 h-3 rounded-sm bg-green-500/20 border-l-2 border-green-500" />
            Gepostet
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="w-3 h-3 rounded-sm bg-orange-950/20 border-l-2 border-orange-500" />
            Überfällig
          </div>
        </div>
      )}

      {/* Kalender-Ansicht */}
      {ansicht === "kalender" && (
        <>
          <div className="flex flex-wrap gap-3 mb-4">
            {[
              { farbe: "bg-blue-500", label: "Heute geplant" },
              { farbe: "bg-green-500", label: "Gepostet" },
              { farbe: "bg-orange-500", label: "Überfällig" },
              { farbe: "bg-gray-500", label: "Geplant" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className={`w-2 h-2 rounded-full ${l.farbe}`} />
                {l.label}
              </div>
            ))}
          </div>
          <KalenderGrafik
            eintraege={grafikEintraege}
            onEintragKlick={(id) => setAusgewaehlt(eintragById(id))}
          />
        </>
      )}

      {/* Listen-Ansicht */}
      {ansicht === "liste" && (
        <div className="space-y-2">
          {gefiltert.map((eintrag) => (
            <button
              key={eintrag.id}
              onClick={() => setAusgewaehlt(eintrag)}
              className={`w-full text-left rounded-xl p-4 ${eintragFarbe(eintrag)} bg-gray-900 hover:bg-gray-800 transition-colors`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{eintrag.titel ?? "Ohne Titel"}</p>
                  {eintrag.beschreibung && (
                    <p className="text-gray-400 text-xs mt-1 line-clamp-2">{eintrag.beschreibung}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <p className="text-gray-400 text-xs">{datumFormatieren(eintrag.geplantAm)}</p>
                  <div className="flex gap-1 flex-wrap justify-end">
                    {eintrag.plattform.map((p) => (
                      <span key={p} className={`text-xs px-1.5 py-0.5 rounded-md ${PLATTFORM_FARBEN[p] ?? "bg-gray-700 text-gray-300"}`}>
                        {p}
                      </span>
                    ))}
                    {eintrag.contentTyp && (
                      <span className="text-xs px-1.5 py-0.5 rounded-md bg-gray-700 text-gray-300">
                        {eintrag.contentTyp}
                      </span>
                    )}
                    {eintrag.prioritaet && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-md border ${PRIORITAET_FARBEN[eintrag.prioritaet] ?? ""}`}>
                        {eintrag.prioritaet}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}

          {gefiltert.length === 0 && (
            <div className="text-center py-12 text-gray-500">Keine Einträge vorhanden.</div>
          )}
        </div>
      )}

      {/* Detail-Modal */}
      {ausgewaehlt && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setAusgewaehlt(null)}
        >
          <div
            className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-semibold text-lg">{ausgewaehlt.titel ?? "Ohne Titel"}</h3>
              <button onClick={() => setAusgewaehlt(null)} className="text-gray-400 hover:text-white ml-3">
                ✕
              </button>
            </div>
            <div className="space-y-3 text-sm">
              {ausgewaehlt.beschreibung && (
                <div>
                  <p className="text-gray-400 text-xs mb-1">Beschreibung</p>
                  <p className="text-gray-200">{ausgewaehlt.beschreibung}</p>
                </div>
              )}
              {ausgewaehlt.captionText && (
                <div>
                  <p className="text-gray-400 text-xs mb-1">Caption / Text</p>
                  <p className="text-gray-200 whitespace-pre-wrap">{ausgewaehlt.captionText}</p>
                </div>
              )}
              {ausgewaehlt.notizen && (
                <div>
                  <p className="text-gray-400 text-xs mb-1">Notizen</p>
                  <p className="text-gray-200">{ausgewaehlt.notizen}</p>
                </div>
              )}
              <div className="flex gap-4 pt-1">
                <div>
                  <p className="text-gray-400 text-xs mb-1">Geplant am</p>
                  <p>{datumFormatieren(ausgewaehlt.geplantAm)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Status</p>
                  <p className={ausgewaehlt.gepostet ? "text-green-400" : "text-yellow-400"}>
                    {ausgewaehlt.gepostet ? "Gepostet" : "Ausstehend"}
                  </p>
                </div>
              </div>
              {ausgewaehlt.dateizugriff && (
                <div>
                  <p className="text-gray-400 text-xs mb-1">Dateizugriff</p>
                  <a
                    href={ausgewaehlt.dateizugriff}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline break-all"
                  >
                    Datei öffnen
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
