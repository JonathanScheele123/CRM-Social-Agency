import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EmailVorlagenVerwaltung from "@/components/admin/EmailVorlagenVerwaltung";
import MeinKontoForm from "@/components/admin/MeinKontoForm";

export const metadata = { title: "Einstellungen – Admin" };

export default async function EinstellungenPage() {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") redirect("/dashboard");

  const [vorlagen, adminUser] = await Promise.all([
    prisma.emailVorlage.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true },
    }),
  ]);

  return (
    <div className="min-h-screen text-fg">
      <header className="sticky top-0 z-10 border-b border-divider px-6 py-4 flex items-center gap-3 glass-bar">
        <a href="/dashboard" className="text-muted hover:text-fg transition-colors text-sm">← Dashboard</a>
        <span className="text-muted">/</span>
        <span className="text-sm font-medium text-fg">Einstellungen</span>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-8 space-y-10">

        {/* Mein Konto */}
        <section>
          <div className="mb-4">
            <h2 className="text-base font-semibold text-fg">Mein Konto</h2>
            <p className="text-sm text-muted mt-0.5">Name, E-Mail-Adresse und Passwort deines Admin-Accounts.</p>
          </div>
          <div className="glass-modal rounded-2xl p-6 shadow-sm">
            <MeinKontoForm
              initialName={adminUser?.name ?? null}
              initialEmail={adminUser?.email ?? ""}
            />
          </div>
        </section>

        {/* E-Mail-Vorlagen */}
        <section>
          <div className="mb-4">
            <h2 className="text-base font-semibold text-fg">E-Mail-Vorlagen</h2>
            <p className="text-sm text-muted mt-0.5">Vorlagen für ausgehende E-Mails an Kunden.</p>
          </div>
          <EmailVorlagenVerwaltung vorlagen={vorlagen} />
        </section>

      </main>
    </div>
  );
}
