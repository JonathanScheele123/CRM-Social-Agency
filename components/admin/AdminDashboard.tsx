"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

type KundenUebersicht = {
  id: string;
  kundenNr: number;
  unternehmensname: string | null;
  kundenKategorie: string | null;
  statusKunde: string | null;
  letzterKontakt: Date | null;
  _count: { contentIdeen_: number; kalender: number };
};

const KATEGORIE_FARBEN: Record<string, string> = {
  "A-Kunde": "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "B-Kunde": "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  "C-Kunde": "bg-teal-500/20 text-teal-300 border-teal-500/30",
  Bestandskunde: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  Neukunde: "bg-green-500/20 text-green-300 border-green-500/30",
  Potenzial: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  Inaktiv: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

export default function AdminDashboard({ kunden }: { kunden: KundenUebersicht[] }) {
  const router = useRouter();
  const [suche, setSuche] = useState("");

  const gefilterteKunden = kunden.filter((k) =>
    (k.unternehmensname ?? "").toLowerCase().includes(suche.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-sm font-bold">
            S
          </div>
          <span className="font-semibold text-lg">Social Agency</span>
          <span className="text-gray-500 text-sm ml-2">Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin/kunden/neu")}
            className="bg-blue-600 hover:bg-blue-500 text-sm px-4 py-2 rounded-lg transition-colors"
          >
            + Neuer Kunde
          </button>
          <button
            onClick={() => router.push("/admin/benutzer")}
            className="text-gray-400 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Benutzer
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-gray-400 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Abmelden
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <p className="text-gray-400 text-sm">Gesamt Kunden</p>
            <p className="text-3xl font-semibold mt-1">{kunden.length}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <p className="text-gray-400 text-sm">Aktive Kunden</p>
            <p className="text-3xl font-semibold mt-1">
              {kunden.filter((k) => k.kundenKategorie !== "Inaktiv").length}
            </p>
          </div>
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <p className="text-gray-400 text-sm">Content-Ideen gesamt</p>
            <p className="text-3xl font-semibold mt-1">
              {kunden.reduce((sum, k) => sum + k._count.contentIdeen_, 0)}
            </p>
          </div>
        </div>

        {/* Kunden-Liste */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Kunden-Interfaces</h2>
          <input
            type="text"
            value={suche}
            onChange={(e) => setSuche(e.target.value)}
            placeholder="Kunde suchen..."
            className="bg-gray-900 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 placeholder-gray-500 focus:outline-none focus:border-blue-500 w-56 transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gefilterteKunden.map((kunde) => (
            <button
              key={kunde.id}
              onClick={() => router.push(`/admin/kunden/${kunde.id}`)}
              className="bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl p-5 text-left transition-all hover:bg-gray-800/50 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">#{kunde.kundenNr}</p>
                  <h3 className="font-medium text-white group-hover:text-blue-300 transition-colors">
                    {kunde.unternehmensname ?? "Unbenannt"}
                  </h3>
                </div>
                {kunde.kundenKategorie && (
                  <span
                    className={`text-xs px-2 py-1 rounded-md border ${
                      KATEGORIE_FARBEN[kunde.kundenKategorie] ?? "bg-gray-700 text-gray-300 border-gray-600"
                    }`}
                  >
                    {kunde.kundenKategorie}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>{kunde._count.contentIdeen_} Ideen</span>
                <span>{kunde._count.kalender} im Kalender</span>
              </div>
              {kunde.statusKunde && (
                <p className="text-xs text-gray-500 mt-2 truncate">{kunde.statusKunde}</p>
              )}
            </button>
          ))}

          {gefilterteKunden.length === 0 && (
            <div className="col-span-3 text-center py-12 text-gray-500">
              Keine Kunden gefunden.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
