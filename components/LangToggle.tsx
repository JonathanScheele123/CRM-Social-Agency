"use client";

import { useLang } from "@/lib/i18n";

export default function LangToggle({ className }: { className?: string }) {
  const { lang, setLang } = useLang();
  return (
    <button
      onClick={() => setLang(lang === "de" ? "en" : "de")}
      className={`text-xs font-medium px-2.5 py-1 rounded-lg border border-divider bg-elevated text-muted hover:text-fg transition-colors ${className ?? ""}`}
      title={lang === "de" ? "Switch to English" : "Zu Deutsch wechseln"}
    >
      {lang === "de" ? "EN" : "DE"}
    </button>
  );
}
