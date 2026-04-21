type Params = {
  nachricht: string;
  fehlerCode?: string;
  kontext?: string;
  benutzerTyp?: "Admin" | "Kunde";
};

export function logFehlerClient(params: Params) {
  const url = typeof window !== "undefined" ? window.location.pathname : undefined;
  fetch("/api/fehlerlog", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...params, url }),
  }).catch(() => {});
}
