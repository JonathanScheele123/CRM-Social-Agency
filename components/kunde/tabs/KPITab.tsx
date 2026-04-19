"use client";

import { useState } from "react";

type KPI = {
  id: string;
  monatJahr: string | null;
  plattform: string | null;
  reichweite: number | null;
  impressionen: number | null;
  follower: number | null;
  engagementRate: number | null;
  likes: number | null;
  kommentare: number | null;
  shares: number | null;
  saves: number | null;
  klicks: number | null;
  analyseKommentar: string | null;
  anomalieErkennung: string | null;
};

function trend(aktuell: number | null, vormonat: number | null): string {
  if (aktuell == null || vormonat == null || vormonat === 0) return "";
  const diff = ((aktuell - vormonat) / vormonat) * 100;
  if (diff > 0) return `+${diff.toFixed(1)}%`;
  return `${diff.toFixed(1)}%`;
}

function trendFarbe(aktuell: number | null, vormonat: number | null): string {
  if (aktuell == null || vormonat == null) return "text-gray-500";
  return aktuell >= vormonat ? "text-green-400" : "text-red-400";
}

function zahl(val: number | null): string {
  if (val == null) return "–";
  return val.toLocaleString("de-DE");
}

export default function KPITab({ kpis }: { kpis: KPI[] }) {
  const [ausgewaehlt, setAusgewaehlt] = useState<KPI | null>(kpis[0] ?? null);

  if (kpis.length === 0) {
    return <div className="text-center py-12 text-gray-500">Noch keine KPI-Daten vorhanden.</div>;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Auswahl-Liste */}
      <div className="w-full lg:w-64 shrink-0">
        <p className="text-gray-400 text-xs mb-2">Berichte</p>
        <div className="space-y-1">
          {kpis.map((kpi) => (
            <button
              key={kpi.id}
              onClick={() => setAusgewaehlt(kpi)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                ausgewaehlt?.id === kpi.id
                  ? "bg-blue-600/20 text-blue-300 border border-blue-600/30"
                  : "text-gray-300 hover:bg-gray-800"
              }`}
            >
              <p className="font-medium">{kpi.monatJahr ?? "–"}</p>
              {kpi.plattform && <p className="text-xs text-gray-400">{kpi.plattform}</p>}
            </button>
          ))}
        </div>
      </div>

      {/* KPI-Details */}
      {ausgewaehlt && (
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-6">
            <div>
              <h2 className="font-semibold text-lg">{ausgewaehlt.monatJahr}</h2>
              {ausgewaehlt.plattform && (
                <p className="text-gray-400 text-sm">{ausgewaehlt.plattform}</p>
              )}
            </div>
          </div>

          {/* KPI-Kacheln */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {[
              { label: "Reichweite", wert: ausgewaehlt.reichweite },
              { label: "Impressionen", wert: ausgewaehlt.impressionen },
              { label: "Follower", wert: ausgewaehlt.follower },
              { label: "Engagement-Rate", wert: ausgewaehlt.engagementRate ? `${ausgewaehlt.engagementRate}%` : null, raw: ausgewaehlt.engagementRate },
              { label: "Likes", wert: ausgewaehlt.likes },
              { label: "Kommentare", wert: ausgewaehlt.kommentare },
              { label: "Shares", wert: ausgewaehlt.shares },
              { label: "Saves", wert: ausgewaehlt.saves },
              { label: "Klicks", wert: ausgewaehlt.klicks },
            ].map((item) => (
              <div key={item.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="text-gray-400 text-xs mb-1">{item.label}</p>
                <p className="text-xl font-semibold">
                  {typeof item.wert === "string" ? item.wert : zahl(item.wert as number | null)}
                </p>
              </div>
            ))}
          </div>

          {/* Analyse */}
          {ausgewaehlt.analyseKommentar && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-3">
              <p className="text-gray-400 text-xs mb-2">Analyse</p>
              <p className="text-sm text-gray-200">{ausgewaehlt.analyseKommentar}</p>
            </div>
          )}

          {ausgewaehlt.anomalieErkennung && (
            <div className="bg-yellow-950/30 border border-yellow-600/30 rounded-xl p-4">
              <p className="text-yellow-400 text-xs mb-2">KI-Anomalie-Erkennung</p>
              <p className="text-sm text-gray-200">{ausgewaehlt.anomalieErkennung}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
