"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

// ─── Sunrise/sunset (NOAA) ────────────────────────────────────────────────────

function getSunTimes(lat: number, lng: number, date: Date): { sunrise: Date; sunset: Date } {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;
  const toJD = (d: Date) => d.getTime() / 86400000 + 2440587.5;
  const fromJD = (jd: number) => new Date((jd - 2440587.5) * 86400000);

  const jd = toJD(date);
  const n = Math.floor(jd - 2451545.0 + 0.5);
  const J_noon = n - lng / 360;
  const M = ((357.5291 + 0.98560028 * J_noon) % 360 + 360) % 360;
  const C =
    1.9148 * Math.sin(toRad(M)) +
    0.02 * Math.sin(toRad(2 * M)) +
    0.0003 * Math.sin(toRad(3 * M));
  const lambda = ((M + C + 180 + 102.9372) % 360 + 360) % 360;
  const J_transit =
    2451545.0 + J_noon + 0.0053 * Math.sin(toRad(M)) - 0.0069 * Math.sin(toRad(2 * lambda));
  const sin_d = Math.sin(toRad(lambda)) * Math.sin(toRad(23.4397));
  const cos_d = Math.cos(Math.asin(sin_d));
  const cos_omega =
    (Math.sin(toRad(-0.833)) - Math.sin(toRad(lat)) * sin_d) /
    (Math.cos(toRad(lat)) * cos_d);

  if (Math.abs(cos_omega) > 1) {
    const alwaysDay = cos_omega < -1;
    return {
      sunrise: alwaysDay ? new Date(0) : new Date(8640000000000000),
      sunset: alwaysDay ? new Date(8640000000000000) : new Date(0),
    };
  }

  const omega = toDeg(Math.acos(cos_omega));
  return {
    sunrise: fromJD(J_transit - omega / 360),
    sunset: fromJD(J_transit + omega / 360),
  };
}

function isDaytime(lat: number, lng: number, now = new Date()): boolean {
  const { sunrise, sunset } = getSunTimes(lat, lng, now);
  return now >= sunrise && now <= sunset;
}

function msUntilNext(lat: number, lng: number, now = new Date()): number {
  const { sunrise, sunset } = getSunTimes(lat, lng, now);
  const day = isDaytime(lat, lng, now);
  const next = day ? sunset : sunrise;
  const diff = next.getTime() - now.getTime();
  if (diff <= 0) {
    const tomorrow = new Date(now.getTime() + 86400000);
    const t = getSunTimes(lat, lng, tomorrow);
    return Math.max((day ? t.sunset : t.sunrise).getTime() - now.getTime(), 60000);
  }
  return diff;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = "theme";

function resolveInitial(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (stored === "light" || stored === "dark") return stored;
  return "dark";
}

function applyTheme(t: Theme) {
  document.documentElement.classList.toggle("dark", t === "dark");
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const initial = resolveInitial();
    setThemeState(initial);
    applyTheme(initial);

    // System-preference listener (only when no stored preference)
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    function onSystem(e: MediaQueryListEvent) {
      if (!localStorage.getItem(STORAGE_KEY)) {
        const t: Theme = e.matches ? "dark" : "light";
        setThemeState(t);
        applyTheme(t);
      }
    }
    mq.addEventListener("change", onSystem);

    // Sunrise/sunset sync
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        function applyAndSchedule() {
          const dark = !isDaytime(pos.coords.latitude, pos.coords.longitude);
          const t: Theme = dark ? "dark" : "light";
          setThemeState(t);
          applyTheme(t);
          localStorage.setItem(STORAGE_KEY, t);
          timerRef.current = setTimeout(applyAndSchedule, msUntilNext(pos.coords.latitude, pos.coords.longitude));
        }
        applyAndSchedule();
      },
      () => {},
      { timeout: 5000 }
    );

    return () => {
      mq.removeEventListener("change", onSystem);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function setTheme(t: Theme) {
    setThemeState(t);
    applyTheme(t);
    localStorage.setItem(STORAGE_KEY, t);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
