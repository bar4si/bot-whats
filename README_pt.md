# 🤖 AI-Fred: Motor de Multi-Bots Concorrentes

O AI-Fred é um motor de automação de WhatsApp de nível profissional, projetado para orquestrar **múltiplas contas simultaneamente**. Desenvolvido com uma arquitetura modular de alto padrão, ele utiliza `whatsapp-web.js`, Node.js e Google Gemini para oferecer um centro de comando centralizado para comunicações de alta eficiência.

---

## 📑 Índice
1. [Visão Geral](#1-visão-geral)
2. [Stack Tecnológica](#2-stack-tecnológica)
3. [Arquitetura & Injeção de Dependência](#3-arquitetura--injeção-de-dependência)
4. [Núcleo Multi-Bot Concorrente](#4-núcleo-multi-bot-concorrente)
5. [API & Controle Remoto](#5-api--controle-remoto)
6. [Comandos & Exemplos de Uso](#6-comandos--exemplos-de-uso)
7. [Instalação & Configuração](#7-instalação--configuração)
8. [Roadmap Avançado](#8-roadmap-avançado)

---

## 5. API & Controle Remoto
O AI-Fred agora expõe uma **API REST** para controle externo e possui um **Console Client** dedicado.

- **API Server:** Inicia automaticamente na porta `3000`.
- **Endpoints:**
  - `GET /status`: Status em tempo real, estatísticas e modo de privacidade.
  - `GET /qr/:botId`: Obtem o QR Code de uma sessão pendente.
  - `POST /send-message`: Envia mensagens através de qualquer bot ativo.
- **Console Client:** Localizado em `cli-fred/`. Utilize `node index.js` para um painel interativo.

---

## 6. Comandos & Exemplos de Uso
| Comando | Ação | Exemplo |
| :--- | :--- | :--- |
| `/ajuda` | Exibe o menu de comandos | `Usuário: /ajuda` |
| `/status` | Métricas de conexão e uptime | `Usuário: /status` |
| `/audio [on/off]` | Ativa/desativa transcrição automática | `Usuário: /audio on` |
| `/resumo` | Resumo de chat gerado por IA | `Usuário: /resumo` |

---

## 7. Instalação & Configuração
...
```env
GEMINI_API_KEY=sua_chave_aqui
GEMINI_MODEL=gemini-1.5-flash
ADMIN_ONLY=false
```
