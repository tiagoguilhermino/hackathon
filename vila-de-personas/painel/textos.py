"""Todo texto que aparece na tela fica aqui. O agente revisor-textos lê este arquivo."""

TITULO_PAGINA = "Vila de personas"
AVISO_FIXO = "Protótipo de hackathon · resultados simulados · telas fictícias"
ROTULO_SIMULACAO = "SIMULAÇÃO"

TITULO = "Vila de personas"
SUBTITULO = (
    "Veja onde cada perfil de cliente travaria numa tela antes de levá-la a pessoas reais. "
    "A vila sugere; quem decide é o designer ou o PO."
)

# (nome da etapa, o que acontece, hora do plano em que fica pronta)
ETAPAS = [
    ("1 · Entrada", "Escreva a tarefa e escolha duas versões da tela.", "H2"),
    ("2 · Vila de IA", "Cada persona tenta a tarefa 3 vezes em cada versão.", "H3 e H5"),
    ("3 · Revisão humana", "O designer ou o PO decide o que levar ao teste com pessoas.", "H4"),
    ("4 · Registro", "Fica guardado o que a vila apontou e o que o time decidiu.", "H4"),
]
EM_CONSTRUCAO = "Em construção ({hora})"

DIAGNOSTICO_TITULO = "Como está o repositório"
DIAGNOSTICO_AJUDA = "Mostra o que já chegou de cada pessoa do time. Nunca mostra a chave."
DIAG_CONTRATO = "Contrato da vila"
DIAG_CONTRATO_OK = "vila/contrato.py encontrado"
DIAG_CONTRATO_FALTA = "Falta vila/contrato.py (M1, H1)"
DIAG_MOTOR = "Motor da vila"
DIAG_MOTOR_OK = "simular_vila encontrada em vila/motor.py"
DIAG_MOTOR_FALTA = "Falta simular_vila em vila/motor.py (M1, H4). Até lá, o painel usa dados de exemplo."
DIAG_PERSONAS = "Personas"
DIAG_PERSONAS_OK = "{n} persona(s) em dados/personas.json"
DIAG_PERSONAS_FALTA = "Falta dados/personas.json (M1, H3)"
DIAG_PERSONAS_INVALIDO = "dados/personas.json está num formato inesperado: {erro}"
DIAG_TELAS = "Telas"
DIAG_TELAS_OK = "Oficiais: {nomes}"
DIAG_TELAS_PROVISORIAS = "Só provisórias: {nomes}. As oficiais chegam do M4 na H3."
DIAG_TELAS_FALTA = "Nenhuma tela ainda (M4, H2 e H3)"
# Entrada
ENTRADA_PERSONAS = "Quais personas tentam a tarefa?"
ENTRADA_ORIGEM = "De onde vêm as telas?"
ORIGEM_PRONTAS = "Telas prontas (pasta telas/)"
ORIGEM_UPLOAD = "Enviar imagens"
TELA_ANTES = "Versão antes"
TELA_DEPOIS = "Versão depois"
SEM_PERSONAS = "Marque pelo menos uma persona."
PERSONAS_ERRO = "Não consegui ler dados/personas.json: {erro}"
ESTIMATIVA = (
    "Serão {n} tentativas ({p} persona(s) × 2 versões × 3 rodadas). No plano gratuito da Groq, "
    "cada tentativa leva cerca de 1 minuto. Para a demo, use “Carregar resultado salvo”."
)

# Como ler o resultado
COMO_LER_TITULO = "Como ler este resultado"
COMO_LER = (
    "Cada persona tenta a tarefa **3 vezes** em cada versão (as “rodadas”), porque a IA não responde "
    "igual toda vez. “Concluiu 2 de 3” quer dizer que em 2 das 3 tentativas ela chegaria à opção certa "
    "com confiança.\n\n"
    "- 🟢 **Melhorou** / 🔴 **Piorou**: a diferença entre as versões foi de 2 rodadas ou mais.\n"
    "- 🟡 **Sinal fraco**: diferença de 1 rodada ou nenhuma. Não dá para concluir nada.\n"
    "- ⚪ **Incompleto**: alguma tentativa falhou (por exemplo, limite da API), então as versões não "
    "têm o mesmo número de rodadas. Simule de novo antes de concluir.\n\n"
    "Tudo aqui é **SIMULAÇÃO**: são hipóteses para levar ao teste com pessoas, não resultados."
)

# Revisão humana (seção 6 do contrato)
REVISAO_AJUDA = (
    "A vila só sugere. Para cada persona, quem decide é o designer ou o PO: levar o ponto ao teste com "
    "pessoas reais, descartar ou marcar como já corrigido. Deixe “—” nas personas sem decisão."
)
DECISAO_QUEM = "Quem está decidindo?"
DECISAO_ESCOLHA = "Decisão"
SEM_DECISAO = "—"
DECISAO_COMENTARIO = "Por quê? (comentário)"
DECISAO_BOTAO = "Salvar decisões"
DECISAO_NENHUMA = "Nenhuma decisão marcada: escolha uma opção em pelo menos uma persona."
DECISAO_SALVA = "{n} decisão(ões) salva(s) em resultados/decisoes.json (total no registro: {total})."
REGISTRO_ILEGIVEL = (
    "O arquivo resultados/decisoes.json está ilegível ({erro}). Nada foi gravado, para não apagar o "
    "histórico. Peça ajuda para consertar o arquivo."
)
APONTAMENTO_NENHUM = "não travou em nenhuma das duas versões"
HISTORICO_TITULO = "Histórico de decisões"
HISTORICO_VAZIO = "Nenhuma decisão registrada ainda."

# Plano B: resultado salvo, sem chamar a API
CARREGAR_TITULO = "Ou carregue um resultado salvo"
CARREGAR_AJUDA = (
    "Mostra uma simulação que já rodou, sem chamar a IA. Use se a internet cair, se a API "
    "recusar por limite de uso ou para a demo."
)
CARREGAR_ESCOLHA = "Resultado salvo"
CARREGAR_BOTAO = "Carregar resultado salvo"
CARREGAR_VAZIO = (
    "Ainda não há resultado salvo. Rode uma simulação real e grave o plano B com: "
    "python -m vila.motor --vila --telas A=telas/A.png B=telas/B.png C=telas/C.png --salvar-demo"
)
CARREGADO_DE = "Resultado salvo, não é ao vivo: {arquivo} · rodou em {horario} · modelo {modelo}"
AVISO_OFFLINE = (
    "Respostas FALSAS geradas sem IA (teste de encanamento do motor). Servem só para testar o "
    "painel: não mostre à banca."
)
COMPARAR_ANTES = "Antes"
COMPARAR_DEPOIS = "Depois"
COMPARAR_IGUAIS = "Escolha duas versões diferentes para comparar."

# Leitura antes × depois (seção 6 do contrato de dados)
LEITURA_MELHOROU = "🟢 Melhorou"
LEITURA_PIOROU = "🔴 Piorou"
LEITURA_SINAL_FRACO = "🟡 Sinal fraco"
LEITURA_INCOMPLETO = "⚪ Incompleto"
LEITURA_INCOMPLETO_DETALHE = (
    "Algumas tentativas falharam, então as versões não têm o mesmo número de rodadas. "
    "Simule de novo antes de tirar conclusão."
)

DIAG_CHAVE = "Chave da Groq"
DIAG_CHAVE_OK = "Configurada"
DIAG_CHAVE_FALTA = "Não configurada. Só a simulação ao vivo precisa dela: copie .env.example para .env e cole a chave."
