"use client";

import { useEffect, useState } from "react";

const KEY = "bg_animated";

export default function BgToggle() {
  const [aktiv, setAktiv] = useState(true);

  useEffect(() => {
    const gespeichert = localStorage.getItem(KEY);
    const an = gespeichert === null ? true : gespeichert === "1";
    setAktiv(an);
    document.documentElement.classList.toggle("bg-animated", an);
  }, []);

  function toggle() {
    const neuerWert = !aktiv;
    setAktiv(neuerWert);
    localStorage.setItem(KEY, neuerWert ? "1" : "0");
    document.documentElement.classList.toggle("bg-animated", neuerWert);
  }

  return (
    <button
      onClick={toggle}
      title={aktiv ? "Hintergrundanimation deaktivieren" : "Hintergrundanimation aktivieren"}
      className="fixed bottom-4 left-4 z-50 w-7 h-7 flex items-center justify-center rounded-full bg-card/60 border border-divider text-muted hover:text-fg hover:bg-elevated/80 transition-all opacity-40 hover:opacity-100 backdrop-blur-sm"
      style={{ fontSize: "11px" }}
    >
      {aktiv ? "◉" : "○"}
    </button>
  );
}
