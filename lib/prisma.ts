import { PrismaClient } from "prisma-wasm-edge";
import { PrismaNeonHTTP } from "@prisma/adapter-neon";

// PrismaNeonHTTP is stateless HTTP — creating a fresh instance per request
// is safe and avoids cross-request promise contamination in Cloudflare Workers.
export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    const adapter = new PrismaNeonHTTP(process.env.DATABASE_URL!, {});
    const client = new PrismaClient({ adapter });
    return (client as unknown as Record<string | symbol, unknown>)[prop as string | symbol];
  },
});
