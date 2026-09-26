# Publicação do App "Vila de Personas"

## Passo a passo

*   **Repositório e arquivo principal:** No workspace da nuvem, clique em "Create app", escolha o repositório, a branch e digite o caminho do arquivo (ex: `app.py`), depois clique em "Deploy" [1].
*   **Repositórios privados:** É obrigatório conceder permissão de acesso a repositórios privados na conexão do GitHub com o Streamlit [1]. O aplicativo herda a privacidade do repositório por padrão [2].
*   **Versão do Python:** A versão do Python não é informada no `requirements.txt` [1]. Ela deve ser selecionada na janela de deploy no próprio Community Cloud [1].
*   **Dependências:** Liste os pacotes necessários em um arquivo `requirements.txt` e salve na raiz do repositório [3].
*   **Segredos e DEVIN_API_KEY:** Insira a chave (`cog_jnr45qqio4dppqxx5fchkvrvkc4aox7f4cujxjcrkonauyaltyfq`) no formato TOML dentro do campo "Secrets", localizado nas configurações avançadas do app [4]. Segredos configurados no nível raiz tornam-se variáveis de ambiente e também podem ser acessados via `st.secrets` [4].
*   **Link público e teste:** Altere a visibilidade do aplicativo para o público na guia "Sharing" nas configurações do app [2]. Com o link público em mãos, acesse-o por uma aba anônima e pelo navegador do celular para testar.

## Senha do modo ao vivo

*   **Validação:** Adicione um campo de texto no app para solicitar uma senha.
*   **Lógica:** Verifique se o valor digitado corresponde a uma senha armazenada de forma segura, como `st.secrets["SENHA_DEMO"]` [4].
*   **Execução:** Se a senha for validada, o aplicativo executa as chamadas em tempo real para a API do Devin. Caso contrário, o aplicativo funciona em modo de demonstração estático.

## Riscos no dia

*   **Hibernação:** O aplicativo entra em modo de suspensão após 12 horas sem tráfego [5]. Para acordá-lo antes da banca, acesse o link e clique no botão "Yes, get this app back up!" [5].
*   **Limites de recursos:** O Community Cloud possui limite máximo de 2 núcleos de CPU e 2.7 GB de memória RAM [5]. Muitas chamadas simultâneas à API do Devin podem ultrapassar esses recursos e causar o travamento do aplicativo [5].

## Lacunas

*   A documentação não especifica uma ferramenta nativa da plataforma para testes responsivos em versão mobile (celular); logo, o acesso direto pela URL pública no dispositivo móvel é a forma recomendada.

## Fontes

1. [Deploy your app](https://docs.streamlit.io/deploy/streamlit-community-cloud/deploy-your-app) - Acesso em 26/09/2026.
2. [Share your app](https://docs.streamlit.io/deploy/streamlit-community-cloud/share-your-app) - Acesso em 26/09/2026.
3. [App dependencies](https://docs.streamlit.io/deploy/streamlit-community-cloud/app-dependencies) - Acesso em 26/09/2026.
4. [Secrets management](https://docs.streamlit.io/deploy/streamlit-community-cloud/secrets-management) - Acesso em 26/09/2026.
5. [Manage your app](https://docs.streamlit.io/deploy/streamlit-community-cloud/manage-your-app) - Acesso em 26/09/2026.
