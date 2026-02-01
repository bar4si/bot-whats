# 🤖 AI-Fred: Motor de Multi-Bots Concorrentes

O AI-Fred é um motor de automação de WhatsApp de nível profissional, projetado para orquestrar **múltiplas contas simultaneamente**. Desenvolvido com uma arquitetura modular de alto padrão, ele utiliza `whatsapp-web.js`, Node.js e Google Gemini para oferecer um centro de comando centralizado para comunicações de alta eficiência.

---

## 📑 Índice
1. [Visão Geral](#1-visão-geral)
2. [Stack Tecnológica](#2-stack-tecnológica)
3. [Arquitetura & Injeção de Dependência](#3-arquitetura--injeção-de-dependência)
4. [Núcleo Multi-Bot Concorrente](#4-núcleo-multi-bot-concorrente)
5. [Comandos & Exemplos de Uso](#5-comandos--exemplos-de-uso)
6. [Instalação & Configuração](#6-instalação--configuração)
7. [Roadmap Avançado](#7-roadmap-avançado)

---

## 1. Visão Geral
O AI-Fred não é apenas um bot; é um **motor**. Focado em estabilidade, isolamento de dados e integração avançada de IA. Seja gerenciando linhas de suporte ou automações pessoais, o AI-Fred oferece uma experiência de CLI premium para monitorar e interagir com cada instância em tempo real.

> [!TIP]
> Utilize o Painel Global para monitorar a saúde e o tráfego de todas as suas sessões ativas com um único olhar.

---

## 2. Stack Tecnológica
A stack foi escolhida para máximo desempenho e baixo consumo:
- **Runtime:** [Node.js (v18+)](https://nodejs.org/) - Execução assíncrona de alta performance.
- **WhatsApp Library:** [`whatsapp-web.js`](https://wwebjs.dev/) - Integração via browser-level para maior estabilidade.
- **Banco de Dados:** [SQLite 3](https://www.sqlite.org/) - Persistência de dados local e isolada por bot.
- **IA Engine:** [Google Gemini API](https://ai.google.dev/) - Transcrição avançada e processamento de linguagem natural.
- **Utilitários:** `wa-sticker-formatter` (Figurinhas), `axios` (REST), `qrcode-terminal` (exibição de QR no terminal).

---

## 3. Arquitetura & Injeção de Dependência
O AI-Fred segue o padrão de **Provedor Multi-Simétrico**. Utilizando **Injeção de Dependência**, a lógica central é desacoplada da biblioteca de WhatsApp subjacente.

- **Handlers Modulares:** Comandos e mensagens são separados da lógica de conexão.
- **Interface de Provedor:** Permite alternar facilmente entre o `whatsapp-web.js` e a **API Oficial do WhatsApp (Cloud API)**.
- **Isolamento de Dados:** Cada sessão possui seu próprio diretório e escopo de banco de dados, evitando vazamentos entre contas.

---

## 4. Núcleo Multi-Bot Concorrente
Ao contrário de bots tradicionais que rodam em sequência, o AI-Fred inicializa todas as sessões em **paralelo**.
- **Painel Global:** Centro de comando central para monitoramento multi-sessão.
- **Recuperação Automática:** Detecta desconexões e tenta restaurar sessões sem intervenção humana.
- **Gestor de Sessões:** Crie (`N`), Delete (`D`) ou acesse menus individuais de cada bot diretamente pela CLI.

---

## 5. Comandos & Exemplos de Uso
O AI-Fred já vem equipado com utilitários poderosos nativos.

| Comando | Ação | Exemplo |
| :--- | :--- | :--- |
| `/ajuda` | Exibe o menu de comandos | `Usuário: /ajuda` |
| `/status` | Métricas de conexão e uptime | `Usuário: /status` |
| `/sticker` | Conversão de Imagem para Figurinha | `Usuário: [Envia Imagem] /sticker` |
| `/clima` | Relatório meteorológico em tempo real | `Usuário: /clima São Paulo` |
| `/resumo` | Resumo de chat gerado por IA | `Usuário: /resumo` |

### 🎙️ Transcrição de Áudio
O AI-Fred transcreve automaticamente cada mensagem de voz recebida:
- **Usuário:** [Mensagem de Áudio]
- **AI-Fred:** 🎤 *Transcrição de Áudio:* "Olá, gostaria de saber o horário de funcionamento de hoje."

---

## 6. Instalação & Configuração
Clone e configure em minutos:

1. **Clonar e Instalar:**
   ```bash
   git clone https://github.com/bar4si/ai-fred.git
   cd bot-whats
   npm install
   ```

2. **Configuração de Ambiente:**
   Crie um arquivo `.env` baseado no `.env.example`:
   ```env
   GEMINI_API_KEY=sua_chave_aqui
   ADMIN_ONLY=false
   ```

3. **Iniciar:**
   ```bash
   npm start
   ```

---

## 7. Roadmap Avançado
- [x] Arquitetura Multi-Bot Concorrente
- [x] Injeção de Dependência (Nível de Provedor)
- [x] Transcrição de Áudio (Gemini 1.5 Flash)
- [ ] Geração de Imagens (`/imagine`)
- [ ] Integração com Webhook da API Oficial
- [ ] Análise de Sentimento para Suporte

Desenvolvido com ❤️ para automação de alta performance.
