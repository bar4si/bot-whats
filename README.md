# 🤖 AI-Fred: Concurrent Multi-Bot Engine

AI-Fred is a professional-grade, self-hosted WhatsApp automation engine designed to orchestrate **multiple accounts simultaneously**. Engineered with a modular, senior-level architecture, it leverages `whatsapp-web.js`, Node.js, and Google Gemini to provide a centralized hub for high-efficiency communication.

---

## 📑 Table of Contents
1. [Overview](#1-overview)
2. [Technology Stack](#2-technology-stack)
3. [Architecture & Dependency Injection](#3-architecture--dependency-injection)
4. [Concurrent Multi-Bot Core](#4-concurrent-multi-bot-core)
5. [API & Remote Control](#5-api--remote-control)
6. [Commands & Usage Examples](#6-commands--usage-examples)
7. [Installation & Configuration](#7-installation--configuration)
8. [Advanced Roadmap](#8-advanced-roadmap)

---

## 5. API & Remote Control
AI-Fred now exposes a **REST API** for external control and includes a dedicated **Console Client**.

- **API Server:** Starts automatically on port `3000`.
- **Endpoints:**
  - `GET /status`: Real-time status, statistics, and privacy mode.
  - `GET /qr/:botId`: Fetch QR Code for pending sessions.
  - `POST /send-message`: Send messages through any active bot.
- **Console Client:** Located in `cli-fred/`. Run `node index.js` for an interactive dashboard.

---

## 6. Commands & Usage Examples
| Command | Action | Example |
| :--- | :--- | :--- |
| `/ajuda` | Displays the command menu | `User: /ajuda` |
| `/status` | Connection and uptime metrics | `User: /status` |
| `/audio [on/off]` | Toggle automatic transcription | `User: /audio on` |
| `/resumo` | AI-Powered chat summarization | `User: /resumo` |

---

## 7. Installation & Configuration
...
```env
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-1.5-flash
ADMIN_ONLY=false
```
