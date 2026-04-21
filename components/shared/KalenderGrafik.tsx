"use client";

import { useState, useMemo } from "react";

function fileIdAusDriveLink(url: string | null | undefined): string | null {
  if (!url) return null;
  const m = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ?? url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return m ? m[1] : null;
}

function DriveVorschau({ dateizugriff }: { dateizugriff?: string | null }) {
  const [fehler, setFehler] = useState(false);
  const fileId = fileIdAusDriveLink(dateizugriff);
  if (!fileId || fehler) return null;
  return (
    <img
      src={`/api/admin/drive/thumbnail?fileId=${fileId}`}
      alt="Vorschau"
      onError={() => setFehler(true)}
      className="mt-1.5 w-full rounded-lg object-cover border border-divider max-h-32"
    />
  );
}

const WOCHENTAGE = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const MONATE = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

export type KalenderGrafikEintrag = {
  id: string;
  titel: string | null;
  geplantAm: Date | null;
  dotFarbe: string;
  dateizugriff?: string | null;
};

type Props = {
  eintraege: KalenderGrafikEintrag[];
  onEintragKlick: (id: string) => void;
};

function tagSchluessel(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function gleichesDatum(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function KalenderGrafik({ eintraege, onEintragKlick }: Props) {
  const heute = useMemo(() => new Date(), []);
  const [monat, setMonat] = useState(heute.getMonth());
  const [jahr, setJahr] = useState(heute.getFullYear());
  const [aktiverTag, setAktiverTag] = useState<Date | null>(null);

  const eintraegeProTag = useMemo(() => {
    const map = new Map<string, KalenderGrafikEintrag[]>();
    for (const e of eintraege) {
      if (!e.geplantAm) continue;
      const d = new Date(e.geplantAm);
      const key = tagSchluessel(d);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return map;
  }, [eintraege]);

  const zellen = useMemo(() => {
    const ersterTag = new Date(jahr, monat, 1);
    const wochentagErster = (ersterTag.getDay() + 6) % 7;
    const tageImMonat = new Date(jahr, monat + 1, 0).getDate();

    const result: Array<{ tag: number | null; datum: Date | null }> = [];
    for (let i = 0; i < wochentagErster; i++) result.push({ tag: null, datum: null });
    for (let d = 1; d <= tageImMonat; d++) result.push({ tag: d, datum: new Date(jahr, monat, d) });
    while (result.length % 7 !== 0) result.push({ tag: null, datum: null });
    return result;
  }, [monat, jahr]);

  function vorherigerMonat() {
    if (monat === 0) { setMonat(11); setJahr((j) => j - 1); }
    else setMonat((m) => m - 1);
    setAktiverTag(null);
  }

  function naechsterMonat() {
    if (monat === 11) { setMonat(0); setJahr((j) => j + 1); }
    else setMonat((m) => m + 1);
    setAktiverTag(null);
  }

  const aktiveDatumEintraege = aktiverTag
    ? (eintraegeProTag.get(tagSchluessel(aktiverTag)) ?? [])
    : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={vorherigerMonat}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-elevated text-muted hover:text-fg transition-colors"
        >
          ←
        </button>
        <p className="font-semibold text-sm text-fg">
          {MONATE[monat]} {jahr}
        </p>
        <button
          onClick={naechsterMonat}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-elevated text-muted hover:text-fg transition-colors"
        >
          →
        </button>
      </div>

      <div className="overflow-x-auto -mx-1 px-1">
        <div style={{ minWidth: 560 }}>

      <div className="grid grid-cols-7 mb-1">
        {WOCHENTAGE.map((w) => (
          <div key={w} className="text-center text-xs text-subtle py-1 font-medium">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {zellen.map((zelle, i) => {
          if (!zelle.tag || !zelle.datum) {
            return <div key={i} className="min-h-[72px]" />;
          }

          const tagesEintraege = eintraegeProTag.get(tagSchluessel(zelle.datum)) ?? [];
          const istHeute = gleichesDatum(zelle.datum, heute);
          const istAktiv = aktiverTag ? gleichesDatum(zelle.datum, aktiverTag) : false;
          const hatEintraege = tagesEintraege.length > 0;

          return (
            <button
              key={i}
              onClick={() => setAktiverTag(istAktiv ? null : zelle.datum)}
              className={`min-h-[72px] rounded-xl p-1.5 flex flex-col items-start transition-all min-w-0 overflow-hidden border ${
                istAktiv
                  ? "bg-accent/10 border-accent/40 shadow-sm"
                  : istHeute
                  ? "bg-accent/8 border-accent/25"
                  : hatEintraege
                  ? "bg-card border-divider hover:border-muted/50 hover:bg-elevated hover:shadow-sm"
                  : "bg-transparent border-transparent hover:bg-elevated/60 hover:border-divider/50"
              }`}
            >
              <span
                className={`text-xs leading-none mb-1.5 w-full text-center font-medium ${
                  istHeute
                    ? "text-accent font-bold"
                    : istAktiv
                    ? "text-accent"
                    : "text-muted"
                }`}
              >
                {zelle.tag}
              </span>
              <div className="flex flex-col gap-0.5 w-full">
                {tagesEintraege.slice(0, 2).map((e, idx) => (
                  <div key={idx} className="min-w-0 w-full bg-accent/15 rounded px-1 py-px">
                    <span className="text-accent leading-snug block" style={{ fontSize: 10, lineHeight: "1.3", wordBreak: "break-word", whiteSpace: "normal" }}>
                      {e.titel ?? "–"}
                    </span>
                  </div>
                ))}
                {tagesEintraege.length > 2 && (
                  <span className="text-subtle pl-1" style={{ fontSize: 9 }}>
                    +{tagesEintraege.length - 2}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

        </div>
      </div>

      {aktiverTag && (
        <div className="mt-3 glass-modal rounded-2xl overflow-hidden shadow-sm">
          <div className="px-3 py-2 border-b border-divider">
            <p className="text-xs text-muted">
              {aktiverTag.toLocaleDateString("de-DE", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          {aktiveDatumEintraege.length === 0 ? (
            <p className="px-3 py-3 text-sm text-subtle">Keine Einträge.</p>
          ) : (
            <div className="divide-y divide-divider">
              {aktiveDatumEintraege.map((e) => (
                <button
                  key={e.id}
                  onClick={() => {
                    setAktiverTag(null);
                    onEintragKlick(e.id);
                  }}
                  className="w-full flex items-center gap-2.5 text-left px-3 py-2.5 hover:bg-elevated transition-colors"
                >
                  <span className="text-sm text-fg truncate">{e.titel ?? "Ohne Titel"}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
