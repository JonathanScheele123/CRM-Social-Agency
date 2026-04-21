"use client";

import { useState } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [zeigDetails, setZeigDetails] = useState(false);

  return (
    <html lang="de">
      <body style={{ margin: 0, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f8f8fb", color: "#1a1a2e", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px", maxWidth: "360px", textAlign: "center", padding: "0 24px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="JS Media" width={40} height={40} style={{ opacity: 0.8 }} />

          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "8px" }}>Seite aktuell nicht erreichbar</h1>
            <p style={{ fontSize: "14px", color: "#666", lineHeight: 1.5 }}>
              Es ist ein unerwarteter Fehler aufgetreten. Bitte versuche es erneut oder kontaktiere uns.
            </p>
          </div>

          <button
            onClick={() => window.location.reload()}
            style={{ padding: "10px 22px", borderRadius: "12px", background: "#292a91", color: "#fff", border: "none", fontSize: "14px", fontWeight: 500, cursor: "pointer" }}
          >
            Seite aktualisieren
          </button>

          <a href="mailto:kontakt@jonathanscheele.de" style={{ fontSize: "14px", color: "#888", textDecoration: "none" }}>
            kontakt@jonathanscheele.de
          </a>
        </div>

        <button
          onClick={() => setZeigDetails(v => !v)}
          style={{ position: "fixed", bottom: "16px", left: "16px", fontSize: "11px", color: "rgba(0,0,0,0.25)", background: "none", border: "none", cursor: "pointer" }}
        >
          Fehlerdetails
        </button>

        {zeigDetails && (
          <div style={{ position: "fixed", bottom: "44px", left: "16px", maxWidth: "320px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "12px", fontSize: "12px", fontFamily: "monospace", color: "#555", boxShadow: "0 4px 16px rgba(0,0,0,0.1)", zIndex: 50 }}>
            <p style={{ fontWeight: 600, color: "#1a1a2e", marginBottom: "4px" }}>{error.name ?? "Error"}</p>
            {error.digest && <p style={{ color: "#999", marginBottom: "4px" }}>Digest: {error.digest}</p>}
            <p style={{ wordBreak: "break-word" }}>{error.message}</p>
          </div>
        )}
      </body>
    </html>
  );
}
