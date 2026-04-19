"use client";

import { useState } from "react";

type ArchivEintrag = {
  id: string;
  titel: string | null;
  beschreibung: string | null;
  plattform: string[];
  contentTyp: string | null;
  gepostetAm: Date | null;
  captionText: string | null;
  dateizugriff: string | null;
};

const PLATTFORM_FARBEN: Record<string, string> = {
  Instagram: "bg-pink-500/20 text-pink-300",
  Facebook: "bg-blue-500/20 text-blue-300",
  TikTok: "bg-gray-500/20 text-gray-300",
  YouTube: "bg-red-500/20 text-red-300",
  Sonstiges: "bg-gray-600/20 text-gray-400",
};

export default function ArchivTab({ eintraege }: { eintraege: ArchivEintrag[] }) {
  const [ausgewaehlt, setAusgewaehlt] = useState<ArchivEintrag | null>(null);

  return (
    <div>
      <p className="text-gray-400 text-sm mb-5">{eintraege.length} veröffentlichte Beiträge</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {eintraege.map((eintrag) => (
          <button
            key={eintrag.id}
            onClick={() => setAusgewaehlt(eintrag)}
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

        {eintraege.length === 0 && (
          <div className="col-span-3 text-center py-12 text-gray-500">Noch keine archivierten Beiträge.</div>
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
              <h3 className="font-semibold">{ausgewaehlt.titel ?? "Ohne Titel"}</h3>
              <button onClick={() => setAusgewaehlt(null)} className="text-gray-400 hover:text-white ml-3">✕</button>
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
                  <p className="text-gray-400 text-xs mb-1">Caption</p>
                  <p className="text-gray-200 whitespace-pre-wrap">{ausgewaehlt.captionText}</p>
                </div>
              )}
              {ausgewaehlt.gepostetAm && (
                <div>
                  <p className="text-gray-400 text-xs mb-1">Gepostet am</p>
                  <p>{new Date(ausgewaehlt.gepostetAm).toLocaleDateString("de-DE")}</p>
                </div>
              )}
              {ausgewaehlt.dateizugriff && (
                <div>
                  <p className="text-gray-400 text-xs mb-1">Dateizugriff</p>
                  <a href={ausgewaehlt.dateizugriff} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all">
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
