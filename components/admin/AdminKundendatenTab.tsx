"use client";

import { useState } from "react";
import KundendatenModal from "./KundendatenModal";

type Kundendaten = {
  id: string;
  beschreibung: string | null;
  inhalt: string | null;
  tags: string[];
  datum: Date | null;
  veraltet: boolean;
  hinzugefuegtVon: string | null;
};

const TAG_FARBEN: Record<string, string> = {
  Zielgruppe: "bg-blue-500/20 text-blue-300",
  "Allgemeine Informationen": "bg-gray-500/20 text-gray-300",
  Drehtag: "bg-gray-700/40 text-gray-300",
  Produkte: "bg-yellow-500/20 text-yellow-300",
  "Auftreten des Betriebes": "bg-orange-500/20 text-orange-300",
  "Wünsche des Kunden": "bg-green-500/20 text-green-300",
  "Events/Termine": "bg-teal-500/20 text-teal-300",
  Zusatzinformationen: "bg-red-500/20 text-red-300",
};

export default function AdminKundendatenTab({
  daten,
  kundenprofilId,
}: {
  daten: Kundendaten[];
  kundenprofilId: string;
}) {
  const [tagFilter, setTagFilter] = useState("alle");
  const [veraltetZeigen, setVeraltetZeigen] = useState(false);
  const [modalOffen, setModalOffen] = useState(false);
  const [ausgewaehlt, setAusgewaehlt] = useState<Kundendaten | null>(null);

  const alleTags = Array.from(new Set(daten.flatMap((d) => d.tags)));

  const gefiltert = daten.filter((d) => {
    if (!veraltetZeigen && d.veraltet) return false;
    if (tagFilter === "alle") return true;
    return d.tags.includes(tagFilter);
  });

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => setTagFilter("alle")}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              tagFilter === "alle" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            Alle
          </button>
          {alleTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setTagFilter(tag)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                tagFilter === tag ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={veraltetZeigen}
              onChange={(e) => setVeraltetZeigen(e.target.checked)}
              className="accent-blue-600"
            />
            Veraltete anzeigen
          </label>
          <button
            onClick={() => { setAusgewaehlt(null); setModalOffen(true); }}
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-1.5 rounded-lg transition-colors"
          >
            + Eintrag
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {gefiltert.map((datensatz) => (
          <button
            key={datensatz.id}
            onClick={() => { setAusgewaehlt(datensatz); setModalOffen(true); }}
            className={`w-full text-left bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl p-4 transition-all ${
              datensatz.veraltet ? "opacity-50" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{datensatz.beschreibung ?? "–"}</p>
                  {datensatz.veraltet && (
                    <span className="text-xs bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded-md shrink-0">Veraltet</span>
                  )}
                </div>
                {datensatz.inhalt && (
                  <p className="text-gray-400 text-xs mt-1 line-clamp-2">{datensatz.inhalt}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                {datensatz.datum && (
                  <p className="text-gray-500 text-xs">
                    {new Date(datensatz.datum).toLocaleDateString("de-DE")}
                  </p>
                )}
                <div className="flex gap-1 flex-wrap justify-end">
                  {datensatz.tags.map((tag) => (
                    <span key={tag} className={`text-xs px-1.5 py-0.5 rounded-md ${TAG_FARBEN[tag] ?? "bg-gray-700 text-gray-300"}`}>
                      {tag}
                    </span>
                  ))}
                </div>
                {datensatz.hinzugefuegtVon && (
                  <p className="text-xs text-gray-500">von {datensatz.hinzugefuegtVon}</p>
                )}
              </div>
            </div>
          </button>
        ))}

        {gefiltert.length === 0 && (
          <div className="text-center py-12 text-gray-500">Keine Einträge vorhanden.</div>
        )}
      </div>

      {modalOffen && (
        <KundendatenModal
          kundenprofilId={kundenprofilId}
          eintrag={ausgewaehlt ?? undefined}
          onClose={() => { setModalOffen(false); setAusgewaehlt(null); }}
        />
      )}
    </div>
  );
}
