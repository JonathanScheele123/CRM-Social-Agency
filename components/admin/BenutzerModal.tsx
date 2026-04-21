"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Kundenprofil = { id: string; unternehmensname: string | null; kundenNr: number };

type Benutzer = {
  id: string;
  name: string | null;
  email: string;
  aktiv: boolean;
  zugriffe: Array<{ id: string; kundenprofil: { id: string; unternehmensname: string | null } }>;
};

type Props =
  | {
      modus: "erstellen";
      alleKunden: Kundenprofil[];
      vorausgewaehltesKundenprofil?: string;
      onClose: () => void;
    }
  | {
      modus: "bearbeiten";
      benutzer: Benutzer;
      alleKunden: Kundenprofil[];
      onClose: () => void;
    };

const inputKlasse =
  "w-full bg-elevated border border-divider text-fg rounded-xl px-4 py-2.5 text-sm placeholder:text-subtle focus:outline-none focus:border-accent transition-colors";

export default function BenutzerModal(props: Props) {
  const router = useRouter();
  const [laden, setLaden] = useState(false);
  const [fehler, setFehler] = useState("");

  const initialKundenprofilIds =
    props.modus === "bearbeiten"
      ? props.benutzer.zugriffe.map((z) => z.kundenprofil.id)
      : props.vorausgewaehltesKundenprofil
      ? [props.vorausgewaehltesKundenprofil]
      : [];

  const [form, setForm] = useState({
    name: props.modus === "bearbeiten" ? (props.benutzer.name ?? "") : "",
    email: props.modus === "bearbeiten" ? props.benutzer.email : "",
    passwort: "",
    aktiv: props.modus === "bearbeiten" ? props.benutzer.aktiv : true,
    kundenprofilIds: initialKundenprofilIds,
    kundenRolle: "Inhaber" as "Inhaber" | "Mitarbeiter",
  });

  function toggleKundenprofil(id: string) {
    setForm((prev) => ({
      ...prev,
      kundenprofilIds: prev.kundenprofilIds.includes(id)
        ? prev.kundenprofilIds.filter((x) => x !== id)
        : [...prev.kundenprofilIds, id],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLaden(true);
    setFehler("");

    const body: Record<string, unknown> = {
      name: form.name,
      email: form.email,
      kundenprofilIds: form.kundenprofilIds,
      kundenRolle: form.kundenRolle,
    };

    if (props.modus === "erstellen") {
      if (!form.passwort) {
        setFehler("Passwort ist ein Pflichtfeld.");
        setLaden(false);
        return;
      }
      body.passwort = form.passwort;
    } else {
      body.aktiv = form.aktiv;
      if (form.passwort) body.neuesPasswort = form.passwort;
    }

    const url =
      props.modus === "bearbeiten"
        ? `/api/admin/benutzer/${props.benutzer.id}`
        : "/api/admin/benutzer";

    const res = await fetch(url, {
      method: props.modus === "bearbeiten" ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setLaden(false);
    if (!res.ok) {
      const data = await res.json();
      setFehler(data.fehler ?? "Fehler.");
      return;
    }
    props.onClose();
    router.refresh();
  }

  async function handleLoeschen() {
    if (props.modus !== "bearbeiten") return;
    if (!confirm(`Benutzer „${props.benutzer.email}" wirklich löschen?`)) return;
    await fetch(`/api/admin/benutzer/${props.benutzer.id}`, { method: "DELETE" });
    props.onClose();
    router.refresh();
  }

  return (
    <div
      className="fixed inset-0 glass-overlay z-50 flex items-end sm:items-center justify-center p-4"
      onClick={props.onClose}
    >
      <div
        className="glass-modal rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto "
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-divider flex items-center justify-between">
          <h3 className="font-semibold text-fg">
            {props.modus === "erstellen" ? "Neuer Benutzer" : "Benutzer bearbeiten"}
          </h3>
          <button onClick={props.onClose} className="text-muted hover:text-fg transition-colors">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm text-muted mb-1.5">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Max Mustermann"
              className={inputKlasse}
            />
          </div>

          <div>
            <label className="block text-sm text-muted mb-1.5">E-Mail *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="name@unternehmen.de"
              className={inputKlasse}
            />
          </div>

          <div>
            <label className="block text-sm text-muted mb-1.5">
              {props.modus === "erstellen" ? "Passwort *" : "Neues Passwort"}
            </label>
            <input
              type="password"
              value={form.passwort}
              onChange={(e) => setForm((p) => ({ ...p, passwort: e.target.value }))}
              placeholder={
                props.modus === "erstellen"
                  ? "Mindestens 8 Zeichen"
                  : "Leer lassen, um nicht zu ändern"
              }
              className={inputKlasse}
            />
          </div>

          <div>
            <label className="block text-sm text-muted mb-2">Interface-Zugriff</label>
            {props.alleKunden.length === 0 ? (
              <p className="text-subtle text-sm">Noch keine Kundenprofile vorhanden.</p>
            ) : (
              <div className="space-y-1.5">
                {props.alleKunden.map((k) => (
                  <label
                    key={k.id}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-colors ${
                      form.kundenprofilIds.includes(k.id)
                        ? "bg-accent/10 border-accent/50 text-fg"
                        : "bg-elevated border-divider text-muted hover:border-muted/60"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={form.kundenprofilIds.includes(k.id)}
                      onChange={() => toggleKundenprofil(k.id)}
                      className="accent-[var(--accent)]"
                    />
                    <span className="text-sm">
                      #{k.kundenNr} {k.unternehmensname ?? "Unbenannt"}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-muted mb-1.5">Rolle</label>
            <select
              value={form.kundenRolle}
              onChange={(e) => setForm((p) => ({ ...p, kundenRolle: e.target.value as "Inhaber" | "Mitarbeiter" }))}
              className={inputKlasse}
            >
              <option value="Inhaber">Inhaber – voller Zugriff</option>
              <option value="Mitarbeiter">Mitarbeiter – kein Zugriff auf Kundendaten</option>
              <option value="Co-Admin">Co-Admin – mehrere Interfaces, voller Zugriff</option>
            </select>
          </div>

          {props.modus === "bearbeiten" && (
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.aktiv}
                onChange={(e) => setForm((p) => ({ ...p, aktiv: e.target.checked }))}
                className="w-4 h-4 accent-blue-600"
              />
              <span className="text-sm text-muted">Benutzer aktiv</span>
            </label>
          )}

          {fehler && (
            <p className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2">
              {fehler}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            {props.modus === "bearbeiten" && (
              <button
                type="button"
                onClick={handleLoeschen}
                className="px-4 py-2.5 rounded-xl text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                Löschen
              </button>
            )}
            <div className="flex gap-2 ml-auto">
              <button
                type="button"
                onClick={props.onClose}
                className="px-4 py-2.5 rounded-xl text-sm bg-elevated text-fg hover:opacity-80 transition-opacity border border-divider"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={laden}
                className="px-5 py-2.5 rounded-xl text-sm bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-medium transition-colors"
              >
                {laden ? "..." : props.modus === "erstellen" ? "Erstellen" : "Speichern"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
