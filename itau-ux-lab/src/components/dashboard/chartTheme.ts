/** Tokens de cor dos gráficos (marca Itaú + status reservado para abandono). */
export const CHART = {
  primary: "#1E2A4F",
  accent: "#EC7000",
  critical: "#E34948",
  grid: "#E5E7EB",
  axis: "#6B7280",
  text: "#1E2A4F",
};

export const pct = (v: number) => `${Math.round(v * 100)}%`;

/** Rampa sequencial (uma matiz, claro → escuro) para taxas de erro. */
export function orangeRamp(t: number): string {
  const from = [255, 243, 232];
  const to = [178, 84, 0];
  const c = from.map((f, i) => Math.round(f + (to[i] - f) * Math.min(1, Math.max(0, t))));
  return `rgb(${c.join(",")})`;
}

export const tooltipStyle = {
  contentStyle: { borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12 },
  labelStyle: { color: CHART.text, fontWeight: 600 },
};
