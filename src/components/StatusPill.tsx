type Tone = "success" | "warning" | "destructive" | "info" | "muted" | "primary" | "accent";
const map: Record<Tone, string> = {
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/30",
  destructive: "bg-destructive/10 text-destructive border-destructive/20",
  info: "bg-info/10 text-info border-info/20",
  muted: "bg-muted text-muted-foreground border-border",
  primary: "bg-primary/10 text-primary border-primary/20",
  accent: "bg-accent/10 text-accent border-accent/20",
};
export function Pill({ tone = "muted", children }: { tone?: Tone; children: React.ReactNode }) {
  return <span className={`pill ${map[tone]}`}>{children}</span>;
}
