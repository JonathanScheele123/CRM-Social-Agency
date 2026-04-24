import worker from "./.open-next/worker.js";

const CRON_ROUTES = [
  "/api/cron/content-strategie-mail",
  "/api/cron/feedback-email",
  "/api/cron/drive-archivieren",
  "/api/cron/drehtag-erinnerung",
];

async function runCronRoute(route, env) {
  const secret = env?.CRON_SECRET ?? "";
  try {
    const res = await fetch(`https://crm.jonathanscheele.de${route}`, {
      headers: { authorization: `Bearer ${secret}` },
    });
    console.log(`[cron] ${route} → ${res.status}`);
  } catch (e) {
    console.error(`[cron] ${route} fehlgeschlagen:`, e?.message ?? e);
  }
}

export default {
  ...worker,
  async scheduled(event, env, ctx) {
    for (const route of CRON_ROUTES) {
      ctx.waitUntil(runCronRoute(route, env));
    }
  },
};
