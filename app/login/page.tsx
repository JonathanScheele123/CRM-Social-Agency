"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useT } from "@/lib/i18n";

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
    <div
      className="dark min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "#100e0b" }}
    >
      {/* ── Blueprint grid ─────────────────────────────────── */}
      <div className="hero-blueprint" />

      {/* ── Vignette ───────────────────────────────────────── */}
      <div className="hero-vignette" />

      {/* ── Gold orbs ──────────────────────────────────────── */}
      <div className="hero-orb-a" />
      <div className="hero-orb-b" />

      {/* ── Left vertical gold bar ─────────────────────────── */}
      <div className="hero-vbar" />

      {/* ── Success flash ──────────────────────────────────── */}
      {success && (
        <div
          className="login-screen-flash pointer-events-none fixed inset-0 z-50"
          style={{ background: "#100e0b" }}
        />
      )}
      {success && (
        <div
          className="login-overlay-pulse pointer-events-none fixed z-40"
          style={{
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: "420px", height: "420px", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(184,149,106,0.45) 0%, rgba(184,149,106,0.15) 45%, transparent 72%)",
          }}
        />
      )}

      {/* ── Login card ─────────────────────────────────────── */}
      <div className="w-full max-w-sm relative z-10 px-4">

        {/* Logo */}
        <div className="flex justify-center mb-5 anim-fade-up">
          <img
            src="/logo-white.png"
            alt="JS Media"
            width={72}
            height={72}
            className={success ? "login-logo-burst" : ""}
            style={success ? { position: "relative", zIndex: 45 } : undefined}
          />
        </div>

        {/* Eyebrow */}
        <div className="flex items-center justify-center gap-3 mb-4 anim-fade-up-1">
          <span
            style={{
              display: "block", width: "24px", height: "1px",
              background: "#b8956a",
              animation: "line-grow 0.8s 0.3s both",
            }}
          />
          <span
            style={{
              fontSize: "0.62rem", letterSpacing: "0.20em",
              textTransform: "uppercase", color: "#b8956a", opacity: 0.75,
            }}
          >
            Social Media Agentur
          </span>
          <span
            style={{
              display: "block", width: "24px", height: "1px",
              background: "#b8956a",
              animation: "line-grow 0.8s 0.3s both",
            }}
          />
        </div>

        <div className={success ? "login-form-exit pointer-events-none" : ""}>
          {/* Heading */}
          <div className="text-center mb-6 anim-fade-up-2">
            <h1
              style={{
                fontFamily: "var(--font-playfair), 'Playfair Display', serif",
                fontSize: "clamp(2rem, 5vw, 2.8rem)",
                fontWeight: 700, fontStyle: "italic",
                color: "#f6f4f1", lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              {t.login.titel}
            </h1>
            <p
              style={{
                marginTop: "0.5rem", fontSize: "0.82rem",
                color: "rgba(246,244,241,0.38)",
                letterSpacing: "0.04em",
              }}
            >
              {t.login.untertitel}
            </p>
          </div>

          {/* Form card */}
          <div
            className="anim-fade-up-3"
            style={{
              background: "rgba(26,22,18,0.72)",
              backdropFilter: "blur(28px) saturate(150%)",
              WebkitBackdropFilter: "blur(28px) saturate(150%)",
              border: "1px solid rgba(184,149,106,0.20)",
              borderRadius: "4px",
              boxShadow: "inset 0 1px 0 rgba(184,149,106,0.10), 0 8px 40px rgba(0,0,0,0.40)",
              padding: "1.75rem",
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  style={{
                    display: "block", fontSize: "0.72rem",
                    fontWeight: 500, letterSpacing: "0.10em",
                    textTransform: "uppercase",
                    color: "rgba(246,244,241,0.45)",
                    marginBottom: "0.5rem",
                  }}
                >
                  {t.login.email}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder={t.login.emailPlaceholder}
                  style={{
                    width: "100%",
                    background: "rgba(16,14,11,0.60)",
                    border: "1px solid rgba(184,149,106,0.18)",
                    color: "#f6f4f1",
                    borderRadius: "2px",
                    padding: "0.75rem 1rem",
                    fontSize: "0.9rem",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={e => (e.target.style.borderColor = "rgba(184,149,106,0.55)")}
                  onBlur={e => (e.target.style.borderColor = "rgba(184,149,106,0.18)")}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block", fontSize: "0.72rem",
                    fontWeight: 500, letterSpacing: "0.10em",
                    textTransform: "uppercase",
                    color: "rgba(246,244,241,0.45)",
                    marginBottom: "0.5rem",
                  }}
                >
                  {t.login.passwort}
                </label>
                <div className="relative">
                  <input
                    type={passwortSichtbar ? "text" : "password"}
                    value={passwort}
                    onChange={(e) => setPasswort(e.target.value)}
                    required
                    placeholder={t.login.passwortPlaceholder}
                    style={{
                      width: "100%",
                      background: "rgba(16,14,11,0.60)",
                      border: "1px solid rgba(184,149,106,0.18)",
                      color: "#f6f4f1",
                      borderRadius: "2px",
                      padding: "0.75rem 2.8rem 0.75rem 1rem",
                      fontSize: "0.9rem",
                      outline: "none",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={e => (e.target.style.borderColor = "rgba(184,149,106,0.55)")}
                    onBlur={e => (e.target.style.borderColor = "rgba(184,149,106,0.18)")}
                  />
                  <button
                    type="button"
                    onClick={() => setPasswortSichtbar(!passwortSichtbar)}
                    tabIndex={-1}
                    style={{
                      position: "absolute", right: "0.75rem", top: "50%",
                      transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer",
                      color: "rgba(246,244,241,0.28)", padding: 0,
                    }}
                  >
                    {passwortSichtbar ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {fehler && (
                <p
                  style={{
                    fontSize: "0.82rem",
                    color: "#f87171",
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.20)",
                    borderRadius: "2px",
                    padding: "0.6rem 0.85rem",
                  }}
                >
                  {fehler}
                </p>
              )}

              <button
                type="submit"
                disabled={laden || success}
                style={{
                  width: "100%",
                  background: laden || success ? "rgba(184,149,106,0.45)" : "#b8956a",
                  color: "#fff",
                  border: "none",
                  borderRadius: "2px",
                  padding: "0.85rem",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  cursor: laden || success ? "not-allowed" : "pointer",
                  transition: "background 0.2s, transform 0.15s, box-shadow 0.15s",
                  marginTop: "0.5rem",
                }}
                onMouseEnter={e => {
                  if (!laden && !success) {
                    (e.target as HTMLButtonElement).style.background = "#7a5c38";
                    (e.target as HTMLButtonElement).style.transform = "translateY(-1px)";
                    (e.target as HTMLButtonElement).style.boxShadow = "0 8px 24px rgba(184,149,106,0.28)";
                  }
                }}
                onMouseLeave={e => {
                  (e.target as HTMLButtonElement).style.background = laden || success ? "rgba(184,149,106,0.45)" : "#b8956a";
                  (e.target as HTMLButtonElement).style.transform = "none";
                  (e.target as HTMLButtonElement).style.boxShadow = "none";
                }}
              >
                {laden ? t.login.anmeldet : t.login.anmelden}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── Bottom ruler bar ───────────────────────────────── */}
      <div
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          height: "42px", zIndex: 2,
          display: "flex", alignItems: "center", padding: "0 8vw",
          borderTop: "1px solid rgba(184,149,106,0.10)",
          background: "rgba(12,10,8,0.60)",
          backdropFilter: "blur(8px)",
        }}
      >
        <span
          style={{
            fontSize: "0.55rem", letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "rgba(184,149,106,0.30)",
          }}
        >
          JS Media · Social Media Agentur
        </span>
        <div style={{ flex: 1 }} />
        <span
          style={{
            fontSize: "0.55rem", letterSpacing: "0.12em",
            color: "rgba(184,149,106,0.20)",
          }}
        >
          {new Date().getFullYear()}
        </span>
      </div>
    </div>
  );
}
