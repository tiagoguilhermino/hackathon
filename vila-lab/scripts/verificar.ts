/**
 * Verificação sem navegador nem IA: roda com `npm run verificar`.
 * Confere as regras de cada módulo que não dependem da tela.
 */

import { calcularCargaCognitiva, encontrarJargoes } from "../src/lib/acessibilidade";
import { gerarAchados, sumarioMock } from "../src/lib/agentes/analista";
import { proporMock } from "../src/lib/agentes/designer";
import { navegarMock } from "../src/lib/agentes/politicaMock";
import { promptNavegador } from "../src/lib/agentes/prompts";
import { aplicarAcao, estadoInicial } from "../src/lib/banco/estado";
import { FLUXOS, tarefaConcluida, telaFinal } from "../src/lib/banco/fluxos";
import { calcularEstatisticas } from "../src/lib/estatisticas";
import { distribuirProfissoes, faixaEtaria, gerarBase, PROFISSOES, PROPORCAO_PADRAO } from "../src/lib/personas";
import {
  ABANDONAR,
  type ArvoreAcessibilidade,
  type FluxoId,
  type NoAcessivel,
  type PedidoNavegacao,
  type Persona,
  type ResultadoAgente,
  type Versao,
} from "../src/lib/tipos";

let falhas = 0;
function checar(condicao: boolean, descricao: string): void {
  if (condicao) {
    console.log(`ok     ${descricao}`);
  } else {
    falhas += 1;
    console.log(`FALHA  ${descricao}`);
  }
}

// ---------------------------------------------------------------- Módulo 1: personas
{
  const contagem = distribuirProfissoes(12, { servidor_publico: 2, clt: 1, autonomo: 0, aposentado: 0, estudante: 0 });
  checar(contagem.servidor_publico === 8 && contagem.clt === 4, "2× mais servidores que CLT: 8 e 4 em 12");

  const base = gerarBase({ quantidade: 60, semente: 7, proporcao: { servidor_publico: 2, clt: 1, autonomo: 1, aposentado: 1, estudante: 1 } });
  const porProf = Object.fromEntries(PROFISSOES.map((p) => [p, base.filter((x) => x.cadastral.profissao === p).length]));
  checar(base.length === 60 && porProf.servidor_publico === 20 && porProf.clt === 10, "base de 60 respeita a proporção (20 servidores, 10 CLT)");

  const deNovo = gerarBase({ quantidade: 60, semente: 7, proporcao: { servidor_publico: 2, clt: 1, autonomo: 1, aposentado: 1, estudante: 1 } });
  checar(JSON.stringify(base) === JSON.stringify(deNovo), "mesma semente gera a mesma base");

  checar(new Set(base.map((p) => p.id)).size === 60, "ids únicos");
  checar(
    base.every((p) => p.cadastral.literacia_digital >= 0 && p.cadastral.literacia_digital <= 1),
    "literacia digital entre 0 e 1",
  );
  checar(base.every((p) => p.digital.taxa_rejeicao >= 0 && p.digital.taxa_rejeicao <= 1), "taxa de rejeição entre 0 e 1");

  const media = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;
  const idosos = base.filter((p) => faixaEtaria(p.cadastral.idade) === "60+");
  const jovens = base.filter((p) => faixaEtaria(p.cadastral.idade) === "18–29");
  checar(
    idosos.length > 0 && jovens.length > 0 &&
      media(idosos.map((p) => p.cadastral.literacia_digital)) < media(jovens.map((p) => p.cadastral.literacia_digital)),
    "hipótese de modelagem: 60+ com literacia média menor que 18–29",
  );

  let erro = "";
  try {
    distribuirProfissoes(5, { servidor_publico: 0, clt: 0, autonomo: 0, aposentado: 0, estudante: 0 });
  } catch (e) {
    erro = String(e);
  }
  checar(erro.includes("pelo menos uma profissão"), "proporção toda zerada dá erro claro");
}

