# 🤖 Plano de Implementação: AI-Fred (WhatsApp Bot)

Este documento estabelece a arquitetura, stack tecnológica e o roteiro de desenvolvimento para o bot de WhatsApp **AI-Fred**.

---

## 📑 Índice
1. [Visão Geral](#1-visão-geral)
2. [Stack Tecnológica](#2-stack-tecnológica)
3. [Funcionamento e Contas](#3-funcionamento-e-contas)
4. [Fases de Desenvolvimento](#4-fases-de-desenvolvimento)
5. [Exemplos de Uso](#5-exemplos-de-uso)

---

## 1. Visão Geral
O **AI-Fred** é projetado para ser um assistente inteligente e responsivo, operando diretamente no ecossistema do WhatsApp. O foco inicial é a estabilidade da conexão e a eficiência na gestão de mensagens.

---

## 2. Stack Tecnológica
A escolha da stack prioriza a robustez da integração web e a facilidade de manutenção.

| Componente | Tecnologia | Observação |
| :--- | :--- | :--- |
| **Runtime** | `Node.js (v18+)` | Escalabilidade e I/O não bloqueante. |
| **Provider** | `whatsapp-web.js` | Integração via browser-level (estável). |
| **Persistence** | `SQLite` | Leve, sem necessidade de servidor dedicado. |
| **AI (Future)** | `Google Gemini` | Potencial de processamento de linguagem natural. |

---

## 3. Funcionamento e Contas
> [!IMPORTANT]
> O AI-Fred utiliza a tecnologia de espelhamento do WhatsApp Web para operar.

### 📲 Em qual conta ele estará?
O bot funcionará em **qualquer conta de WhatsApp existente** que você escolher vincular. Pode ser um número pessoal ou um WhatsApp Business.

### 🔑 Como funciona a conexão?
1. **QR Code:** Ao iniciar o bot pela primeira vez, ele gerará um QR Code no terminal.
2. **Vinculação:** Você abre o WhatsApp no seu celular → Configurações → Aparelhos Conectados → Conectar um Aparelho.
3. **Persistência:** Uma vez feita a leitura, o bot salva a sessão localmente. Ele continuará operando mesmo que o celular perca a conexão temporariamente.

---

## 4. Fases de Desenvolvimento
O detalhamento técnico de cada tarefa e o status de implementação podem ser acompanhados no arquivo de acompanhamento:

👉 **[Acesse o todo.md](./todo.md)**

---

## 5. Exemplos de Uso
> [!NOTE]
> Para funcionalidades dinâmicas como clima e cotação, o AI-Fred utiliza **APIs REST externas** (ex: OpenWeather). A IA (Fase 4+) será usada apenas para conversação natural e interpretação de áudio.

### 🛠️ Comandos de Utilidade
- **Usuário:** `/resumo`
- **AI-Fred:** "Aqui está o resumo das últimas 20 mensagens desta conversa..."
- **Usuário:** `/ajuda`
- **AI-Fred:** "Comandos disponíveis: /resumo, /status, /clima, /docs. Como posso ajudar?"

### 🌐 Pesquisa e Dados
- **Usuário:** "/clima São Paulo"
- **AI-Fred:** "Agora em SP: 22°C, Nublado. Chance de chuva: 15%."
- **Usuário:** "Qual a cotação do Dólar agora?"
- **AI-Fred:** "O Dólar está cotado em R$ 5,12 (Atualizado há 5 min)."

### 📊 Consulta de Dados
- **Usuário:** `/status`
- **AI-Fred:** "Sistema online. Uptime: 48h. Mensagens processadas hoje: 157."

---

## 6. Funcionalidades Inovadoras (Roadmap)
> [!TIP]
> Além das funções básicas, o AI-Fred será equipado com utilitários de alta performance.

| Funcionalidade | Comando | Descrição |
| :--- | :--- | :--- |
| **Sticker Maker** | [Imagem] | Converte imagens em figurinhas na hora. |
| **Media DL** | `/dl [url]` | Download de vídeos de redes sociais. |
| **Rastreio** | `/rastreio [cod]` | Monitoramento automático de encomendas. |
| **WebShot** | `/print [url]` | Screenshot de sites via bot. |
| **Preço Alvo** | `/monitor [url]` | Alerta de queda de preço em e-commerce. |
