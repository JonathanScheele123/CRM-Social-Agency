"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BenutzerModal from "./BenutzerModal";
import ThemeToggle from "@/components/ThemeToggle";

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
    <div className="min-h-screen text-fg">
      <header className="sticky top-0 z-10 border-b border-divider px-6 py-4 flex items-center justify-between glass-bar">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-muted hover:text-fg text-sm transition-colors"
          >
            ← Admin
          </button>
          <span className="text-subtle">/</span>
          <span className="font-semibold text-fg">Benutzerverwaltung</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={oeffneErstellen}
            className="bg-accent hover:bg-accent-hover text-white text-sm px-4 py-2 rounded-lg transition-colors font-medium"
          >
            + Neuer Benutzer
          </button>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-2">
          {benutzer.map((b) => (
            <button
              key={b.id}
              onClick={() => oeffneBearbeiten(b)}
              className="w-full text-left bg-card border border-divider hover:border-muted/40 rounded-2xl p-4 flex items-center justify-between transition-all hover:shadow-sm"
            >
              <div>
                <p className="font-medium text-sm text-fg">{b.name ?? b.email}</p>
                <p className="text-muted text-xs">{b.email}</p>
                <div className="flex gap-2 mt-1.5 flex-wrap">
                  {b.zugriffe.map((z) => (
                    <span
                      key={z.id}
                      className="text-xs bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-lg"
                    >
                      {z.kundenprofil.unternehmensname ?? "Unbekannt"}
                    </span>
                  ))}
                  {b.zugriffe.length === 0 && (
                    <span className="text-xs text-subtle">Kein Interface zugewiesen</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-xs px-2 py-0.5 rounded-lg ${
                    b.aktiv
                      ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300"
                      : "bg-elevated text-subtle"
                  }`}
                >
                  {b.aktiv ? "Aktiv" : "Inaktiv"}
                </span>
                <span className="text-subtle text-sm">›</span>
              </div>
            </button>
          ))}

          {benutzer.length === 0 && (
            <div className="text-center py-12 text-subtle">
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
