const { createClient } = require('../providers/whatsapp-client');
const { getBotSetting, cleanupDatabase } = require('./database');
const { handleMessage } = require('../handlers/message-handler');

const bots = {};
let db;

/**
 * Initializes a bot instance and sets up event listeners.
 * @param {string} botId 
 */
async function initializeBot(botId, database) {
    if (bots[botId]) return;
    db = database;

    const client = createClient(botId);

    bots[botId] = {
        client,
        status: 'Iniciando...',
        lastStats: { messages: 0, contacts: 0 },
        adminOnly: (await getBotSetting(db, botId, 'admin_only', 0)) === 1,
        qr: null
    };

    // Event Handlers
    client.on('qr', (qr) => {
        bots[botId].status = 'Aguardando QR Code 📱';
        bots[botId].qr = qr;
    });

    client.on('authenticated', () => {
        bots[botId].status = 'Autenticado! ✨';
        bots[botId].qr = null;
    });

    client.on('loading_screen', (percent) => {
        bots[botId].status = `Carregando (${percent}%) ⏳`;
    });

    client.on('ready', () => {
        bots[botId].status = 'Online ✅';
        bots[botId].qr = null;
        cleanupDatabase(db, botId);
    });

    client.on('disconnected', () => {
        bots[botId].status = 'Desconectado ❌';
    });

    client.on('message_create', async (msg) => {
        await handleMessage(msg, botId, bots, db);
    });

    client.initialize();
}

const getBots = () => bots;

module.exports = { initializeBot, getBots };