// ---------------------------------------------------------------- Módulo 2: MDP do banco
{
  const passos = (fluxo: FluxoId, versao: Versao, acoes: string[]) =>
    acoes.reduce((s, a) => aplicarAcao(s, a), estadoInicial(fluxo, versao));

  const emprestimo = passos("emprestimo", "original", [
    "home.atalho.emprestimo", "emprestimo1.valor.3000", "emprestimo1.parcelas.12", "emprestimo1.continuar",
    "emprestimo2.continuar", "emprestimo3.aceite", "emprestimo3.contratar",
  ]);
  checar(emprestimo.tela === "emprestimo_sucesso" && tarefaConcluida(emprestimo), "empréstimo: caminho certo conclui a tarefa");

  const semAceite = passos("emprestimo", "original", [
    "home.atalho.emprestimo", "emprestimo1.valor.3000", "emprestimo1.parcelas.12", "emprestimo1.continuar",
    "emprestimo2.continuar", "emprestimo3.contratar",
  ]);
  checar(semAceite.tela === "emprestimo_3", "empréstimo: sem aceite, 'contratar' não avança");

  const valorErrado = passos("emprestimo", "simplificada", [
    "home.atalho.emprestimo", "emprestimo1.valor.5000", "emprestimo1.parcelas.12", "emprestimo1.continuar",
    "emprestimo2.continuar", "emprestimo3.aceite", "emprestimo3.contratar",
  ]);
  checar(telaFinal(valorErrado) && !tarefaConcluida(valorErrado), "empréstimo: valor errado chega ao fim mas não conclui");

  const caminhoPix = ["home.atalho.pix", "pix.contato.ana", "pixvalor.opcao.250", "pixvalor.continuar"];
  const pixA = passos("pix_recorrente", "A", [...caminhoPix, "pixconfirmar.repetir", "pixconfirmar.enviar"]);
  checar(!tarefaConcluida(pixA), "Pix A: 'repetir' escondido não funciona sem abrir Mais opções");
  const pixA2 = passos("pix_recorrente", "A", [...caminhoPix, "pixconfirmar.mais_opcoes", "pixconfirmar.repetir", "pixconfirmar.enviar"]);
  checar(tarefaConcluida(pixA2), "Pix A: abrindo Mais opções e repetindo conclui");
  const pixC = passos("pix_recorrente", "C", [...caminhoPix, "pixconfirmar.enviar"]);
  checar(telaFinal(pixC) && !tarefaConcluida(pixC), "Pix C: enviar sem repetir é falha da tarefa");

  const ignorada = aplicarAcao(estadoInicial("pix_recorrente", "B"), "emprestimo1.continuar");
  checar(ignorada.tela === "home", "action_id de outra tela é ignorado");

  const arvore = {
    tela: "emprestimo_2" as const,
    titulo: "Condições da operação",
    textos: ["Taxa de juros nominal pós-fixada: 1,99% a.m. (Selic + spread)", "CET: 29,90% a.a. · IOF"],
    elementos: [],
    viewport: { largura: 390, altura: 800 },
  };
  const jargoes = encontrarJargoes([arvore.titulo, ...arvore.textos]);
  checar(["CET", "IOF", "Selic", "spread", "a.m.", "a.a."].every((j) => jargoes.includes(j)), "encontra os jargões da etapa 2");
  const leve = calcularCargaCognitiva({ ...arvore, textos: ["Você recebe R$ 3.000 hoje."], jargoes: [] });
  const pesada = calcularCargaCognitiva({ ...arvore, jargoes });
  checar(pesada > leve, `carga cognitiva maior com jargão (${pesada} > ${leve})`);
}

