"use client";

import { useState } from "react";
import ContentIdeenModal from "./ContentIdeenModal";

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
  captionText: string | null;
  dateizugriff: string | null;
  gewuenschtesPostingDatum: Date | null;
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

export default function AdminContentIdeenTab({
  ideen,
  kundenprofilId,
}: {
  ideen: ContentIdea[];
  kundenprofilId: string;
}) {
  const [statusFilter, setStatusFilter] = useState("alle");
  const [vonFilter, setVonFilter] = useState("alle");
  const [modalOffen, setModalOffen] = useState(false);
  const [ausgewaehlt, setAusgewaehlt] = useState<ContentIdea | null>(null);

  const gefiltert = ideen.filter((i) => {
    const statusOk = statusFilter === "alle" || i.status === statusFilter;
    const vonOk = vonFilter === "alle" || i.eingereichtVon === vonFilter;
    return statusOk && vonOk;
  });

  const vonKunde = ideen.filter((i) => i.eingereichtVon === "Kunde").length;

  return (
    <div>
      {vonKunde > 0 && (
        <div className="flex items-center gap-2 mb-4 bg-blue-950/40 border border-blue-700/40 rounded-xl px-3 py-2 text-sm">
          <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
          <span className="text-blue-300">{vonKunde} neue {vonKunde === 1 ? "Idee" : "Ideen"} vom Kunden eingereicht</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="flex gap-1">
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
        </div>
        <div className="flex gap-1">
          {["alle", "Agentur", "Kunde"].map((v) => (
            <button
              key={v}
              onClick={() => setVonFilter(v)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                vonFilter === v ? "bg-violet-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              {v === "alle" ? "Alle" : `von ${v}`}
            </button>
          ))}
        </div>
        <button
          onClick={() => { setAusgewaehlt(null); setModalOffen(true); }}
          className="ml-auto bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-1.5 rounded-lg transition-colors"
        >
          + Idee
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {gefiltert.map((idee) => (
          <button
            key={idee.id}
            onClick={() => { setAusgewaehlt(idee); setModalOffen(true); }}
            className="bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl p-4 text-left transition-all hover:bg-gray-800/50"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-medium text-sm line-clamp-2 flex-1">
                {idee.titel ?? "Ohne Titel"}
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
            <div className="flex flex-wrap gap-1.5">
              {idee.plattform.map((p) => (
                <span key={p} className={`text-xs px-1.5 py-0.5 rounded-md ${PLATTFORM_FARBEN[p] ?? "bg-gray-700 text-gray-300"}`}>
                  {p}
                </span>
              ))}
              {idee.contentTyp && (
                <span className="text-xs px-1.5 py-0.5 rounded-md bg-gray-700 text-gray-300">
                  {idee.contentTyp}
                </span>
              )}
              {idee.prioritaet && (
                <span className={`text-xs px-1.5 py-0.5 rounded-md ${PRIORITAET_FARBEN[idee.prioritaet] ?? ""}`}>
                  {idee.prioritaet}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between mt-2">
              {idee.eingereichtVon && (
                <p className="text-xs text-gray-500">von {idee.eingereichtVon}</p>
              )}
              {idee.gewuenschtesPostingDatum && (
                <p className="text-xs text-gray-500">
                  {new Date(idee.gewuenschtesPostingDatum).toLocaleDateString("de-DE")}
                </p>
              )}
            </div>
          </button>
        ))}

        {gefiltert.length === 0 && (
          <div className="col-span-3 text-center py-12 text-gray-500">Keine Ideen vorhanden.</div>
        )}
      </div>

      {modalOffen && (
        <ContentIdeenModal
          kundenprofilId={kundenprofilId}
          idee={ausgewaehlt ?? undefined}
          onClose={() => { setModalOffen(false); setAusgewaehlt(null); }}
        />
      )}
    </div>
  );
}
