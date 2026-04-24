"use client";

import React, { useState, useMemo, useEffect } from "react";
import KalenderEintragModal from "./KalenderEintragModal";
import KalenderGrafik, { KalenderGrafikEintrag } from "@/components/shared/KalenderGrafik";
import { useT, useLang } from "@/lib/i18n";

const IconInstagram = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);
const IconFacebook = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);
const IconTikTok = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.67a8.18 8.18 0 004.78 1.52V6.73a4.85 4.85 0 01-1.01-.04z" />
  </svg>
);
const IconYouTube = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
  </svg>
);

type SocialLinks = { instagram?: string | null; facebook?: string | null; tiktok?: string | null; youtube?: string | null };

const SOCIAL_CONFIG: { key: keyof SocialLinks; label: string; cls: string; icon: React.ReactNode }[] = [
  { key: "instagram", label: "Instagram", cls: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white shadow-sm shadow-pink-500/30", icon: <IconInstagram /> },
  { key: "facebook",  label: "Facebook",  cls: "bg-[#1877F2] text-white shadow-sm shadow-blue-500/30",                                                   icon: <IconFacebook />  },
  { key: "tiktok",    label: "TikTok",    cls: "bg-black text-white shadow-sm shadow-black/20",                                                           icon: <IconTikTok />    },
  { key: "youtube",   label: "YouTube",   cls: "bg-[#FF0000] text-white shadow-sm shadow-red-500/30",                                                     icon: <IconYouTube />   },
];

function fileIdAusDriveLink(url: string | null): string | null {
  if (!url) return null;
  const m = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ?? url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return m ? m[1] : null;
}

function DriveVorschau({ dateizugriff, className }: { dateizugriff: string | null; className?: string }) {
  const [fehler, setFehler] = useState(false);
  const fileId = fileIdAusDriveLink(dateizugriff);
  if (!fileId || fehler) return null;
  return (
    <img
      src={`/api/admin/drive/thumbnail?fileId=${fileId}`}
      alt="Vorschau"
      onError={() => setFehler(true)}
      className={className ?? "mt-2 w-full max-w-[200px] h-auto rounded-lg object-cover border border-divider"}
    />
  );
}

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


function datumFarbe(eintrag: { geplantAm: Date | null }): string {
  const heute = tagBeginn(new Date());
  const morgen = heute + 86400000;
  if (!eintrag.geplantAm) return "border-l-divider";
  const d = tagBeginn(new Date(eintrag.geplantAm));
  if (d === heute) return "border-l-green-500";
  if (d === morgen) return "border-l-blue-500";
  return "border-l-divider";
}

const PLATTFORM_FARBEN: Record<string, string> = {
  Instagram: "bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-300",
  Facebook:  "bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-300",
  TikTok:    "bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-300",
  YouTube:   "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300",
  Sonstiges: "bg-gray-100 dark:bg-gray-600/20 text-gray-500 dark:text-gray-400",
};

function tagBeginn(d: Date) {
  const t = new Date(d);
  t.setHours(0, 0, 0, 0);
  return t.getTime();
}

function datumFormatieren(d: Date | null, locale: string) {
  if (!d) return "–";
  return new Date(d).toLocaleDateString(locale, {
    weekday: "short", day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function AdminKalenderTab({
  eintraege,
  kundenprofilId,
  onNavigiereZuIdeen,
  socialLinks,
}: {
  eintraege: KalenderEintrag[];
  kundenprofilId: string;
  onNavigiereZuIdeen?: () => void;
  socialLinks?: SocialLinks;
}) {
  const t = useT();
  const { lang } = useLang();
  const dateLocale = lang === "de" ? "de-DE" : "en-GB";
  const [lokalEintraege, setLokalEintraege] = useState<KalenderEintrag[]>(eintraege);
  const [modalOffen, setModalOffen] = useState(false);
  const [ausgewaehlt, setAusgewaehlt] = useState<KalenderEintrag | null>(null);

  // Sync when router.refresh() delivers fresh server data
  useEffect(() => { setLokalEintraege(eintraege); }, [eintraege]);

  function eintragGespeichert(gespeichert: KalenderEintrag) {
    setLokalEintraege(prev => {
      const idx = prev.findIndex(e => e.id === gespeichert.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = gespeichert;
        return next;
      }
      return [...prev, gespeichert];
    });
  }

  function eintragGeloescht(id: string) {
    setLokalEintraege(prev => prev.filter(e => e.id !== id));
  }

  const grafikEintraege: KalenderGrafikEintrag[] = lokalEintraege.map((e) => ({
    id: e.id,
    titel: e.titel,
    geplantAm: e.geplantAm,
    dotFarbe: "bg-accent",
    dateizugriff: e.dateizugriff,
  }));

  const listeEintraege = useMemo(() => {
    const heute = tagBeginn(new Date()) - 86400000;
    return lokalEintraege
      .filter((e) => {
        if (e.gepostet) return false;
        if (!e.geplantAm) return false;
        return tagBeginn(new Date(e.geplantAm)) >= heute;
      })
      .sort((a, b) => {
        if (!a.geplantAm) return 1;
        if (!b.geplantAm) return -1;
        return new Date(a.geplantAm).getTime() - new Date(b.geplantAm).getTime();
      });
  }, [lokalEintraege]);

  function eintragById(id: string) {
    return lokalEintraege.find((e) => e.id === id) ?? null;
  }

  function oeffnen(eintrag: KalenderEintrag) {
    setAusgewaehlt(eintrag);
    setModalOffen(true);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => { setAusgewaehlt(null); setModalOffen(true); }}
          className="bg-accent hover:bg-accent-hover text-white text-sm px-4 py-1.5 rounded-lg transition-colors ml-auto"
        >
          {t.adminKalender.eintrag}
        </button>
      </div>

      {/* Kalender */}
      <div>
        <KalenderGrafik
          eintraege={grafikEintraege}
          onEintragKlick={(id) => {
            const e = eintragById(id);
            if (e) oeffnen(e);
          }}
        />
      </div>

      {/* Liste */}
      <div>
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-divider">
          <h3 className="font-medium text-sm text-fg">{t.adminKalender.bevorstehend}</h3>
          <span className="ml-auto text-xs bg-elevated text-muted px-2 py-0.5 rounded-full">{listeEintraege.length}</span>
          {socialLinks && SOCIAL_CONFIG.filter(s => socialLinks[s.key]).map(s => (
            <a
              key={s.key}
              href={socialLinks[s.key]!}
              target="_blank"
              rel="noopener noreferrer"
              title={s.label}
              onClick={e => e.stopPropagation()}
              className={`inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 p-1 sm:p-1.5 rounded-lg sm:rounded-xl transition-all hover:scale-110 hover:brightness-110 active:scale-95 ${s.cls}`}
            >
              {s.icon}
            </a>
          ))}
          {onNavigiereZuIdeen && (
            <button
              onClick={onNavigiereZuIdeen}
              className="text-xs text-accent border border-accent/30 hover:border-accent hover:bg-accent/5 px-2.5 py-1 rounded-lg transition-colors"
            >
              {t.adminKalender.contentIdeen}
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-3">
          {[
            { farbe: "bg-green-500", glow: "glow-green", label: t.adminKalender.heute },
            { farbe: "bg-accent",  glow: "glow-gold",  label: t.adminKalender.morgen },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-2 text-xs text-muted">
              <span className={`w-2.5 h-2.5 rounded-sm ${l.farbe} ${l.glow}`} />
              {l.label}
            </div>
          ))}
        </div>

        <div className="space-y-2 card-group">
          {listeEintraege.map((eintrag) => {
            return (
              <button
                key={eintrag.id}
                onClick={() => oeffnen(eintrag)}
                className={`w-full text-left bg-card border border-divider hover:border-muted/40 rounded-2xl p-4 border-l-4 ${datumFarbe(eintrag)} transition-all`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 flex gap-3">
                    {/* Vorschau links – auf allen Bildschirmgrößen */}
                    {eintrag.dateizugriff && (
                      <div className="shrink-0 w-12 md:w-16 aspect-square rounded-lg overflow-hidden border border-divider self-start">
                        <DriveVorschau
                          dateizugriff={eintrag.dateizugriff}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-fg line-clamp-2 break-words mb-0.5">{eintrag.titel ?? t.common.ohneTitle}</p>
                      {eintrag.beschreibung && (
                        <p className="text-muted text-xs line-clamp-1">{eintrag.beschreibung}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <p className="text-muted text-xs">{datumFormatieren(eintrag.geplantAm, dateLocale)}</p>
                    <div className="flex gap-1 flex-wrap justify-end">
                      {eintrag.plattform.map((p) => (
                        <span key={p} className={`text-xs px-1.5 py-0.5 rounded-md ${PLATTFORM_FARBEN[p] ?? "bg-elevated text-muted"}`}>
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}

          {listeEintraege.length === 0 && (
            <div className="text-center py-10 text-subtle text-sm border border-dashed border-divider rounded-2xl">
              {t.adminKalender.keineEintraege}
            </div>
          )}
        </div>
      </div>

      {modalOffen && (
        <KalenderEintragModal
          kundenprofilId={kundenprofilId}
          eintrag={ausgewaehlt ?? undefined}
          onClose={() => { setModalOffen(false); setAusgewaehlt(null); }}
          onGespeichert={(e) => { eintragGespeichert(e); setAusgewaehlt(null); }}
          onGeloescht={eintragGeloescht}
        />
      )}
    </div>
  );
}
