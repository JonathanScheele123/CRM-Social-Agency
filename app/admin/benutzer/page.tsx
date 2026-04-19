import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BenutzerVerwaltung from "@/components/admin/BenutzerVerwaltung";

export default async function BenutzerPage() {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") redirect("/dashboard");

  const benutzer = await prisma.user.findMany({
    where: { rolle: "KUNDE" },
    orderBy: { createdAt: "desc" },
    include: {
      zugriffe: {
        include: {
          kundenprofil: {
            select: { id: true, unternehmensname: true },
          },
        },
      },
    },
  });

  const alleKunden = await prisma.kundenprofil.findMany({
    orderBy: { kundenNr: "asc" },
    select: { id: true, unternehmensname: true, kundenNr: true },
  });

  return <BenutzerVerwaltung benutzer={benutzer} alleKunden={alleKunden} />;
}
