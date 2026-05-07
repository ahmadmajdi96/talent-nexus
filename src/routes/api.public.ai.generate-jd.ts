import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/ai/generate-jd")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { headers: cors() }),
      POST: async ({ request }) => {
        try {
          const { role, level, dept, skills, tone } = await request.json();
          const apiKey = process.env.LOVABLE_API_KEY;
          if (!apiKey) {
            return json({ error: "AI not configured" }, 500);
          }
          const system = `You are an expert technical recruiter writing inclusive, compliant job descriptions for CORTA Acquisition. Output Markdown with these sections in order: # {Role Title}, ## About the Role, ## What You'll Do (5-7 bullets), ## What You'll Bring (5-7 bullets), ## Nice to Have (3-5 bullets), ## What We Offer (4-6 bullets), ## Equal Opportunity. Keep ${tone || "inclusive"} tone. Avoid biased language.`;
          const user = `Role: ${role}\nLevel: ${level}\nDepartment: ${dept}\nKey skills: ${skills}`;

          const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              stream: true,
              messages: [
                { role: "system", content: system },
                { role: "user", content: user },
              ],
            }),
          });

          if (!upstream.ok) {
            const t = await upstream.text();
            if (upstream.status === 429) return json({ error: "Rate limit exceeded — try again soon." }, 429);
            if (upstream.status === 402) return json({ error: "AI credits exhausted." }, 402);
            return json({ error: `AI gateway error: ${t.slice(0, 200)}` }, 500);
          }

          return new Response(upstream.body, {
            headers: { ...cors(), "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
          });
        } catch (e: any) {
          return json({ error: e?.message || "Unknown error" }, 500);
        }
      },
    },
  },
});

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  } as Record<string, string>;
}
function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), { status, headers: { ...cors(), "Content-Type": "application/json" } });
}
