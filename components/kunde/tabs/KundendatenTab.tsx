"use client";

import { useState } from "react";

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

export default function KundendatenTab({ daten }: { daten: Kundendaten[] }) {
  const [tagFilter, setTagFilter] = useState<string>("alle");
  const [ausgewaehlt, setAusgewaehlt] = useState<Kundendaten | null>(null);

  const alleTags = Array.from(new Set(daten.flatMap((d) => d.tags)));

  const gefiltert = daten.filter((d) => {
    if (d.veraltet) return false;
    if (tagFilter === "alle") return true;
    return d.tags.includes(tagFilter);
  });

  return (
    <div>
      {/* Tag-Filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
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

      <div className="space-y-2">
        {gefiltert.map((datensatz) => (
          <button
            key={datensatz.id}
            onClick={() => setAusgewaehlt(datensatz)}
            className="w-full text-left bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl p-4 transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{datensatz.beschreibung ?? "–"}</p>
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
              </div>
            </div>
          </button>
        ))}

        {gefiltert.length === 0 && (
          <div className="text-center py-12 text-gray-500">Keine Daten vorhanden.</div>
        )}
      </div>

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
              <h3 className="font-semibold">{ausgewaehlt.beschreibung ?? "–"}</h3>
              <button onClick={() => setAusgewaehlt(null)} className="text-gray-400 hover:text-white ml-3">✕</button>
            </div>
            {ausgewaehlt.inhalt && (
              <p className="text-gray-200 text-sm whitespace-pre-wrap">{ausgewaehlt.inhalt}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
