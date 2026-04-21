import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as never) as never as {
  emailVorlage: {
    deleteMany: (args: unknown) => Promise<{ count: number }>;
    create: (args: unknown) => Promise<{ id: string }>;
  };
  $disconnect: () => Promise<void>;
};

async function main() {
  // Delete old templates
  const deleted = await prisma.emailVorlage.deleteMany({
    where: {
      name: { in: ["Weiß, Freitext mit Button", "Weiß, Freitext"] },
    },
  });
  console.log(`✓ ${deleted.count} alte Vorlage(n) gelöscht`);

  // Insert editorial "mit Button"
  const htmlButton = fs.readFileSync(
    path.join(__dirname, "../public/email-editorial-button.html"),
    "utf-8"
  );
  const v1 = await prisma.emailVorlage.create({
    data: {
      name: "Weiß, Freitext mit Button",
      beschreibung: "Weiße E-Mail mit Logo, Freitext-Bereichen, Hinweisbox und Liquid-Glass-Button",
      betreff: "Betreff der E-Mail",
      html: htmlButton,
    },
  });
  console.log("✓ Gespeichert:", v1.id, "→ Weiß, Freitext mit Button");

  // Insert editorial "ohne Button"
  const html = fs.readFileSync(
    path.join(__dirname, "../public/email-editorial.html"),
    "utf-8"
  );
  const v2 = await prisma.emailVorlage.create({
    data: {
      name: "Weiß, Freitext",
      beschreibung: "Weiße E-Mail mit Logo und Freitext-Bereichen – ohne Button und Hinweisbox",
      betreff: "Betreff der E-Mail",
      html,
    },
  });
  console.log("✓ Gespeichert:", v2.id, "→ Weiß, Freitext");

  await prisma.$disconnect();
}

main();
