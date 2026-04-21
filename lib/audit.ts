import { prisma } from "@/lib/prisma";

type AuditParams = {
  aktion: "exportiert" | "anonymisiert" | "geloescht" | "geaendert" | "zugegriffen";
  entitaetId: string;
  entitaet?: string;
  benutzerEmail?: string | null;
  details?: string;
};

export async function logAudit(params: AuditParams) {
  try {
    await prisma.auditLog.create({
      data: {
        aktion: params.aktion,
        entitaet: params.entitaet ?? "Kundenprofil",
        entitaetId: params.entitaetId,
        benutzerEmail: params.benutzerEmail ?? null,
        details: params.details ?? null,
      },
    });
  } catch {
    // Audit must never crash the caller
  }
}
