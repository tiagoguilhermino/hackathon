/** Horário de Brasília fixo (sem horário de verão desde 2019), em ISO: o registro mostra a hora do evento. */
export function nowBrasilia(): string {
  return new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString().replace("Z", "-03:00");
}

/** "2026-09-27T10:15:00.000-03:00" → "27/09 10:15" */
export function formatBrasilia(iso: string): string {
  const [date, time] = iso.split("T");
  const [, month, day] = date.split("-");
  return `${day}/${month} ${time.slice(0, 5)}`;
}

/** Baixa um objeto como arquivo JSON (o registro local fica só neste navegador). */
export function downloadJson(fileName: string, data: unknown): void {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
