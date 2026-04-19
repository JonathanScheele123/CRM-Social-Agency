import { auth } from "@/auth";
import { redirect } from "next/navigation";
import KundenprofilForm from "@/components/admin/KundenprofilForm";

export default async function NeuerKundePage() {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") redirect("/dashboard");

  return <KundenprofilForm modus="erstellen" />;
}
