"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputClass =
  "w-full bg-elevated border border-divider text-fg rounded-xl px-4 py-3 text-sm placeholder:text-subtle focus:outline-none focus:border-accent transition-colors";
const labelClass = "block text-sm font-medium text-fg mb-1.5";

export default function NeuesFormularPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [introText, setIntroText] = useState("");
  const [fehler, setFehler] = useState("");
  const [laden, setLaden] = useState(false);

  function handleNameChange(v: string) {
    setName(v);
    if (!slug) {
      setSlug(v.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFehler("");
    setLaden(true);

    const res = await fetch("/api/admin/formulare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, introText }),
    });

    setLaden(false);

    if (res.ok) {
      router.push("/dashboard");
    } else {
      const data = await res.json().catch(() => ({}));
      setFehler(data.fehler || "Ein Fehler ist aufgetreten.");
    }
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => router.back()}
          className="text-muted hover:text-fg text-sm mb-6 flex items-center gap-1 transition-colors"
        >
          ← Zurück
        </button>

        <h1 className="text-fg text-2xl font-semibold tracking-tight mb-8">Neues Formular erstellen</h1>

        <div className="glass-modal rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={labelClass}>Formular-Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="z. B. Stammkunden-Onboarding"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>URL-Slug <span className="text-red-500">*</span></label>
              <div className="flex items-center gap-2">
                <span className="text-subtle text-sm shrink-0">/formular/</span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="mein-formular"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Einleitungstext (optional)</label>
              <textarea
                value={introText}
                onChange={(e) => setIntroText(e.target.value)}
                placeholder="Kurze Beschreibung für den Kunden oben auf dem Formular."
                rows={3}
                className={`${inputClass} resize-none`}
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
              {laden ? "Wird erstellt..." : "Formular erstellen"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