// ---------------------------------------------------------------- Módulo 3: política do agente
{
  const no = (action_id: string, rotulo: string, extra: Partial<NoAcessivel> = {}): NoAcessivel => ({
    action_id,
    tipo: "botao",
    rotulo,
    texto_visivel: true,
    posicao: { x: 0, y: 0, largura: 100, altura: 44 },
    visivel_sem_rolar: true,
    habilitado: true,
    contraste_baixo: false,
    ...extra,
  });
  const arvorePix = (elementos: NoAcessivel[], carga = 0.2): ArvoreAcessibilidade => ({
    tela: "pix_confirmar",
    titulo: "Confirmar Pix",
    textos: ["Destinatário", "Ana Paula Souza", "R$ 250,00"],
    elementos,
    jargoes: [],
    carga_cognitiva: carga,
    viewport: { largura: 390, altura: 800 },
  });
  const base = gerarBase({ quantidade: 200, semente: 11, proporcao: PROPORCAO_PADRAO });
  const alta = base.filter((p) => p.cadastral.literacia_digital >= 0.8).slice(0, 30);
  const baixa = base.filter((p) => p.cadastral.literacia_digital < 0.4).slice(0, 30);
  checar(alta.length >= 15 && baixa.length >= 15, `há personas de literacia alta (${alta.length}) e baixa (${baixa.length}) para testar`);

  const pedido = (persona: Persona, arvore: ArvoreAcessibilidade, semente: number): PedidoNavegacao => ({
    persona,
    fluxo: "pix_recorrente",
    objetivo: FLUXOS.pix_recorrente.objetivo,
    arvore,
    historico: [],
    passo: 5,
    semente,
    taxa_resposta_invalida: 0,
  });
  const fracao = (personas: Persona[], arvore: ArvoreAcessibilidade, acao: string) => {
    let n = 0;
    let total = 0;
    for (const persona of personas) {
      for (let s = 0; s < 10; s++) {
        total += 1;
        if (navegarMock(pedido(persona, arvore, s)).action_id === acao) n += 1;
      }
    }
    return n / total;
  };

  const telaC = arvorePix([
    no("pixconfirmar.voltar", "Voltar", { texto_visivel: false }),
    no("pixconfirmar.repetir", "Repetir todo mês", { tipo: "alternador" }),
    no("pixconfirmar.enviar", "Confirmar e enviar R$ 250,00"),
  ]);
  const telaB = arvorePix([
    no("pixconfirmar.voltar", "Voltar", { texto_visivel: false }),
    no("pixconfirmar.repetir", "Repetir este Pix", { tipo: "alternador", texto_visivel: false }),
    no("pixconfirmar.enviar", "Confirmar e enviar R$ 250,00"),
  ]);
  const cAlta = fracao(alta, telaC, "pixconfirmar.repetir");
  const bBaixa = fracao(baixa, telaB, "pixconfirmar.repetir");
  const bAlta = fracao(alta, telaB, "pixconfirmar.repetir");
  checar(cAlta > 0.8, `tela C: literacia alta toca em "Repetir todo mês" (${Math.round(cAlta * 100)}%)`);
  checar(bBaixa < bAlta, `tela B (só ícone): literacia baixa acha menos que alta (${Math.round(bBaixa * 100)}% < ${Math.round(bAlta * 100)}%)`);

  const pesada = arvorePix(telaC.elementos, 0.8);
  const desisteBaixa = fracao(baixa, pesada, ABANDONAR);
  const desisteAlta = fracao(alta, pesada, ABANDONAR);
  checar(desisteBaixa > desisteAlta, `carga alta: literacia baixa desiste mais (${Math.round(desisteBaixa * 100)}% > ${Math.round(desisteAlta * 100)}%)`);

  const r1 = navegarMock(pedido(baixa[0], telaB, 3));
  const r2 = navegarMock(pedido(baixa[0], telaB, 3));
  checar(JSON.stringify(r1) === JSON.stringify(r2), "mesma semente, mesma decisão (reprodutível)");
  const validas = new Set([...telaB.elementos.map((e) => e.action_id), ABANDONAR]);
  checar(
    Array.from({ length: 50 }, (_, s) => navegarMock(pedido(alta[s % alta.length], telaB, s))).every((r) => validas.has(r.action_id)),
    "sem injeção de erro, o mock só devolve ações da árvore ou ABANDONAR",
  );
  const invalidas = Array.from({ length: 200 }, (_, s) =>
    navegarMock({ ...pedido(alta[0], telaB, s), taxa_resposta_invalida: 0.5 }),
  ).filter((r) => !validas.has(r.action_id)).length;
  checar(invalidas > 50, `com 50% de injeção, aparecem respostas inválidas para testar a proteção (${invalidas}/200)`);

  const prompt = promptNavegador(pedido(baixa[0], telaB, 1));
  checar(prompt.sistema.includes("ABANDONAR") && prompt.sistema.includes("literacia digital abaixo de 0,4"), "prompt do navegador tem as restrições e a saída ABANDONAR");
  checar(!/repetir todo m[eê]s/i.test(prompt.sistema), "prompt não entrega a resposta certa");
}

