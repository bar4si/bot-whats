# 🤖 AI-Fred: Concurrent Multi-Bot Engine

AI-Fred is a professional-grade, self-hosted WhatsApp automation engine designed to orchestrate **multiple accounts simultaneously**. Engineered with a modular, senior-level architecture, it leverages `whatsapp-web.js`, Node.js, and Google Gemini to provide a centralized hub for high-efficiency communication.

---

## 📑 Table of Contents
1. [Overview](#1-overview)
2. [Technology Stack](#2-technology-stack)
3. [Architecture & Dependency Injection](#3-architecture--dependency-injection)
4. [Concurrent Multi-Bot Core](#4-concurrent-multi-bot-core)
5. [Commands & Usage Examples](#5-commands--usage-examples)
6. [Installation & Configuration](#6-installation--configuration)
7. [Advanced Roadmap](#7-advanced-roadmap)

---

## 1. Overview
AI-Fred isn't just a bot; it's an **engine**. It focuses on stability, isolation of data, and advanced AI integration. Whether you're managing support lines or personal automation, AI-Fred provides a premium CLI experience to monitor and interact with every instance in real-time.

> [!TIP]
> Use the Global Dashboard to monitor the health and throughput of all your active sessions at a single glance.

---

## 2. Technology Stack
The stack is chosen for maximum performance and low footprint:
- **Runtime:** [Node.js (v18+)](https://nodejs.org/) - High-performance asynchronous execution.
- **WhatsApp Library:** [`whatsapp-web.js`](https://wwebjs.dev/) - Browser-level integration for stability.
- **Database:** [SQLite 3](https://www.sqlite.org/) - Lightweight, per-bot data persistence.
- **AI Engine:** [Google Gemini API](https://ai.google.dev/) - Advanced transcription and NLP.
- **Utilities:** `wa-sticker-formatter` (Stickers), `axios` (REST), `qrcode-terminal` (QR display).

---

## 3. Architecture & Dependency Injection
AI-Fred follows a **Symmetric Multi-Provider** pattern. By using **Dependency Injection**, the core logic is decoupled from the underlying WhatsApp library.

- **Modular Handlers:** Commands and messages are separated from the connection logic.
- **Provider Interface:** Allows seamless toggling between `whatsapp-web.js` and the **Official WhatsApp Cloud API**.
- **Data Isolation:** Each session has its own directory and database scope, preventing cross-account leaks.

---

## 4. Concurrent Multi-Bot Core
Unlike traditional bots that run in sequence, AI-Fred initializes all sessions in **parallel**.
- **Global Dashboard:** Central command center for multi-session monitoring.
- **Auto-Recovery:** Detects disconnections and attempts to restore sessions without human intervention.
- **Session Manager:** Create (`N`), Delete (`D`), or individual Bot Menus directly from the CLI.

---

## 5. Commands & Usage Examples
AI-Fred comes equipped with powerful utilities out of the box.

| Command | Action | Example |
| :--- | :--- | :--- |
| `/ajuda` | Displays the command menu | `User: /ajuda` |
| `/status` | Connection and uptime metrics | `User: /status` |
| `/sticker` | Image-to-Sticker conversion | `User: [Sends Image] /sticker` |
| `/clima` | Real-time weather reporting | `User: /clima São Paulo` |
| `/resumo` | AI-Powered chat summarization | `User: /resumo` |

### 🎙️ Audio Transcription
AI-Fred automatically transcribes every voice message received:
- **User:** [Audio Message]
- **AI-Fred:** 🎤 *Audio Transcription:* "Hello, I wanted to know the opening hours for today."

---

## 6. Installation & Configuration
Clone and deploy in minutes:

1. **Clone & Install:**
   ```bash
   git clone https://github.com/bar4si/ai-fred.git
   cd bot-whats
   npm install
   ```

2. **Environment Setup:**
   Create a `.env` file based on `.env.example`:
   ```env
   GEMINI_API_KEY=your_key_here
   ADMIN_ONLY=false
   ```

3. **Launch:**
   ```bash
   npm start
   ```

---

## 7. Advanced Roadmap
- [x] Concurrent Multi-Bot Architecture
- [x] Dependency Injection (Provider Level)
- [x] Audio Transcription (Gemini 1.5 Flash)
- [ ] Image Generation (`/imagine`)
- [ ] Official API Webhook Integration
- [ ] Sentiment Analysis for Support Sessions

Developed with ❤️ for high-performance automation.
