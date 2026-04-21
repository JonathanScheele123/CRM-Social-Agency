"use client";

import { useState } from "react";
import ArchivEintragModal from "./ArchivEintragModal";
import { useT, useLang } from "@/lib/i18n";

type Kommentar = {
  id: string;
  text: string;
  autorTyp: string;
  autorName: string | null;
  createdAt: Date;
};

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
  kommentare: Kommentar[];
};

const PLATTFORM_FARBEN: Record<string, string> = {
  Instagram: "bg-pink-100 dark:bg-pink-500/20 text-pink-700 dark:text-pink-300",
  Facebook:  "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300",
  TikTok:    "bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-300",
  YouTube:   "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300",
  Sonstiges: "bg-gray-100 dark:bg-gray-600/20 text-gray-500 dark:text-gray-400",
};

export default function AdminArchivTab({
  eintraege,
  kundenprofilId,
}: {
  eintraege: ArchivEintrag[];
  kundenprofilId: string;
}) {
  const t = useT();
  const { lang } = useLang();
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
      <div className="flex items-center gap-3 mb-5">
        <input
          type="text"
          value={suche}
          onChange={(e) => setSuche(e.target.value)}
          placeholder={t.common.suchenPlaceholder}
          className="flex-1 bg-elevated border border-divider text-fg rounded-xl px-4 py-2 text-sm placeholder:text-subtle focus:outline-none focus:border-accent transition-colors"
        />
        <span className="text-subtle text-sm shrink-0">{gefiltert.length} {t.adminDashboard.eintraege}</span>
        <button
          onClick={() => { setAusgewaehlt(null); setModalOffen(true); }}
          className="bg-accent hover:bg-accent-hover text-white text-sm px-4 py-2 rounded-lg transition-colors shrink-0"
        >
          {t.adminKalender.eintrag}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {gefiltert.map((eintrag) => (
          <button
            key={eintrag.id}
            onClick={() => { setAusgewaehlt(eintrag); setModalOffen(true); }}
            className="bg-card border border-divider hover:border-muted/40 rounded-2xl p-4 text-left transition-all hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-medium text-sm line-clamp-2 flex-1 text-fg">
                {eintrag.titel ?? t.common.ohneTitle}
              </h3>
            </div>
            {eintrag.beschreibung && (
              <p className="text-muted text-xs line-clamp-2 mb-3">{eintrag.beschreibung}</p>
            )}
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5 flex-wrap">
                {eintrag.plattform.map((p) => (
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
              {eintrag.gepostetAm && (
                <p className="text-subtle text-xs shrink-0 ml-2">
                  {new Date(eintrag.gepostetAm).toLocaleDateString(lang === "de" ? "de-DE" : "en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" })}
                </p>
              )}
            </div>
          </button>
        ))}

        {gefiltert.length === 0 && (
          <div className="col-span-3 text-center py-12 text-subtle">
            {suche ? t.common.keineEintraege : t.archivTab.keineEintraege}
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
