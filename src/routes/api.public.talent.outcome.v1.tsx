import { createFileRoute } from "@tanstack/react-router";
import { getPeopleHubOutcomes } from "@/lib/people-hub-feed";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

export const Route = createFileRoute("/api/public/talent/outcome/v1")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const kind = url.searchParams.get("kind");
        const limit = Math.min(Number(url.searchParams.get("limit") ?? 100), 500);
        const origin = `${url.protocol}//${url.host}`;
        const items = getPeopleHubOutcomes()
          .filter(o => !kind || o.kind === kind)
          .slice(0, limit)
          .map(o => ({
            ...o,
            candidateUrl: o.candidateUrl?.startsWith("http") ? o.candidateUrl : `${origin}${o.candidateUrl}`,
            requisitionUrl: o.requisitionUrl?.startsWith("http") ? o.requisitionUrl : `${origin}${o.requisitionUrl}`,
          }));
        const body = {
          version: "talent.outcome.v1",
          source: "HireFlow",
          generatedAt: new Date().toISOString(),
          count: items.length,
          items,
        };
        return new Response(JSON.stringify(body), {
          status: 200,
          headers: { "Content-Type": "application/json", ...CORS },
        });
      },
    },
  },
});
