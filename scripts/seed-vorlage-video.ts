import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as never);

async function main() {
  const html = fs.readFileSync(path.join(__dirname, "../public/email-editorial-video.html"), "utf-8");

  const vorlage = await (prisma as never as {
    emailVorlage: { create: (args: unknown) => Promise<{ id: string }> }
  }).emailVorlage.create({
    data: {
      name: "Editorial, Freitext mit Video",
      beschreibung: "Weiße E-Mail mit cinematischem Videofeld, animiertem Play-Button und Freitext-Bereichen",
      betreff: "Betreff der E-Mail",
      html,
    },
  });

  console.log("✓ Gespeichert:", vorlage.id);
  await (prisma as never as { $disconnect: () => Promise<void> }).$disconnect();
}

main();
