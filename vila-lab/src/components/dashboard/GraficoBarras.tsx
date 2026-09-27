"use client";

import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

/** Cores dos gráficos (paleta de referência validada: CVD ΔE 24,7 e contraste ≥ 3:1 no branco). */
export const COR_GRAFICO = {
  serie1: "#2a78d6",
  serie2: "#eb6834",
  grade: "#e1e0d9",
  eixo: "#c3c2b7",
  textoMudo: "#6f6d67",
  texto: "#1b2233",
} as const;

export interface LinhaGrafico {
  rotulo: string;
  valor: number | null;
  valor2?: number | null;
  detalhe?: string; // ex.: "n = 12"
}

interface Props {
  titulo: string;
  descricao?: string;
  dados: LinhaGrafico[];
  formatar: (v: number) => string;
  maximo?: number;
  nomeSerie1: string;
  nomeSerie2?: string; // presente = duas séries (comparação)
}

interface ItemTooltip {
  dataKey?: string | number;
  value?: number | string | null;
  color?: string;
  payload?: LinhaGrafico;
}

function Dica({ active, payload, formatar, nomes }: { active?: boolean; payload?: ItemTooltip[]; formatar: (v: number) => string; nomes: string[] }) {
  if (!active || !payload?.length) return null;
  const linha = payload[0].payload;
  return (
    <div className="rounded-lg border border-borda bg-cartao px-3 py-2 text-xs shadow-md">
      <p className="mb-1 text-texto-suave">{linha?.rotulo}</p>
      {payload.map((item, i) => (
        <p key={String(item.dataKey)} className="flex items-center gap-2">
          <span aria-hidden className="inline-block h-0.5 w-3" style={{ background: item.color }} />
          <strong className="text-sm text-texto">{typeof item.value === "number" ? formatar(item.value) : "—"}</strong>
          <span className="text-texto-suave">{nomes[i]}</span>
        </p>
      ))}
      {linha?.detalhe && <p className="mt-1 text-texto-suave">{linha.detalhe}</p>}
    </div>
  );
}

/** Barras horizontais finas (≤ 24px), ponta arredondada, valor na ponta, tooltip e tabela. */
export function GraficoBarras({ titulo, descricao, dados, formatar, maximo, nomeSerie1, nomeSerie2 }: Props) {
  const duas = Boolean(nomeSerie2);
  const altura = Math.max(140, dados.length * (duas ? 58 : 40) + 40);
  const rotuloValor = (v: unknown) => (typeof v === "number" ? formatar(v) : "");
  return (
    <figure className="space-y-2 rounded-2xl border border-borda bg-cartao p-4">
      <figcaption>
        <h3 className="text-sm font-bold text-azul">{titulo}</h3>
        {descricao && <p className="text-xs text-texto-suave">{descricao}</p>}
      </figcaption>
      {duas && (
        <ul className="flex flex-wrap gap-4 text-xs text-texto-suave" aria-label="Legenda">
          <li className="flex items-center gap-1.5">
            <span aria-hidden className="size-2.5 rounded-sm" style={{ background: COR_GRAFICO.serie1 }} />
            {nomeSerie1}
          </li>
          <li className="flex items-center gap-1.5">
            <span aria-hidden className="size-2.5 rounded-sm" style={{ background: COR_GRAFICO.serie2 }} />
            {nomeSerie2}
          </li>
        </ul>
      )}
      <div style={{ height: altura }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dados} layout="vertical" margin={{ top: 4, right: 56, bottom: 4, left: 8 }} barGap={2}>
            <CartesianGrid horizontal={false} stroke={COR_GRAFICO.grade} strokeWidth={1} />
            <XAxis
              type="number"
              domain={[0, maximo ?? "auto"]}
              tickFormatter={(v: number) => formatar(v)}
              tick={{ fill: COR_GRAFICO.textoMudo, fontSize: 11 }}
              axisLine={{ stroke: COR_GRAFICO.eixo }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="rotulo"
              width={128}
              tick={{ fill: COR_GRAFICO.texto, fontSize: 12 }}
              axisLine={{ stroke: COR_GRAFICO.eixo }}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(30, 42, 79, 0.06)" }}
              content={<Dica formatar={formatar} nomes={duas ? [nomeSerie1, nomeSerie2!] : [nomeSerie1]} />}
            />
            <Bar dataKey="valor" name={nomeSerie1} fill={COR_GRAFICO.serie1} barSize={duas ? 16 : 20} radius={[0, 4, 4, 0]} isAnimationActive={false}>
              <LabelList dataKey="valor" position="right" formatter={rotuloValor} style={{ fill: COR_GRAFICO.texto, fontSize: 11 }} />
            </Bar>
            {duas && (
              <Bar dataKey="valor2" name={nomeSerie2} fill={COR_GRAFICO.serie2} barSize={16} radius={[0, 4, 4, 0]} isAnimationActive={false}>
                <LabelList dataKey="valor2" position="right" formatter={rotuloValor} style={{ fill: COR_GRAFICO.texto, fontSize: 11 }} />
              </Bar>
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <details className="text-xs">
        <summary className="cursor-pointer font-semibold text-azul">Ver como tabela</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-borda text-texto-suave">
              <th className="py-1 font-semibold">Grupo</th>
              <th className="py-1 font-semibold">{nomeSerie1}</th>
              {duas && <th className="py-1 font-semibold">{nomeSerie2}</th>}
              <th className="py-1 font-semibold">Detalhe</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {dados.map((d) => (
              <tr key={d.rotulo} className="border-b border-borda/60">
                <td className="py-1">{d.rotulo}</td>
                <td className="py-1">{d.valor === null ? "—" : formatar(d.valor)}</td>
                {duas && <td className="py-1">{d.valor2 == null ? "—" : formatar(d.valor2)}</td>}
                <td className="py-1 text-texto-suave">{d.detalhe ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
