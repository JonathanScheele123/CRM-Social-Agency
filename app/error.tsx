"use client";

import { useState } from "react";
import Image from "next/image";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [zeigDetails, setZeigDetails] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-bg text-fg">
      <div className="flex flex-col items-center gap-6 max-w-sm w-full text-center">
        <div className="flex items-center justify-center">
          <Image src="/logo.png" alt="JS Media" width={48} height={48} className="dark:hidden opacity-80" />
          <Image src="/logo-white.png" alt="JS Media" width={48} height={48} className="hidden dark:block opacity-80" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-fg">Seite aktuell nicht erreichbar</h1>
          <p className="text-sm text-muted">
            Es ist ein unerwarteter Fehler aufgetreten. Bitte versuche es erneut oder kontaktiere uns.
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ background: "var(--accent)" }}
        >
          Seite aktualisieren
        </button>

        <a
          href="mailto:kontakt@jonathanscheele.de"
          className="text-sm text-muted hover:text-fg transition-colors"
        >
          kontakt@jonathanscheele.de
        </a>
      </div>

      <button
        onClick={() => setZeigDetails(v => !v)}
        className="fixed bottom-4 left-4 text-xs text-muted/40 hover:text-muted transition-colors"
      >
        Fehlerdetails
      </button>

      {zeigDetails && (
        <div className="fixed bottom-12 left-4 max-w-xs bg-card border border-divider rounded-xl p-3 text-xs font-mono text-muted shadow-lg z-50">
          <p className="font-semibold text-fg mb-1">{error.name ?? "Error"}</p>
          {error.digest && <p className="text-subtle mb-1">Digest: {error.digest}</p>}
          <p className="break-words">{error.message}</p>
        </div>
      )}
    </div>
  );
}
