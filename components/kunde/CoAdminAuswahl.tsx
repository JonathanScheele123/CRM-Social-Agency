"use client";

import { signOut } from "next-auth/react";
import ThemeToggle from "@/components/ThemeToggle";

type Interface = {
  id: string;
  unternehmensname: string | null;
  kundenNr: number;
  kundenKategorie: string | null;
  statusKunde: string | null;
};

export default function CoAdminAuswahl({ interfaces }: { interfaces: Interface[] }) {
  return (
    <div className="min-h-screen text-fg">
      <header className="sticky top-0 z-10 border-b border-divider px-4 sm:px-6 py-4 glass-bar">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="JS Media" width={28} height={28} className="dark:hidden opacity-80 shrink-0" />
            <img src="/logo-white.png" alt="JS Media" width={28} height={28} className="hidden dark:block opacity-80 shrink-0" />
            <div>
              <h1 className="font-semibold text-sm sm:text-base text-fg">Meine Interfaces</h1>
              <p className="text-subtle text-xs hidden sm:block">{interfaces.length} freigegebene{interfaces.length === 1 ? "s Interface" : " Interfaces"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-muted hover:text-fg text-sm px-3 py-1.5 rounded-lg hover:bg-elevated transition-colors"
            >
              Abmelden
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {interfaces.map((iface) => (
            <a
              key={iface.id}
              href={`/dashboard?kunde=${iface.id}`}
              className="glass-modal rounded-2xl p-5 shadow-sm hover:shadow-md border border-divider hover:border-accent/40 transition-all group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-fg truncate group-hover:text-accent transition-colors">
                    {iface.unternehmensname ?? "Unbenannt"}
                  </p>
                  <p className="text-xs text-subtle mt-0.5">Kunde #{iface.kundenNr}</p>
                </div>
                {iface.statusKunde && (
                  <span className="text-xs px-2 py-0.5 rounded-lg bg-elevated border border-divider text-muted shrink-0">
                    {iface.statusKunde}
                  </span>
                )}
              </div>
              {iface.kundenKategorie && (
                <p className="text-xs text-subtle mt-3">{iface.kundenKategorie}</p>
              )}
              <p className="text-xs text-accent mt-3 group-hover:underline">Interface öffnen →</p>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}
