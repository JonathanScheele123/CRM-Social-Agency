import { prisma } from "@/lib/prisma";

type FehlerLogParams = {
  nachricht: string;
  fehlerCode?: string;
  kontext?: string;
  url?: string;
  benutzerTyp?: "Admin" | "Kunde" | "System";
};

/** Server-side error logger — call from API routes */
export async function logFehler(params: FehlerLogParams) {
  try {
    await prisma.fehlerLog.create({
      data: {
        nachricht: params.nachricht.slice(0, 1000),
        fehlerCode: params.fehlerCode ?? null,
        kontext: params.kontext?.slice(0, 200) ?? null,
        url: params.url?.slice(0, 500) ?? null,
        benutzerTyp: params.benutzerTyp ?? "System",
      },
    });
  } catch {
    // Logging must never crash the caller
  }
}

/** Wraps an async API handler, logs any thrown error automatically */
export function mitFehlerlog<T>(
  fn: () => Promise<T>,
  kontext: string,
  benutzerTyp: FehlerLogParams["benutzerTyp"] = "System"
): Promise<T> {
  return fn().catch(async (err: unknown) => {
    const e = err instanceof Error ? err : new Error(String(err));
    await logFehler({
      nachricht: e.message,
      fehlerCode: (e as NodeJS.ErrnoException).code,
      kontext,
      benutzerTyp,
    });
    throw err;
  });
}
