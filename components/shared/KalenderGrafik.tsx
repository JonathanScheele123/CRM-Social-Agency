"use client";

import { useState, useMemo } from "react";

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
    const wochentagErster = (ersterTag.getDay() + 6) % 7; // 0=Mo … 6=So
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
      {/* Monats-Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={vorherigerMonat}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          ←
        </button>
        <p className="font-medium text-sm">
          {MONATE[monat]} {jahr}
        </p>
        <button
          onClick={naechsterMonat}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          →
        </button>
      </div>

      {/* Wochentag-Kopfzeile */}
      <div className="grid grid-cols-7 mb-1">
        {WOCHENTAGE.map((w) => (
          <div key={w} className="text-center text-xs text-gray-500 py-1 font-medium">
            {w}
          </div>
        ))}
      </div>

      {/* Tage-Gitter */}
      <div className="grid grid-cols-7 gap-px">
        {zellen.map((zelle, i) => {
          if (!zelle.tag || !zelle.datum) {
            return <div key={i} className="aspect-square" />;
          }

          const tagesEintraege = eintraegeProTag.get(tagSchluessel(zelle.datum)) ?? [];
          const istHeute = gleichesDatum(zelle.datum, heute);
          const istAktiv = aktiverTag ? gleichesDatum(zelle.datum, aktiverTag) : false;

          return (
            <button
              key={i}
              onClick={() =>
                setAktiverTag(istAktiv ? null : zelle.datum)
              }
              className={`aspect-square rounded-lg p-1 flex flex-col items-center justify-start transition-colors min-w-0 ${
                istAktiv
                  ? "bg-gray-700 ring-1 ring-gray-600"
                  : istHeute
                  ? "bg-blue-950/40"
                  : tagesEintraege.length > 0
                  ? "hover:bg-gray-800"
                  : "hover:bg-gray-900/50"
              }`}
            >
              <span
                className={`text-xs leading-none mb-1 ${
                  istHeute
                    ? "text-blue-400 font-bold"
                    : istAktiv
                    ? "text-white font-medium"
                    : "text-gray-400"
                }`}
              >
                {zelle.tag}
              </span>
              <div className="flex flex-wrap gap-0.5 justify-center">
                {tagesEintraege.slice(0, 3).map((e, idx) => (
                  <span
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full ${e.dotFarbe}`}
                  />
                ))}
                {tagesEintraege.length > 3 && (
                  <span className="text-gray-500 leading-none" style={{ fontSize: 8 }}>
                    +{tagesEintraege.length - 3}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Einträge des ausgewählten Tags */}
      {aktiverTag && (
        <div className="mt-3 bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-800">
            <p className="text-xs text-gray-400">
              {aktiverTag.toLocaleDateString("de-DE", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          {aktiveDatumEintraege.length === 0 ? (
            <p className="px-3 py-3 text-sm text-gray-500">Keine Einträge.</p>
          ) : (
            <div className="divide-y divide-gray-800">
              {aktiveDatumEintraege.map((e) => (
                <button
                  key={e.id}
                  onClick={() => {
                    setAktiverTag(null);
                    onEintragKlick(e.id);
                  }}
                  className="w-full flex items-center gap-2.5 text-left px-3 py-2.5 hover:bg-gray-800 transition-colors"
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${e.dotFarbe}`} />
                  <span className="text-sm text-gray-200 truncate">
                    {e.titel ?? "Ohne Titel"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
