/**
 * Tipos do laboratório de usabilidade com agentes (Vila de Personas · Lab).
 *
 * Modelo: a navegação é um Processo de Decisão de Markov (MDP). O app é o conjunto
 * de estados S (telas + dados do formulário), os elementos clicáveis são as ações A
 * (cada um com um data-action-id) e cada agente segue uma política π(a|s) enviesada
 * pelo perfil da persona. Tudo aqui é SIMULAÇÃO com dados sintéticos.
 */

// --------------------------------------------------------------------------- Módulo 1: personas

export type Profissao = "servidor_publico" | "clt" | "autonomo" | "aposentado" | "estudante";

export type UF =
  | "AC" | "AL" | "AP" | "AM" | "BA" | "CE" | "DF" | "ES" | "GO" | "MA" | "MT" | "MS" | "MG" | "PA"
  | "PB" | "PR" | "PE" | "PI" | "RJ" | "RN" | "RS" | "RO" | "RR" | "SC" | "SP" | "SE" | "TO";

export interface DadosCadastrais {
  idade: number;
  renda_mensal: number; // R$
  profissao: Profissao;
  literacia_digital: number; // 0 (nenhuma) a 1 (alta)
}

export interface HistoricoFinanceiro {
  saldo: number; // R$
  transacoes_mensais: number;
  produtos: {
    cartao_credito: boolean;
    emprestimo_ativo: boolean;
    investimentos: boolean;
  };
}

export interface ComportamentoDigital {
  tempo_medio_sessao_min: number;
  taxa_rejeicao: number; // 0 a 1: fração de sessões abandonadas sem concluir nada
}

export interface SegurancaLocalizacao {
  sistema: "iOS" | "Android";
  gama: "low-end" | "high-end";
  uf: UF;
}

export interface Persona {
  id: string; // "P001"
  apelido: string; // nome fictício para leitura humana
  cadastral: DadosCadastrais;
  financeiro: HistoricoFinanceiro;
  digital: ComportamentoDigital;
  seguranca: SegurancaLocalizacao;
}

/** Pesos relativos por profissão: {servidor_publico: 2, clt: 1} = 2× mais servidores que CLT. */
export type ProporcaoProfissoes = Record<Profissao, number>;

export interface ConfigBase {
  quantidade: number;
  semente: number;
  proporcao: ProporcaoProfissoes;
}

// --------------------------------------------------------------------------- Módulo 2: ambiente

export type FluxoId = "emprestimo" | "pix_recorrente";
export type VersaoEmprestimo = "original" | "simplificada";
export type VersaoPix = "A" | "B" | "C";
export type Versao = VersaoEmprestimo | VersaoPix;

export type TelaId =
  | "home"
  | "pagamentos"
  | "emprestimo_1"
  | "emprestimo_2"
  | "emprestimo_3"
  | "emprestimo_sucesso"
  | "pix_contatos"
  | "pix_valor"
  | "pix_confirmar"
  | "pix_sucesso";

/** Estado s ∈ S do MDP: tela atual + o que já foi preenchido. */
export interface EstadoBanco {
  tela: TelaId;
  fluxo: FluxoId; // a tarefa que está sendo testada
  versoes: { emprestimo: VersaoEmprestimo; pix: VersaoPix };
  saldo: number;
  emprestimo: { valor: number | null; parcelas: number | null; aceite: boolean };
  pix: { contato: string | null; valor: number | null; repetir_mensal: boolean; mais_opcoes_aberto: boolean };
}

export type TipoElemento = "botao" | "campo" | "opcao" | "alternador" | "link";

export interface PosicaoElemento {
  x: number;
  y: number;
  largura: number;
  altura: number;
}

/** Um elemento clicável como o agente o "vê". */
export interface NoAcessivel {
  action_id: string;
  tipo: TipoElemento;
  rotulo: string; // texto visível ou, se não houver, o aria-label
  texto_visivel: boolean; // false = só ícone
  posicao: PosicaoElemento;
  visivel_sem_rolar: boolean;
  habilitado: boolean;
  selecionado?: boolean;
  contraste_baixo: boolean;
}

/** Árvore de acessibilidade simplificada exportada pela UI (entrada do agente). */
export interface ArvoreAcessibilidade {
  tela: TelaId;
  titulo: string;
  textos: string[]; // parágrafos e rótulos não clicáveis, na ordem da tela
  elementos: NoAcessivel[];
  jargoes: string[]; // termos técnicos encontrados na tela
  carga_cognitiva: number; // 0 (leve) a 1 (pesada), calculada por regra (ver acessibilidade.ts)
  viewport: { largura: number; altura: number };
}