// ---------------------------------------------------------------- Módulo 4: estatísticas, analista e designer
{
  const personas = gerarBase({ quantidade: 60, semente: 5, proporcao: PROPORCAO_PADRAO });
  const resultados: ResultadoAgente[] = personas.map((persona) => {
    const idoso = persona.cadastral.idade >= 60;
    const tela = idoso ? "emprestimo_2" : "emprestimo_3";
    return {
      persona,
      desfecho: idoso ? "abandono" : "sucesso",
      tela_final: idoso ? "emprestimo_2" : "emprestimo_sucesso",
      passos: [{ passo: 1, tela, action_id: idoso ? ABANDONAR : "emprestimo3.contratar", justificativa: "", tempo_s: 10, carga_cognitiva: 0.6, valida: true }],
      tempo_total_s: 40,
      respostas_invalidas: 0,
    };
  });
  const idosos = resultados.filter((r) => r.persona.cadastral.idade >= 60).length;
  const est = calcularEstatisticas({ resultados });
  checar(est.total === 60 && est.sucessos === 60 - idosos, `estatísticas: ${est.sucessos} de ${est.total} concluíram`);
  const seg60 = est.por_segmento.faixa_etaria.find((s) => s.segmento === "60+");
  checar(!!seg60 && seg60.taxa_sucesso === 0, "segmento 60+ com 0% de sucesso");
  checar(est.abandono_por_tela.some((p) => p.tela === "emprestimo_2" && p.abandonos === idosos), "drop-off conta os abandonos na etapa 2");

  const achados = gerarAchados(est, resultados);
  const achado60 = achados.find((a) => a.segmento === "Faixa etária: 60+");
  checar(!!achado60 && achado60.tela === "emprestimo_2" && achado60.evidencia.includes(`0 de ${idosos}`), "analista aponta 60+ parando na etapa 2, com os números");

  const arvore2: ArvoreAcessibilidade = {
    tela: "emprestimo_2",
    titulo: "Condições da operação",
    textos: ["CET: 29,90% a.a. · IOF", "Taxa nominal pós-fixada: Selic + spread"],
    elementos: [],
    jargoes: ["CET", "IOF", "Selic", "spread", "a.a."],
    carga_cognitiva: 0.57,
    viewport: { largura: 390, altura: 800 },
  };
  const propostas = proporMock(achados, { emprestimo_2: arvore2 });
  checar(propostas.some((p) => p.tela === "emprestimo_2" && p.proposta.includes("Custo total do empréstimo")), "designer propõe trocar o jargão por linguagem simples");
  checar(propostas.every((p) => p.hipotese_de_impacto.startsWith("Hipótese")), "todo impacto proposto é marcado como hipótese");
  const sumario = sumarioMock(est, achados, "Empréstimo");
  checar(sumario.includes("SIMULAÇÃO") && sumario.includes(`${est.sucessos} de ${est.total}`), "sumário usa os números calculados e diz que é simulação");
}

console.log(falhas === 0 ? "\nTudo certo." : `\n${falhas} FALHA(S).`);
process.exit(falhas === 0 ? 0 : 1);
