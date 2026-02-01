# 🤖 AI-Fred: Motor de Multi-Bots Concorrentes

O AI-Fred é um motor de automação de WhatsApp profissional e self-hosted, projetado para rodar **múltiplas contas simultaneamente**. Feito com `whatsapp-web.js`, Node.js e SQLite, ele oferece um Painel Global centralizado para monitorar e gerenciar todos os seus bots a partir de uma única janela de terminal.

---

## 🛠️ Stack Tecnológica
- **Runtime:** [Node.js (v18+)](https://nodejs.org/) - Ambiente de execução assíncrono de alta performance.
- **WhatsApp Library:** [`whatsapp-web.js`](https://wwebjs.dev/) - Integração via browser-level (estável).
- **Banco de Dados:** [SQLite 3](https://www.sqlite.org/) - Persistência leve com isolamento de sessões.
- **IA Engine:** [Google Gemini API](https://ai.google.dev/) - NLP avançado, resumos e respostas inteligentes.
- **Utilitários:** `wa-sticker-formatter` (Figurinhas), `axios` (Requisições API), `qrcode-terminal` (Exibição QR).

---

## 🚀 Principais Funcionalidades

### 🌐 Arquitetura Multi-Bot Concorrente
Ao contrário de bots padrão, o AI-Fred inicializa todas as suas sessões de WhatsApp **em paralelo** na inicialização. Cada bot permanece ativo e responsivo em segundo plano enquanto você navega pelo painel.

### 📊 Painel Global & Monitoramento
Um centro de comando central para todas as suas instâncias:
- **Status ao Vivo:** Monitore os bots enquanto eles alternam entre `Aguardando QR`, `Carregando` e `Online`.
- **Estatísticas em Tempo Real:** Veja a contagem de contatos e mensagens de cada bot num relance.
- **Atualização Dinâmica:** Pressione `ENTER` para atualizar instantaneamente o status de todos os bots concorrentes.

### 🛠️ CLI Administrativo Profissional
Gerenciamento detalhado para cada instância específica:
1. **Indexação de Contatos:** Liste todos os contatos registrados com nomes e JIDs.
2. **Histórico de Conversas:** Veja as mensagens recentes com diferenciação entre bot/usuário.
3. **Status da Conexão:** Informações técnicas detalhadas sobre a sessão atual.
4. **Troca de Contexto:** Volte para o Painel Global sem parar o bot (Opção 9).
5. **Gestão de Sessões:** Crie novas sessões facilmente (Opção N) ou apague as antigas (Opção D) com limpeza total de dados.

### 🛡️ Anti-Ban & UI Inteligente
- **Privacidade por Bot:** Alterne entre os modos **🌐 Público** ou **🔒 Privado** (Admin Only) de forma independente para cada conta.
- **Presença Humanizada:** Delays de resposta aleatórios e indicadores de "digitando..." simulados.
- **Isolamento de Dados:** O banco SQLite armazena dados indexados por `bot_id`, garantindo que não haja vazamento entre contas.

---

## ⚡ Comandos Disponíveis
- `/ajuda` - Lista completa e detalhada de comandos.
- `/status` - Saúde detalhada do sistema e da conexão.
- `/sticker` - Conversão instantânea de imagem para figurinha (direta ou respondida).
- `/clima [cidade]` - Relatórios meteorológicos locais.
- `/resumo` - Resumos de chat gerados por IA (Integração Gemini).

---

## ⚙️ Instalação

1. **Clonar e Instalar:**
   ```bash
   git clone [url-do-repo]
   cd bot-whats
   npm install
   ```

2. **Configurar Ambiente:**
   ```bash
   cp .env.example .env
   # Adicione sua API Key do Google Gemini
   ```

3. **Iniciar o Motor:**
   ```bash
   npm start
   ```

4. **Pareamento Múltiplo:**
   - Selecione `N` no painel para adicionar uma nova sessão.
   - Digite um nome (ex: `Suporte`).
   - Selecione a nova sessão para ver o QR Code e conectar seu celular.

---

## 📜 Estrutura do Projeto
- `src/index.js`: Registro multi-bot, Painel Global e núcleo da CLI.
- `src/database.js`: Schema SQLite com isolamento de sessão e migrações automatizadas.
- `src/commands.js`: Processamento de comandos e integrações de API.
- `src/utils.js`: Lógica de humanização anti-ban.

---

## 🤝 Roadmap
- [x] Suporte Multi-Bot Concorrente
- [x] UI de Painel Global
- [x] Isolamento de Dados SQLite
- [x] Ciclo de Vida de Sessão (Criar/Deletar/Voltar)
- [ ] Transcrição de Áudio para Texto
- [ ] Respostas Automáticas Inteligentes via IA
- [ ] Geração de Imagens (`/imagine`)

Desenvolvido com ❤️ para automação de alta eficiência.
