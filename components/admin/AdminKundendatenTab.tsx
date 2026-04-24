"use client";

import { useState } from "react";
import KundendatenModal from "./KundendatenModal";
import KundenprofilSektionen, { KundenprofilFelder } from "@/components/shared/KundenprofilSektionen";
import { useT, useLang } from "@/lib/i18n";

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
  Zielgruppe:                 "bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-300",
  "Allgemeine Informationen": "bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-300",
  Drehtag:                    "bg-gray-100 dark:bg-gray-700/40 text-gray-600 dark:text-gray-300",
  Produkte:                   "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300",
  "Auftreten des Betriebes":  "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300",
  "Wünsche des Kunden":       "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300",
  "Events/Termine":           "bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300",
  Zusatzinformationen:        "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300",
};

export default function AdminKundendatenTab({
  daten,
  kundenprofilId,
  profil,
}: {
  daten: Kundendaten[];
  kundenprofilId: string;
  profil?: KundenprofilFelder;
}) {
  const t = useT();
  const { lang } = useLang();
  const [ansicht, setAnsicht] = useState<"profil" | "notizen">("profil");
  const [tagFilter, setTagFilter] = useState("alle");
  const [veraltetZeigen, setVeraltetZeigen] = useState(false);
  const [modalOffen, setModalOffen] = useState(false);
  const [ausgewaehlt, setAusgewaehlt] = useState<Kundendaten | null>(null);

  function handleDownload() {
    const exportData = {
      kundenprofil: profil ?? null,
      notizen: daten.map((d) => ({
        beschreibung: d.beschreibung,
        inhalt: d.inhalt,
        tags: d.tags,
        datum: d.datum ? new Date(d.datum).toISOString().slice(0, 10) : null,
        veraltet: d.veraltet,
        hinzugefuegtVon: d.hinzugefuegtVon,
      })),
      exportiertAm: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kundendaten-${kundenprofilId}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const alleTags = Array.from(new Set(daten.flatMap((d) => d.tags)));

  const gefiltert = daten.filter((d) => {
    if (!veraltetZeigen && d.veraltet) return false;
    if (tagFilter === "alle") return true;
    return d.tags.includes(tagFilter);
  });

  return (
    <div>
      {/* View toggle */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-1 bg-elevated border border-divider rounded-xl p-1 btn-group">
          <button
            onClick={() => setAnsicht("profil")}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${ansicht === "profil" ? "bg-card text-fg shadow-sm" : "text-muted hover:text-fg"}`}
          >
            {t.kundendatenTab.kundenprofil}
          </button>
          <button
            onClick={() => setAnsicht("notizen")}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${ansicht === "notizen" ? "bg-card text-fg shadow-sm" : "text-muted hover:text-fg"}`}
          >
            {t.kundendatenTab.notizen}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 bg-elevated border border-divider hover:bg-card text-muted hover:text-fg text-sm px-3 py-1.5 rounded-lg transition-colors"
            title="Alle Kundendaten als JSON herunterladen"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
            </svg>
            Download
          </button>
          {ansicht === "notizen" && (
            <button
              onClick={() => { setAusgewaehlt(null); setModalOffen(true); }}
              className="bg-accent hover:bg-accent-hover text-white text-sm px-4 py-1.5 rounded-lg transition-colors"
            >
              {t.kundendatenTab.eintragHinzufuegenBtn}
            </button>
          )}
        </div>
      </div>

      {ansicht === "profil" && profil && <KundenprofilSektionen profil={profil} />}
      {ansicht === "profil" && !profil && <p className="text-subtle text-sm">{t.kundendatenTab.keineProfilDaten}</p>}

      {ansicht === "notizen" && (
      <>
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => setTagFilter("alle")}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              tagFilter === "alle" ? "bg-accent text-white" : "bg-elevated text-muted hover:text-fg"
            }`}
          >
            {t.common.alle}
          </button>
          {alleTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setTagFilter(tag)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                tagFilter === tag ? "bg-accent text-white" : "bg-elevated text-muted hover:text-fg"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="ml-auto">
          <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
            <input
              type="checkbox"
              checked={veraltetZeigen}
              onChange={(e) => setVeraltetZeigen(e.target.checked)}
              className="accent-accent"
            />
            {t.kundendatenTab.veralteteAnzeigen}
          </label>
        </div>
      </div>

      <div className="space-y-2">
        {gefiltert.map((datensatz) => (
          <button
            key={datensatz.id}
            onClick={() => { setAusgewaehlt(datensatz); setModalOffen(true); }}
            className={`w-full text-left bg-card border border-divider hover:border-muted/40 rounded-2xl p-4 transition-all hover:shadow-sm ${
              datensatz.veraltet ? "opacity-50" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm text-fg">{datensatz.beschreibung ?? "–"}</p>
                  {datensatz.veraltet && (
                    <span className="text-xs bg-elevated text-muted px-1.5 py-0.5 rounded-lg shrink-0">{t.kundendatenTab.veraltet}</span>
                  )}
                </div>
                {datensatz.inhalt && (
                  <p className="text-muted text-xs mt-1 line-clamp-2">{datensatz.inhalt}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                {datensatz.datum && (
                  <p className="text-subtle text-xs">
                    {new Date(datensatz.datum).toLocaleDateString(lang === "de" ? "de-DE" : "en-GB")}
                  </p>
                )}
                <div className="flex gap-1 flex-wrap justify-end">
                  {datensatz.tags.map((tag) => (
                    <span key={tag} className={`text-xs px-1.5 py-0.5 rounded-md ${TAG_FARBEN[tag] ?? "bg-elevated text-muted"}`}>
                      {tag}
                    </span>
                  ))}
                </div>
                {datensatz.hinzugefuegtVon && (
                  <p className="text-xs text-subtle">{t.contentIdeen.eingereichtVon} {datensatz.hinzugefuegtVon}</p>
                )}
              </div>
            </div>
          </button>
        ))}

        {gefiltert.length === 0 && (
          <div className="text-center py-12 text-subtle">{t.kundendatenTab.keineEintraegeAdmin}</div>
        )}
      </div>
      </>
      )}

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
