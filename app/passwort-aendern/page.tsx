"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n";
import LangToggle from "@/components/LangToggle";

export default function PasswortAendernPage() {
  const t = useT();
  const [neuesPasswort, setNeuesPasswort] = useState("");
  const [bestaetigung, setBestaetigung] = useState("");
  const [fehler, setFehler] = useState("");
  const [laden, setLaden] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFehler("");

    if (neuesPasswort.length < 8) {
      setFehler(t.passwortAendern.minLaenge);
      return;
    }

    if (neuesPasswort !== bestaetigung) {
      setFehler(t.passwortAendern.nichtUebereinstimmend);
      return;
    }

    setLaden(true);

    const res = await fetch("/api/passwort-aendern", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ neuesPasswort }),
    });

    if (res.ok) {
      window.location.href = "/dashboard#start";
    } else {
      const data = await res.json().catch(() => ({}));
      setFehler(data.fehler || t.common.fehlerAufgetreten);
      setLaden(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="absolute top-4 right-4">
        <LangToggle />
      </div>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img src="/logo.png" alt="JS Media" width={80} height={80} className="dark:hidden" />
            <img
              src="/logo-white.png"
              alt="JS Media"
              width={80}
              height={80}
              className="hidden dark:block"
            />
          </div>
          <h1 className="text-fg text-2xl font-semibold tracking-tight">{t.passwortAendern.titel}</h1>
          <p className="text-muted text-sm mt-2 max-w-xs mx-auto leading-relaxed">
            {t.passwortAendern.untertitel}
          </p>
        </div>

        <div className="glass-modal rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-fg mb-1.5">{t.passwortAendern.neuesPasswort}</label>
              <input
                type="password"
                value={neuesPasswort}
                onChange={(e) => setNeuesPasswort(e.target.value)}
                required
                placeholder={t.passwortAendern.neuesPasswortPlaceholder}
                className="w-full bg-elevated border border-divider text-fg rounded-xl px-4 py-3 text-sm placeholder:text-subtle focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-fg mb-1.5">{t.passwortAendern.bestaetigung}</label>
              <input
                type="password"
                value={bestaetigung}
                onChange={(e) => setBestaetigung(e.target.value)}
                required
                placeholder={t.passwortAendern.bestaetigungPlaceholder}
                className="w-full bg-elevated border border-divider text-fg rounded-xl px-4 py-3 text-sm placeholder:text-subtle focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {fehler && (
              <p className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2">
                {fehler}
              </p>
            )}

            <button
              type="submit"
              disabled={laden}
              className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl py-3 text-sm transition-colors"
            >
              {laden ? t.passwortAendern.wirdGespeichert : t.passwortAendern.festlegen}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
