import type { Estatisticas, Simulacao } from "@/lib/tipos";
import { formatarPercentual, formatarSegundos } from "@/lib/uteis";

function Indicador({ rotulo, valor, nota }: { rotulo: string; valor: string; nota?: string }) {
  return (
    <div className="rounded-2xl border border-borda bg-cartao p-4">
      <p className="text-xs text-texto-suave">{rotulo}</p>
      <p className="mt-1 text-2xl font-semibold text-azul">{valor}</p>
      {nota && <p className="mt-0.5 text-[11px] text-texto-suave">{nota}</p>}
    </div>
  );
}

/** Um número em destaque (taxa de conclusão) e os indicadores de apoio. */
export function Indicadores({ est, sim }: { est: Estatisticas; sim: Simulacao }) {
  return (
    <section className="grid gap-3 md:grid-cols-[1.4fr_repeat(4,1fr)]">
      <div className="rounded-2xl border border-borda bg-cartao p-4">
        <p className="text-xs text-texto-suave">Concluíram a tarefa</p>
        <p className="mt-1 text-5xl font-semibold text-azul">{formatarPercentual(est.taxa_sucesso)}</p>
        <p className="mt-1 text-xs text-texto-suave">
          {est.sucessos} de {est.total} agentes · métrica principal
        </p>
      </div>
      <Indicador rotulo="Tempo médio para concluir" valor={formatarSegundos(est.tempo_medio_s)} nota="tempo simulado, não medido" />
      <Indicador rotulo="Desistiram" valor={String(est.desfechos.abandono)} />
      <Indicador rotulo="Chegaram ao fim do jeito errado" valor={String(est.desfechos.falha_tarefa + est.desfechos.limite_passos)} />
      <Indicador
        rotulo="Respostas inválidas do agente"
        valor={String(est.respostas_invalidas)}
        nota={`${est.erros_agente} agentes fora da conta · modelo ${sim.modelo}`}
      />
    </section>
  );
}
