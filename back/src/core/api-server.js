const express = require('express');
const cors = require('cors');

const { getDatabaseStats, setBotSetting } = require('./database');

/**
 * Inicia o servidor de API para controle remoto dos bots.
 * 
 * @param {object} bots Registro global de bots.
 * @param {object} db Instância do banco de dados SQLite.
 * @param {Function} initFn Função para inicializar um novo bot.
 */
function startApiServer(bots, db, initFn) {
    const app = express();
    const port = process.env.API_PORT || 3000;

    app.use(cors());
    app.use(express.json());

    // Endpoint: Listar todos os bots e seus status
    app.get('/status', async (req, res) => {
        const status = await Promise.all(Object.keys(bots).map(async (id) => {
            const stats = await getDatabaseStats(db, id);
            return {
                id,
                status: bots[id].status,
                messages: stats.messages,
                contacts: stats.contacts,
                adminOnly: bots[id].adminOnly,
                transcriptionEnabled: bots[id].transcriptionEnabled,
                hasQr: !!bots[id].qr
            };
        }));
        res.json(status);
    });

    // Endpoint: Obter QR Code de um bot específico
    app.get('/qr/:botId', (req, res) => {
        const { botId } = req.params;
        const bot = bots[botId];

        if (!bot) {
            return res.status(404).json({ error: 'Bot não encontrado' });
        }

        if (!bot.qr) {
            return res.json({ message: 'Bot já está conectado ou aguardando autenticação' });
        }

        res.json({ qr: bot.qr });
    });

    // Endpoint: Enviar mensagem
    app.post('/send-message', async (req, res) => {
        const { botId, to, message } = req.body;
        const bot = bots[botId];

        if (!bot) {
            return res.status(404).json({ error: 'Bot não encontrado' });
        }

        if (bot.status !== 'Online ✅') {
            return res.status(400).json({ error: 'Bot offline' });
        }

        try {
            // Utilizamos o provider diretamente para enviar a mensagem
            await bot.provider.client.sendMessage(`${to}@c.us`, message);
            res.json({ success: true, message: 'Mensagem enviada com sucesso' });
        } catch (err) {
            console.error(`[API] Erro ao enviar mensagem via ${botId}:`, err);
            res.status(500).json({ error: 'Erro ao enviar mensagem', detail: err.message });
        }
    });

    // Endpoint: Criar novo bot
    app.post('/create-bot', async (req, res) => {
        const { botId } = req.body;

        if (!botId) {
            return res.status(400).json({ error: 'botId é obrigatório' });
        }

        if (bots[botId]) {
            return res.status(400).json({ error: 'Bot ja existe ou está sendo inicializado' });
        }

        try {
            console.log(`[API] Solicitando criação do bot: ${botId}`);
            // Chamamos a função de inicialização injetada
            initFn(botId);
            res.json({ success: true, message: `Bot ${botId} está sendo inicializado.` });
        } catch (err) {
            console.error(`[API] Erro ao criar bot ${botId}:`, err);
            res.status(500).json({ error: 'Erro ao criar bot', detail: err.message });
        }
    });

    // Endpoint: Alternar Privacidade
    app.post('/toggle-privacy', async (req, res) => {
        const { botId } = req.body;
        const bot = bots[botId];

        if (!bot) {
            return res.status(404).json({ error: 'Bot não encontrado' });
        }

        try {
            const newState = !bot.adminOnly;
            await setBotSetting(db, botId, 'admin_only', newState ? 1 : 0);
            bot.adminOnly = newState;

            console.log(`[API] Privacidade do bot ${botId} alterada para: ${newState ? 'PRIVADO' : 'PÚBLICO'}`);
            res.json({ success: true, adminOnly: newState });
        } catch (err) {
            console.error(`[API] Erro ao alterar privacidade do bot ${botId}:`, err);
            res.status(500).json({ error: 'Erro ao alterar privacidade', detail: err.message });
        }
    });

    app.listen(port, () => {
        console.log(`🌐 [API] Servidor rodando na porta ${port}`);
        console.log(`   🔸 GET  /status        - Lista status de todos os bots`);
        console.log(`   🔸 GET  /qr/:botId     - Obtém QR Code de um bot`);
        console.log(`   🔸 POST /send-message  - Envia mensagem manual`);
        console.log(`   🔸 POST /create-bot    - Cria uma nova instância de bot`);
        console.log(`   🔸 POST /toggle-privacy - Alterna entre Público/Privado`);
    });
}

module.exports = { startApiServer };
