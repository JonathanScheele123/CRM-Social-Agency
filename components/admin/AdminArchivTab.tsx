"use client";

import { useState } from "react";
import ArchivEintragModal from "./ArchivEintragModal";

type ArchivEintrag = {
  id: string;
  titel: string | null;
  beschreibung: string | null;
  plattform: string[];
  contentTyp: string | null;
  prioritaet: string | null;
  gepostetAm: Date | null;
  captionText: string | null;
  dateizugriff: string | null;
  notizen: string | null;
};

const PLATTFORM_FARBEN: Record<string, string> = {
  Instagram: "bg-pink-500/20 text-pink-300",
  Facebook:  "bg-blue-500/20 text-blue-300",
  TikTok:    "bg-gray-500/20 text-gray-300",
  YouTube:   "bg-red-500/20 text-red-300",
  Sonstiges: "bg-gray-600/20 text-gray-400",
};

export default function AdminArchivTab({
  eintraege,
  kundenprofilId,
}: {
  eintraege: ArchivEintrag[];
  kundenprofilId: string;
}) {
  const [modalOffen, setModalOffen] = useState(false);
  const [ausgewaehlt, setAusgewaehlt] = useState<ArchivEintrag | null>(null);
  const [suche, setSuche] = useState("");

  const gefiltert = eintraege.filter((e) => {
    if (!suche) return true;
    const q = suche.toLowerCase();
    return (
      e.titel?.toLowerCase().includes(q) ||
      e.beschreibung?.toLowerCase().includes(q) ||
      e.plattform.some((p) => p.toLowerCase().includes(q))
    );
  });

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-5">
        <input
          type="text"
          value={suche}
          onChange={(e) => setSuche(e.target.value)}
          placeholder="Suchen..."
          className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2 text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
        <span className="text-gray-500 text-sm shrink-0">{gefiltert.length} Einträge</span>
        <button
          onClick={() => { setAusgewaehlt(null); setModalOffen(true); }}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg transition-colors shrink-0"
        >
          + Eintrag
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {gefiltert.map((eintrag) => (
          <button
            key={eintrag.id}
            onClick={() => { setAusgewaehlt(eintrag); setModalOffen(true); }}
            className="bg-gray-900 border border-gray-800 hover:border-green-600/50 rounded-xl p-4 text-left transition-all hover:bg-gray-800/50 border-l-4 border-l-green-600"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-medium text-sm line-clamp-2 flex-1">
                {eintrag.titel ?? "Ohne Titel"}
              </h3>
            </div>
            {eintrag.beschreibung && (
              <p className="text-gray-400 text-xs line-clamp-2 mb-3">{eintrag.beschreibung}</p>
            )}
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5 flex-wrap">
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
              </div>
              {eintrag.gepostetAm && (
                <p className="text-gray-500 text-xs shrink-0 ml-2">
                  {new Date(eintrag.gepostetAm).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" })}
                </p>
              )}
            </div>
          </button>
        ))}

        {gefiltert.length === 0 && (
          <div className="col-span-3 text-center py-12 text-gray-500">
            {suche ? "Keine Ergebnisse für diese Suche." : "Noch keine archivierten Beiträge."}
          </div>
        )}
      </div>

      {modalOffen && (
        <ArchivEintragModal
          kundenprofilId={kundenprofilId}
          eintrag={ausgewaehlt ?? undefined}
          onClose={() => { setModalOffen(false); setAusgewaehlt(null); }}
        />
      )}
    </div>
  );
}
