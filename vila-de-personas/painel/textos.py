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
DIAG_PERSONAS_INVALIDO = "dados/personas.json não é uma lista JSON válida: {erro}"
DIAG_TELAS = "Telas"
DIAG_TELAS_OK = "Oficiais: {nomes}"
DIAG_TELAS_PROVISORIAS = "Só provisórias: {nomes}. As oficiais chegam do M4 na H3."
DIAG_TELAS_FALTA = "Nenhuma tela ainda (M4, H2 e H3)"
DIAG_CHAVE = "Chave da Groq"
DIAG_CHAVE_OK = "Configurada"
DIAG_CHAVE_FALTA = "Não configurada. Só a simulação ao vivo precisa dela: copie .env.example para .env e cole a chave."