export interface DefinicaoFluxo {
  id: FluxoId;
  nome: string;
  objetivo: string; // o que a persona quer fazer, em linguagem de cliente
  versoes: { id: Versao; descricao: string }[];
  tela_inicial: TelaId;
  telas_sucesso: TelaId[];
  max_passos: number;
}

// --------------------------------------------------------------------------- Módulo 3: simulação

export const ABANDONAR = "ABANDONAR" as const;

export interface PedidoNavegacao {
  persona: Persona;
  fluxo: FluxoId;
  objetivo: string;
  arvore: ArvoreAcessibilidade;
  historico: { tela: TelaId; action_id: string }[];
  passo: number;
  semente: number;
  taxa_resposta_invalida: number; // 0 a 1: só no modo mock, para testar a proteção
  incluir_prompt?: boolean;
}

export interface RespostaNavegacao {
  action_id: string; // um action_id da árvore ou "ABANDONAR"
  justificativa: string;
  tempo_s: number; // tempo simulado que a persona levaria neste passo
  valida: boolean; // false = o agente devolveu algo fora da árvore
  modelo: string;
  versao_prompt: string;
  latencia_ms: number;
  prompt?: string;
}

export type DesfechoAgente = "sucesso" | "falha_tarefa" | "abandono" | "limite_passos" | "erro_agente";

export interface PassoLog {
  passo: number;
  tela: TelaId;
  action_id: string;
  justificativa: string;
  tempo_s: number;
  carga_cognitiva: number;
  valida: boolean;
  posicao?: PosicaoElemento;
}

export interface ResultadoAgente {
  persona: Persona;
  desfecho: DesfechoAgente;
  tela_final: TelaId;
  passos: PassoLog[];
  tempo_total_s: number;
  respostas_invalidas: number;
}

export interface ConfigSimulacao {
  fluxo: FluxoId;
  versao: Versao;
  agentes: number;
  semente: number;
  proporcao: ProporcaoProfissoes;
  taxa_resposta_invalida: number;
}

export interface Simulacao {
  id: string;
  rotulo: "SIMULAÇÃO";
  aviso: string;
  criada_em: string; // ISO, horário de Brasília
  config: ConfigSimulacao;
  modelo: string;
  versao_prompt: string;
  duracao_real_s: number;
  resultados: ResultadoAgente[];
  arvores: Partial<Record<TelaId, ArvoreAcessibilidade>>; // uma foto de cada tela visitada
}

// --------------------------------------------------------------------------- Módulo 4: analítica

export type Segmentacao = "profissao" | "faixa_etaria" | "literacia" | "dispositivo";

export interface EstatisticaSegmento {
  segmento: string;
  n: number;
  sucessos: number;
  taxa_sucesso: number; // 0 a 1
  tempo_medio_s: number | null; // só de quem concluiu
}

export interface PontoAbandono {
  tela: TelaId;
  abandonos: number;
  falhas: number; // falha_tarefa + limite_passos terminados nesta tela
}

export interface Estatisticas {
  total: number;
  sucessos: number;
  taxa_sucesso: number;
  tempo_medio_s: number | null;
  respostas_invalidas: number;
  erros_agente: number;
  por_segmento: Record<Segmentacao, EstatisticaSegmento[]>;
  abandono_por_tela: PontoAbandono[];
  desfechos: Record<DesfechoAgente, number>;
}

export type Severidade = "alta" | "media" | "baixa";

export interface Achado {
  id: string; // "A1"
  tipo: "segmento_abaixo" | "tela_com_abandono" | "tempo_alto" | "qualidade_agente";
  descricao: string;
  evidencia: string; // números calculados pelo código, não pelo LLM
  segmento?: string;
  tela?: TelaId;
  severidade: Severidade;
}

export interface RelatorioAnalista {
  sumario: string;
  achados: Achado[];
  modelo: string;
  versao_prompt: string;
}

export interface Proposta {
  id: string; // "D1"
  achado_id: string;
  tela: TelaId;
  elemento?: string; // action_id ou trecho de texto
  problema: string;
  proposta: string;
  justificativa: string;
  hipotese_de_impacto: string; // sempre hipótese: precisa de teste
  esforco: "baixo" | "medio" | "alto";
}

export interface RelatorioDesigner {
  propostas: Proposta[];
  modelo: string;
  versao_prompt: string;
}

export type OpcaoDecisao = "aprovar_para_teste" | "recusar" | "precisa_de_dados";

/** Revisão humana: a IA sugere, uma pessoa decide, e fica registrado. */
export interface DecisaoHumana {
  horario: string; // ISO, horário de Brasília
  papel: "designer" | "PO";
  simulacao_id: string;
  proposta_id: string;
  proposta: string;
  decisao: OpcaoDecisao;
  comentario: string;
}
