"use client";

import { useEffect } from "react";
import { logFehlerClient } from "@/lib/fehlerlog-client";

export default function GlobalErrorTracker() {
  useEffect(() => {
    function onError(e: ErrorEvent) {
      logFehlerClient({
        nachricht: e.message || "JavaScript-Fehler",
        fehlerCode: "JS_ERROR",
        kontext: `${e.filename ?? ""}:${e.lineno ?? 0}`,
      });
    }

    function onUnhandledRejection(e: PromiseRejectionEvent) {
      const msg =
        e.reason instanceof Error
          ? e.reason.message
          : String(e.reason ?? "Unbekannte Promise-Rejection");
      logFehlerClient({
        nachricht: msg,
        fehlerCode: "PROMISE_REJECTION",
        kontext: "unhandledrejection",
      });
    }

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  return null;
}
