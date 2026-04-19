"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminKalenderTab from "@/components/admin/AdminKalenderTab";
import AdminContentIdeenTab from "@/components/admin/AdminContentIdeenTab";
import AdminKundendatenTab from "@/components/admin/AdminKundendatenTab";
import AdminArchivTab from "@/components/admin/AdminArchivTab";
import BenutzerModal from "@/components/admin/BenutzerModal";
import KPITab from "@/components/kunde/tabs/KPITab";

type AllesKundenprofil = { id: string; unternehmensname: string | null; kundenNr: number };

type KundeDetailProps = {
  kunde: {
    id: string;
    kundenNr: number;
    unternehmensname: string | null;
    ansprechpartner: string | null;
    emailAnsprechpartner: string | null;
    branche: string | null;
    telefonnummer: string | null;
    kundenKategorie: string | null;
    statusKunde: string | null;
    kundenzufriedenheit: string | null;
    notizenIntern: string | null;
    zugriffe: Array<{
      id: string;
      user: { id: string; name: string | null; email: string; rolle: string; aktiv: boolean };
    }>;
    contentIdeen_: Parameters<typeof AdminContentIdeenTab>[0]["ideen"];
    kalender: Parameters<typeof AdminKalenderTab>[0]["eintraege"];
    kpis: Parameters<typeof KPITab>[0]["kpis"];
    kundendaten: Parameters<typeof AdminKundendatenTab>[0]["daten"];
    archivEintraege: Parameters<typeof AdminArchivTab>[0]["eintraege"];
  };
  alleKunden: AllesKundenprofil[];
};

const TABS = [
  { id: "kalender", label: "Kalender" },
  { id: "ideen", label: "Content-Ideen" },
  { id: "kpis", label: "KPIs" },
  { id: "daten", label: "Kundendaten" },
  { id: "archiv", label: "Archiv" },
  { id: "einstellungen", label: "Einstellungen" },
];

export default function KundeDetailView({ kunde, alleKunden }: KundeDetailProps) {
  const router = useRouter();
  const [aktuellerTab, setAktuellerTab] = useState("kalender");

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-gray-400 hover:text-white text-sm"
            >
              ← Übersicht
            </button>
            <span className="text-gray-600">/</span>
            <div>
              <span className="font-medium">{kunde.unternehmensname ?? "Kunde"}</span>
              <span className="text-gray-500 text-sm ml-2">#{kunde.kundenNr}</span>
            </div>
          </div>
          <button
            onClick={() => router.push(`/admin/kunden/${kunde.id}/bearbeiten`)}
            className="bg-gray-800 hover:bg-gray-700 text-sm px-3 py-1.5 rounded-lg transition-colors"
          >
            Bearbeiten
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="border-b border-gray-800 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex gap-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setAktuellerTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                aktuellerTab === tab.id
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {aktuellerTab === "kalender" && <AdminKalenderTab eintraege={kunde.kalender} kundenprofilId={kunde.id} />}
        {aktuellerTab === "ideen" && <AdminContentIdeenTab ideen={kunde.contentIdeen_} kundenprofilId={kunde.id} />}
        {aktuellerTab === "kpis" && <KPITab kpis={kunde.kpis} />}
        {aktuellerTab === "daten" && <AdminKundendatenTab daten={kunde.kundendaten} kundenprofilId={kunde.id} />}
        {aktuellerTab === "archiv" && <AdminArchivTab eintraege={kunde.archivEintraege} kundenprofilId={kunde.id} />}
        {aktuellerTab === "einstellungen" && (
          <EinstellungenTab kunde={kunde} alleKunden={alleKunden} />
        )}
      </main>
    </div>
  );
}

function EinstellungenTab({
  kunde,
  alleKunden,
}: {
  kunde: KundeDetailProps["kunde"];
  alleKunden: AllesKundenprofil[];
}) {
  const [benutzerModalModus, setBenutzerModalModus] = useState<"erstellen" | "bearbeiten" | null>(null);
  const [ausgewaehltUser, setAusgewaehltUser] = useState<KundeDetailProps["kunde"]["zugriffe"][number]["user"] | null>(null);

  function oeffneBenutzerBearbeiten(user: KundeDetailProps["kunde"]["zugriffe"][number]["user"]) {
    setAusgewaehltUser(user);
    setBenutzerModalModus("bearbeiten");
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Kundendaten */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="font-medium mb-4">Kundendaten</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-400 text-xs mb-0.5">Unternehmensname</p>
            <p>{kunde.unternehmensname ?? "–"}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-0.5">Kategorie</p>
            <p>{kunde.kundenKategorie ?? "–"}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-0.5">Ansprechpartner</p>
            <p>{kunde.ansprechpartner ?? "–"}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-0.5">E-Mail</p>
            <p>{kunde.emailAnsprechpartner ?? "–"}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-0.5">Telefon</p>
            <p>{kunde.telefonnummer ?? "–"}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-0.5">Branche</p>
            <p>{kunde.branche ?? "–"}</p>
          </div>
        </div>
        {kunde.notizenIntern && (
          <div className="mt-3 pt-3 border-t border-gray-800">
            <p className="text-gray-400 text-xs mb-0.5">Interne Notizen</p>
            <p className="text-sm text-gray-200">{kunde.notizenIntern}</p>
          </div>
        )}
      </div>

      {/* Benutzer-Zugriffe */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Benutzer mit Zugriff</h3>
          <button
            onClick={() => { setAusgewaehltUser(null); setBenutzerModalModus("erstellen"); }}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            + Benutzer hinzufügen
          </button>
        </div>
        {kunde.zugriffe.length === 0 ? (
          <p className="text-gray-500 text-sm">Noch kein Benutzer zugewiesen.</p>
        ) : (
          <div className="space-y-1">
            {kunde.zugriffe.map((z) => (
              <button
                key={z.id}
                onClick={() => oeffneBenutzerBearbeiten(z.user)}
                className="w-full flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-gray-800 transition-colors border-b border-gray-800 last:border-0"
              >
                <div className="text-left">
                  <p className="text-sm">{z.user.name ?? z.user.email}</p>
                  <p className="text-xs text-gray-400">{z.user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-md ${z.user.aktiv ? "bg-green-500/20 text-green-300" : "bg-gray-500/20 text-gray-400"}`}>
                    {z.user.aktiv ? "Aktiv" : "Inaktiv"}
                  </span>
                  <span className="text-gray-600 text-sm">›</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Benutzer-Modal */}
      {benutzerModalModus === "erstellen" && (
        <BenutzerModal
          modus="erstellen"
          alleKunden={alleKunden}
          vorausgewaehltesKundenprofil={kunde.id}
          onClose={() => setBenutzerModalModus(null)}
        />
      )}
      {benutzerModalModus === "bearbeiten" && ausgewaehltUser && (
        <BenutzerModal
          modus="bearbeiten"
          benutzer={{
            id: ausgewaehltUser.id,
            name: ausgewaehltUser.name,
            email: ausgewaehltUser.email,
            aktiv: ausgewaehltUser.aktiv,
            zugriffe: kunde.zugriffe
              .filter((z) => z.user.id === ausgewaehltUser.id)
              .map((z) => ({
                id: z.id,
                kundenprofil: { id: kunde.id, unternehmensname: kunde.unternehmensname },
              })),
          }}
          alleKunden={alleKunden}
          onClose={() => { setBenutzerModalModus(null); setAusgewaehltUser(null); }}
        />
      )}
    </div>
  );
}
