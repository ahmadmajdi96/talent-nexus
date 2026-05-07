import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Wand2, Loader2, Copy, Check, Briefcase, Shield, Users2, BarChart3 } from "lucide-react";
import cortaLogo from "@/assets/corta-logo.png";

export const Route = createFileRoute("/showcase")({
  head: () => ({
    meta: [
      { title: "CORTA Acquisition — AI Showcase" },
      { name: "description", content: "AI-powered job description generator and showcase for CORTA Acquisition." },
      { property: "og:title", content: "CORTA Acquisition — AI Showcase" },
      { property: "og:description", content: "Generate hiring-ready job descriptions with AI." },
    ],
  }),
  component: ShowcasePage,
});

const PRESETS = [
  { role: "Senior Backend Engineer", level: "Senior", dept: "Engineering" },
  { role: "Product Designer", level: "Mid", dept: "Design" },
  { role: "Talent Partner", level: "Lead", dept: "People" },
];

function ShowcasePage() {
  const [role, setRole] = useState("Senior Backend Engineer");
  const [level, setLevel] = useState("Senior");
  const [dept, setDept] = useState("Engineering");
  const [skills, setSkills] = useState("Node.js, PostgreSQL, AWS, distributed systems");
  const [tone, setTone] = useState<"professional" | "inclusive" | "bold">("inclusive");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setLoading(true); setError(null); setOutput("");
    try {
      const resp = await fetch("/api/public/ai/generate-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, level, dept, skills, tone }),
      });
      if (!resp.ok || !resp.body) {
        const t = await resp.text().catch(() => "");
        throw new Error(t || `Request failed (${resp.status})`);
      }
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let i: number;
        while ((i = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, i); buf = buf.slice(i + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const j = line.slice(6).trim();
          if (j === "[DONE]") { buf = ""; break; }
          try {
            const p = JSON.parse(j);
            const c = p.choices?.[0]?.delta?.content;
            if (c) { acc += c; setOutput(acc); }
          } catch { buf = line + "\n" + buf; break; }
        }
      }
    } catch (e: any) {
      setError(e.message || "Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-[hsl(220_20%_7%)] text-[hsl(210_20%_90%)]" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Background grid */}
      <div className="fixed inset-0 pointer-events-none opacity-30"
        style={{ backgroundImage: "linear-gradient(hsl(220 14% 18% / 0.4) 1px, transparent 1px),linear-gradient(90deg, hsl(220 14% 18% / 0.4) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      <div className="fixed inset-x-0 top-0 h-[600px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210 100% 56% / 0.18), transparent)" }} />

      {/* Nav */}
      <nav className="relative z-10 border-b border-[hsl(220_14%_18%)] bg-[hsl(220_20%_7%)]/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <img src={cortaLogo} alt="CORTA" className="h-8 w-auto" />
            <span className="font-bold tracking-tight">CORTA Acquisition</span>
            <span className="text-[10px] uppercase tracking-widest text-[hsl(215_12%_50%)] hidden sm:inline">AI Showcase</span>
          </a>
          <a href="/requisitions" className="text-sm text-[hsl(215_12%_60%)] hover:text-white transition">← Back to app</a>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        {/* Hero */}
        <section className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[hsl(220_14%_18%)] bg-[hsl(220_18%_10%)]/60 backdrop-blur mb-8">
            <span className="relative inline-block w-2.5 h-2.5 rounded-full bg-[hsl(142_71%_45%)]">
              <span className="absolute inset-0 rounded-full animate-ping bg-[hsl(142_71%_45%)] opacity-40" />
            </span>
            <span className="text-xs font-medium text-[hsl(215_12%_60%)]">Powered by Lovable AI · Streaming</span>
          </div>
          <div className="flex justify-center mb-6">
            <img src={cortaLogo} alt="CORTA" className="h-20 w-auto" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, hsl(210 100% 56%), hsl(142 71% 45%))" }}>
              AI Job Descriptions
            </span>
            <br />
            <span>in Seconds</span>
          </h1>
          <p className="text-lg md:text-xl text-[hsl(215_12%_60%)] max-w-3xl mx-auto leading-relaxed">
            Generate inclusive, role-specific descriptions for any requisition.
            Built into CORTA Acquisition and ready for the People Hub handoff.
          </p>
        </section>

        {/* AI Generator */}
        <section className="grid lg:grid-cols-5 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 bg-[hsl(220_18%_10%)] border border-[hsl(220_14%_18%)] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <Wand2 className="h-4 w-4 text-[hsl(210_100%_56%)]" />
              <h2 className="font-semibold">Compose</h2>
            </div>

            <div className="space-y-4">
              <Field label="Role title">
                <input value={role} onChange={e => setRole(e.target.value)} className={inputCls} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Level">
                  <select value={level} onChange={e => setLevel(e.target.value)} className={inputCls}>
                    {["Junior","Mid","Senior","Lead","Principal","Director"].map(l => <option key={l}>{l}</option>)}
                  </select>
                </Field>
                <Field label="Department">
                  <input value={dept} onChange={e => setDept(e.target.value)} className={inputCls} />
                </Field>
              </div>
              <Field label="Key skills (comma-separated)">
                <textarea value={skills} onChange={e => setSkills(e.target.value)} rows={3} className={inputCls} />
              </Field>
              <Field label="Tone">
                <div className="grid grid-cols-3 gap-2">
                  {(["professional","inclusive","bold"] as const).map(t => (
                    <button key={t} onClick={() => setTone(t)}
                      className={`px-3 py-2 rounded-md text-xs font-medium border transition ${tone===t ? "border-[hsl(210_100%_56%)] bg-[hsl(210_100%_56%)]/15 text-white" : "border-[hsl(220_14%_18%)] text-[hsl(215_12%_60%)] hover:text-white"}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </Field>

              <div>
                <div className="text-[10px] uppercase tracking-widest text-[hsl(215_12%_50%)] mb-2">Quick presets</div>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map(p => (
                    <button key={p.role} onClick={() => { setRole(p.role); setLevel(p.level); setDept(p.dept); }}
                      className="text-xs px-3 py-1.5 rounded-full border border-[hsl(220_14%_18%)] hover:border-[hsl(210_100%_56%)]/50 transition">
                      {p.role}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={generate} disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-lg font-semibold text-[hsl(220_20%_7%)] disabled:opacity-60"
                style={{ backgroundImage: "linear-gradient(135deg, hsl(210 100% 56%), hsl(142 71% 45%))" }}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {loading ? "Generating…" : "Generate with AI"}
              </button>
              {error && <div className="text-xs text-[hsl(0_84%_60%)]">{error}</div>}
            </div>
          </div>

          {/* Output */}
          <div className="lg:col-span-3 bg-[hsl(220_18%_10%)] border border-[hsl(220_14%_18%)] rounded-xl p-6 min-h-[480px] relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[hsl(142_71%_45%)]" />
                <h2 className="font-semibold">AI Description</h2>
              </div>
              {output && (
                <button onClick={copy} className="text-xs inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[hsl(220_14%_18%)] hover:border-[hsl(210_100%_56%)]/50">
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              )}
            </div>

            {!output && !loading && (
              <div className="h-full flex items-center justify-center text-center text-sm text-[hsl(215_12%_50%)] py-20">
                <div>
                  <Wand2 className="h-8 w-8 mx-auto mb-3 opacity-50" />
                  Fill in the form and click Generate.<br />Output streams here in real time.
                </div>
              </div>
            )}

            {(output || loading) && (
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-[hsl(210_20%_88%)]">{output}{loading && <span className="inline-block w-2 h-4 ml-0.5 bg-[hsl(210_100%_56%)] animate-pulse align-middle" />}</pre>
            )}
          </div>
        </section>

        {/* Feature cards */}
        <section className="grid md:grid-cols-4 gap-4 mt-16">
          {[
            { icon: Briefcase, title: "Requisition-aware", desc: "Pulls role, level and skills from your live reqs." },
            { icon: Users2, title: "Inclusive language", desc: "Bias-checked phrasing tuned for diverse pipelines." },
            { icon: Shield, title: "Compliance-ready", desc: "EEO-friendly disclaimers and accessibility notes." },
            { icon: BarChart3, title: "People Hub sync", desc: "One click to publish via the public outcome API." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-[hsl(220_18%_10%)] border border-[hsl(220_14%_18%)] rounded-xl p-5 transition hover:border-[hsl(210_100%_56%)]/40">
              <Icon className="h-5 w-5 text-[hsl(210_100%_56%)] mb-3" />
              <div className="font-semibold mb-1">{title}</div>
              <div className="text-xs text-[hsl(215_12%_55%)] leading-relaxed">{desc}</div>
            </div>
          ))}
        </section>

        <footer className="mt-20 pt-8 border-t border-[hsl(220_14%_18%)] text-xs text-[hsl(215_12%_50%)] flex justify-between flex-wrap gap-2">
          <div>© CORTA Acquisition · Talent Acquisition Suite</div>
          <div>Showcase page · AI streamed via Lovable AI Gateway</div>
        </footer>
      </main>
    </div>
  );
}

const inputCls = "w-full bg-[hsl(220_20%_7%)] border border-[hsl(220_14%_18%)] rounded-md px-3 py-2 text-sm text-white placeholder:text-[hsl(215_12%_40%)] focus:outline-none focus:border-[hsl(210_100%_56%)]/60";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[10px] uppercase tracking-widest text-[hsl(215_12%_50%)] mb-1.5">{label}</div>
      {children}
    </label>
  );
}
