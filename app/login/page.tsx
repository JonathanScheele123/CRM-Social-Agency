"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import ThemeToggle from "@/components/ThemeToggle";
import LangToggle from "@/components/LangToggle";
import { useT } from "@/lib/i18n";
import WaveBackground from "@/components/WaveBackground";

export default function LoginPage() {
  const t = useT();
  const [email, setEmail] = useState("");
  const [passwort, setPasswort] = useState("");
  const [fehler, setFehler] = useState("");
  const [laden, setLaden] = useState(false);
  const [success, setSuccess] = useState(false);
  const [passwortSichtbar, setPasswortSichtbar] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLaden(true);
    setFehler("");

    const result = await signIn("credentials", {
      email,
      password: passwort,
      redirect: false,
    });

    setLaden(false);

    if (result?.error) {
      setFehler(t.login.fehler);
    } else {
      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 860);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 overflow-hidden">

      <WaveBackground />

      {success && (
        <div
          className="login-screen-flash pointer-events-none fixed inset-0 z-50"
          style={{ background: "var(--surface)" }}
        />
      )}

      {success && (
        <div
          className="login-overlay-pulse pointer-events-none fixed z-40"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "420px",
            height: "420px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(69,70,200,0.45) 0%, rgba(69,70,200,0.15) 45%, transparent 72%)",
          }}
        />
      )}

      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <LangToggle />
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm relative z-10 login-enter">
        <div className="flex justify-center mb-6">
          <img
            src="/logo.png"
            alt="JS Media"
            width={96}
            height={96}
            className={`dark:hidden ${success ? "login-logo-burst" : ""}`}
            style={success ? { position: "relative", zIndex: 45 } : undefined}
          />
          <img
            src="/logo-white.png"
            alt="JS Media"
            width={96}
            height={96}
            className={`hidden dark:block ${success ? "login-logo-burst" : ""}`}
            style={success ? { position: "relative", zIndex: 45 } : undefined}
          />
        </div>

        <div className={success ? "login-form-exit pointer-events-none" : ""}>
          <div className="text-center mb-8">
            <h1 className="text-fg text-2xl font-semibold tracking-tight">{t.login.titel}</h1>
            <p className="text-muted text-sm mt-1">{t.login.untertitel}</p>
          </div>

          <div className="bg-card rounded-2xl border border-divider shadow-sm p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-fg mb-1.5">{t.login.email}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder={t.login.emailPlaceholder}
                  className="w-full bg-elevated border border-divider text-fg rounded-xl px-4 py-3 text-sm placeholder:text-subtle focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-fg mb-1.5">{t.login.passwort}</label>
                <div className="relative">
                  <input
                    type={passwortSichtbar ? "text" : "password"}
                    value={passwort}
                    onChange={(e) => setPasswort(e.target.value)}
                    required
                    placeholder={t.login.passwortPlaceholder}
                    className="w-full bg-elevated border border-divider text-fg rounded-xl px-4 py-3 pr-11 text-sm placeholder:text-subtle focus:outline-none focus:border-accent transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setPasswortSichtbar(!passwortSichtbar)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-muted transition-colors"
                    tabIndex={-1}
                  >
                    {passwortSichtbar ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {fehler && (
                <p className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2">
                  {fehler}
                </p>
              )}

              <button
                type="submit"
                disabled={laden || success}
                className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl py-3 text-sm transition-colors"
              >
                {laden ? t.login.anmeldet : t.login.anmelden}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
