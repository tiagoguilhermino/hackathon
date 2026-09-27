"use client";

import dynamic from "next/dynamic";

// Os resultados vivem no localStorage do navegador: renderiza só no cliente.
const DashboardView = dynamic(() => import("@/components/dashboard/DashboardView").then((m) => m.DashboardView), {
  ssr: false,
  loading: () => <div className="p-8 text-sm text-neutral-500">Carregando relatório…</div>,
});

export default function DashboardPage() {
  return <DashboardView />;
}
