// Make a (database-provided) brand colour readable behind/as text on white.
// Darkens the colour just enough to reach WCAG AA contrast (4.5:1) with white;
// colours that already pass are returned unchanged.
const lum = (r, g, b) => {
  const f = (c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};

export function readable(color, fallback = "#006DA8", min = 4.5) {
  const m = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i.exec(String(color || "").trim());
  if (!m) return color || fallback;
  let hex = m[1];
  if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
  let [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  for (let i = 0; i < 40 && 1.05 / (lum(r, g, b) + 0.05) < min; i++) {
    r = Math.round(r * 0.94);
    g = Math.round(g * 0.94);
    b = Math.round(b * 0.94);
  }
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}
