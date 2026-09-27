/** Pequenos utilitários do navegador. */

export function baixarJson(nomeArquivo: string, dados: unknown): void {
  const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  a.click();
  URL.revokeObjectURL(url);
}

/** Horário de Brasília fixo (sem horário de verão desde 2019), no formato ISO. */
export function agoraBrasilia(): string {
  const agora = new Date(Date.now() - 3 * 60 * 60 * 1000);
  return agora.toISOString().replace("Z", "-03:00");
}

export function formatarPercentual(valor: number): string {
  return `${Math.round(valor * 100)}%`;
}

export function formatarSegundos(valor: number | null): string {
  if (valor === null) return "—";
  const s = Math.round(valor);
  return s >= 60 ? `${Math.floor(s / 60)} min ${s % 60} s` : `${s} s`;
}
