const colors = ["243 75% 58%", "174 72% 42%", "265 80% 62%", "35 95% 55%", "210 92% 56%", "158 64% 42%", "0 78% 58%", "285 75% 60%"];
export function colorFor(seed: string) {
  let h = 0; for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return colors[h % colors.length];
}
export function initialsFrom(name: string) {
  return name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();
}
export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const color = colorFor(name);
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-semibold shrink-0 shadow-sm"
      style={{ width: size, height: size, fontSize: size * 0.38, background: `linear-gradient(135deg, hsl(${color}), hsl(${color} / 0.7))` }}
      title={name}
    >
      {initialsFrom(name)}
    </div>
  );
}
