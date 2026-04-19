"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BenutzerModal from "./BenutzerModal";

type Benutzer = {
  id: string;
  name: string | null;
  email: string;
  aktiv: boolean;
  createdAt: Date;
  zugriffe: Array<{
    id: string;
    kundenprofil: { id: string; unternehmensname: string | null };
  }>;
};

type Kundenprofil = { id: string; unternehmensname: string | null; kundenNr: number };

export default function BenutzerVerwaltung({
  benutzer,
  alleKunden,
}: {
  benutzer: Benutzer[];
  alleKunden: Kundenprofil[];
}) {
  const router = useRouter();
  const [modalModus, setModalModus] = useState<"erstellen" | "bearbeiten" | null>(null);
  const [ausgewaehlt, setAusgewaehlt] = useState<Benutzer | null>(null);

  function oeffneErstellen() {
    setAusgewaehlt(null);
    setModalModus("erstellen");
  }

  function oeffneBearbeiten(b: Benutzer) {
    setAusgewaehlt(b);
    setModalModus("bearbeiten");
  }

  function schliesseModal() {
    setModalModus(null);
    setAusgewaehlt(null);
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-gray-400 hover:text-white text-sm"
          >
            ← Admin
          </button>
          <span className="text-gray-600">/</span>
          <span className="font-medium">Benutzerverwaltung</span>
        </div>
        <button
          onClick={oeffneErstellen}
          className="bg-blue-600 hover:bg-blue-500 text-sm px-4 py-2 rounded-lg transition-colors"
        >
          + Neuer Benutzer
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-2">
          {benutzer.map((b) => (
            <button
              key={b.id}
              onClick={() => oeffneBearbeiten(b)}
              className="w-full text-left bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl p-4 flex items-center justify-between transition-all"
            >
              <div>
                <p className="font-medium text-sm">{b.name ?? b.email}</p>
                <p className="text-gray-400 text-xs">{b.email}</p>
                <div className="flex gap-2 mt-1.5 flex-wrap">
                  {b.zugriffe.map((z) => (
                    <span
                      key={z.id}
                      className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-md"
                    >
                      {z.kundenprofil.unternehmensname ?? "Unbekannt"}
                    </span>
                  ))}
                  {b.zugriffe.length === 0 && (
                    <span className="text-xs text-gray-500">Kein Interface zugewiesen</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-xs px-2 py-0.5 rounded-md ${
                    b.aktiv
                      ? "bg-green-500/20 text-green-300"
                      : "bg-gray-500/20 text-gray-400"
                  }`}
                >
                  {b.aktiv ? "Aktiv" : "Inaktiv"}
                </span>
                <span className="text-gray-600 text-sm">›</span>
              </div>
            </button>
          ))}

          {benutzer.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Noch keine Kunden-Benutzer angelegt.
            </div>
          )}
        </div>
      </main>

      {modalModus === "erstellen" && (
        <BenutzerModal
          modus="erstellen"
          alleKunden={alleKunden}
          onClose={schliesseModal}
        />
      )}

      {modalModus === "bearbeiten" && ausgewaehlt && (
        <BenutzerModal
          modus="bearbeiten"
          benutzer={ausgewaehlt}
          alleKunden={alleKunden}
          onClose={schliesseModal}
        />
      )}
    </div>
  );
}
