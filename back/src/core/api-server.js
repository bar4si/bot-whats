const express = require('express');
const cors = require('cors');

/**
 * Inicia o servidor de API para controle remoto dos bots.
 * 
 * @param {object} bots Registro global de bots.
 * @param {object} db Instância do banco de dados SQLite.
 */
function startApiServer(bots, db) {
    const app = express();
    const port = process.env.API_PORT || 3000;

    app.use(cors());
    app.use(express.json());

    // Endpoint: Listar todos os bots e seus status
    app.get('/status', (req, res) => {
        const status = Object.keys(bots).map(id => ({
            id,
            status: bots[id].status,
            messages: bots[id].lastStats.messages,
            contacts: bots[id].lastStats.contacts,
            adminOnly: bots[id].adminOnly,
            hasQr: !!bots[id].qr
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

    app.listen(port, () => {
        console.log(`🌐 [API] Servidor rodando na porta ${port}`);
    });
}

module.exports = { startApiServer };
