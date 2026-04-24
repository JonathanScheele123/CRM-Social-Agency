"use client";

import { useState } from "react";
import ModalPortal from "@/components/ModalPortal";
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
  gepostetAm: Date | null;
  captionText: string | null;
  dateizugriff: string | null;
  kommentare: Kommentar[];
};

const PLATTFORM_FARBEN: Record<string, string> = {
  Instagram: "bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-300",
  Facebook:  "bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-300",
  TikTok:    "bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-300",
  YouTube:   "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300",
  Sonstiges: "bg-gray-100 dark:bg-gray-600/20 text-gray-500 dark:text-gray-400",
};

export default function ArchivTab({ eintraege }: { eintraege: ArchivEintrag[] }) {
  const t = useT();
  const { lang } = useLang();
  const [ausgewaehlt, setAusgewaehlt] = useState<ArchivEintrag | null>(null);
  const [kommentare, setKommentare] = useState<Kommentar[]>([]);
  const [neuerText, setNeuerText] = useState("");
  const [sendet, setSendet] = useState(false);

  function oeffnen(eintrag: ArchivEintrag) {
    setAusgewaehlt(eintrag);
    setKommentare(eintrag.kommentare);
    setNeuerText("");
  }

  async function kommentarSenden() {
    if (!ausgewaehlt || !neuerText.trim()) return;
    setSendet(true);
    const res = await fetch(`/api/archiv/${ausgewaehlt.id}/kommentare`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: neuerText.trim() }),
    });
    setSendet(false);
    if (res.ok) {
      const k = await res.json();
      setKommentare((prev) => [...prev, k]);
      setNeuerText("");
    }
  }

  return (
    <div>
      <p className="text-muted text-sm mb-5">{eintraege.length} {t.archivTab.veroeffentlicht}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {eintraege.map((eintrag) => (
          <button
            key={eintrag.id}
            onClick={() => oeffnen(eintrag)}
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

        {eintraege.length === 0 && (
          <div className="col-span-3 text-center py-12 text-subtle">{t.archivTab.keineEintraege}</div>
        )}
      </div>

      {/* Detail-Modal */}
      {ausgewaehlt && (
        <ModalPortal>
        <div
          className="fixed inset-0 glass-overlay z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setAusgewaehlt(null)}
        >
          <div
            className="glass-modal rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto "
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-divider flex items-start justify-between">
              <h3 className="font-semibold text-fg">{ausgewaehlt.titel ?? t.common.ohneTitle}</h3>
              <button onClick={() => setAusgewaehlt(null)} className="text-muted hover:text-fg ml-3 transition-colors">✕</button>
            </div>

            <div className="p-5 space-y-3 text-sm">
              {ausgewaehlt.beschreibung && (
                <div>
                  <p className="text-subtle text-xs mb-1">{t.archivTab.beschreibung}</p>
                  <p className="text-fg">{ausgewaehlt.beschreibung}</p>
                </div>
              )}
              {ausgewaehlt.captionText && (
                <div>
                  <p className="text-subtle text-xs mb-1">{t.archivTab.caption}</p>
                  <p className="text-fg whitespace-pre-wrap">{ausgewaehlt.captionText}</p>
                </div>
              )}
              {ausgewaehlt.gepostetAm && (
                <div>
                  <p className="text-subtle text-xs mb-1">{t.archivTab.gepostetAm}</p>
                  <p className="text-fg">{new Date(ausgewaehlt.gepostetAm).toLocaleDateString(lang === "de" ? "de-DE" : "en-GB")}</p>
                </div>
              )}
              {ausgewaehlt.dateizugriff && (
                <div>
                  <p className="text-subtle text-xs mb-1">{t.archivTab.dateizugriff}</p>
                  <a href={ausgewaehlt.dateizugriff} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline break-all">
                    {t.archivTab.dateiOeffnen}
                  </a>
                </div>
              )}
            </div>

            {/* Kommentare */}
            <div className="border-t border-divider px-5 py-4">
              <p className="text-xs font-medium text-muted mb-3">{t.archivTab.kommentare} ({kommentare.length})</p>

              <div className="space-y-3 mb-4">
                {kommentare.length === 0 && (
                  <p className="text-subtle text-xs">{t.archivTab.keineKommentare}</p>
                )}
                {kommentare.map((k) => (
                  <div key={k.id} className="flex gap-2.5">
                    <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 text-xs font-medium ${k.autorTyp === "Agentur" ? "bg-accent" : "bg-muted/50"}`}>
                      {k.autorTyp === "Agentur" ? "A" : "K"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-0.5">
                        <span className="text-xs font-medium text-fg">{k.autorName ?? k.autorTyp}</span>
                        <span className="text-xs text-subtle">
                          {new Date(k.createdAt).toLocaleDateString(lang === "de" ? "de-DE" : "en-GB", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-sm text-fg">{k.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <textarea
                  value={neuerText}
                  onChange={(e) => setNeuerText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); kommentarSenden(); } }}
                  placeholder={t.archivTab.kommentarSchreiben}
                  rows={2}
                  className="flex-1 bg-elevated border border-divider text-fg rounded-xl px-3 py-2 text-sm placeholder:text-subtle focus:outline-none focus:border-accent transition-colors resize-none"
                />
                <button
                  onClick={kommentarSenden}
                  disabled={sendet || !neuerText.trim()}
                  className="self-end px-4 py-2 rounded-xl text-sm bg-accent hover:bg-accent-hover disabled:opacity-40 text-white font-medium transition-colors"
                >
                  {sendet ? "..." : t.archivTab.senden}
                </button>
              </div>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}
    </div>
  );
}
