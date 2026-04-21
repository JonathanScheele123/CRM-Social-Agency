"use client";

import { useState } from "react";

export default function MeinKontoForm({
  initialName,
  initialEmail,
}: {
  initialName: string | null;
  initialEmail: string;
}) {
  const [name, setName] = useState(initialName ?? "");
  const [email, setEmail] = useState(initialEmail);
  const [aktuellesPasswort, setAktuellesPasswort] = useState("");
  const [neuesPasswort, setNeuesPasswort] = useState("");
  const [neuesPasswortWdh, setNeuesPasswortWdh] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [fehler, setFehler] = useState("");
  const [zeigePw, setZeigePw] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFehler("");

    if (neuesPasswort && neuesPasswort !== neuesPasswortWdh) {
      setFehler("Die neuen Passwörter stimmen nicht überein.");
      return;
    }

    setStatus("saving");

    const res = await fetch("/api/admin/mein-konto", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        aktuellesPasswort,
        neuesPasswort: neuesPasswort || undefined,
      }),
    });

    const d = await res.json();

    if (!res.ok) {
      setFehler(d.fehler ?? "Fehler beim Speichern.");
      setStatus("error");
      return;
    }

    setAktuellesPasswort("");
    setNeuesPasswort("");
    setNeuesPasswortWdh("");
    setStatus("saved");
    setTimeout(() => setStatus("idle"), 3000);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name & E-Mail */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-muted mb-1.5">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Dein Name"
            className="w-full bg-elevated border border-divider text-fg text-sm rounded-xl px-3 py-2.5 placeholder:text-subtle focus:outline-none focus:border-accent transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted mb-1.5">E-Mail-Adresse</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-elevated border border-divider text-fg text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-accent transition-colors"
          />
        </div>
      </div>

      {/* Passwort-Bereich */}
      <div className="border-t border-divider pt-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-fg">Passwort ändern</p>
          <button
            type="button"
            onClick={() => setZeigePw((v) => !v)}
            className="text-xs text-accent hover:underline"
          >
            {zeigePw ? "Ausblenden" : "Passwort ändern"}
          </button>
        </div>

        {zeigePw && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Neues Passwort</label>
              <input
                type="password"
                value={neuesPasswort}
                onChange={(e) => setNeuesPasswort(e.target.value)}
                placeholder="Mindestens 8 Zeichen"
                className="w-full bg-elevated border border-divider text-fg text-sm rounded-xl px-3 py-2.5 placeholder:text-subtle focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Neues Passwort wiederholen</label>
              <input
                type="password"
                value={neuesPasswortWdh}
                onChange={(e) => setNeuesPasswortWdh(e.target.value)}
                placeholder="Passwort bestätigen"
                className="w-full bg-elevated border border-divider text-fg text-sm rounded-xl px-3 py-2.5 placeholder:text-subtle focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>
        )}
      </div>

      {/* Aktuelles Passwort – immer Pflicht */}
      <div className="border-t border-divider pt-5">
        <label className="block text-xs font-medium text-muted mb-1.5">
          Aktuelles Passwort <span className="text-red-500">*</span>
        </label>
        <input
          type="password"
          required
          value={aktuellesPasswort}
          onChange={(e) => setAktuellesPasswort(e.target.value)}
          placeholder="Zur Bestätigung der Änderungen"
          className="w-full bg-elevated border border-divider text-fg text-sm rounded-xl px-3 py-2.5 placeholder:text-subtle focus:outline-none focus:border-accent transition-colors"
        />
        <p className="text-xs text-subtle mt-1">Zur Sicherheit bei jeder Änderung erforderlich.</p>
      </div>

      {/* Feedback & Submit */}
      <div className="flex items-center justify-end gap-3 pt-1">
        {fehler && <p className="text-sm text-red-600 dark:text-red-400 flex-1">{fehler}</p>}
        {status === "saved" && <span className="text-sm text-green-600 dark:text-green-400">Gespeichert ✓</span>}
        <button
          type="submit"
          disabled={status === "saving" || !aktuellesPasswort}
          className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-xl transition-colors"
        >
          {status === "saving" ? "Speichert…" : "Änderungen speichern"}
        </button>
      </div>
    </form>
  );
}
