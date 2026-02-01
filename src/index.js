const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { setupDatabase, listMessages, listUniqueUsers, cleanupDatabase, pruneMessages, clearAllMessages, saveContact, deleteBotData, getDatabaseStats, getBotSetting, setBotSetting } = require('./database');
const { handleCommand } = require('./commands');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Registro Global de Bots
const bots = {};
let db;

// --- UTILITÁRIOS ---
const getSessions = () => {
    const authPath = path.join(__dirname, '../.wwebjs_auth');
    if (!fs.existsSync(authPath)) return [];
    return fs.readdirSync(authPath).filter(f => fs.lstatSync(path.join(authPath, f)).isDirectory());
};

// --- CORE: INICIALIZAÇÃO DE UM BOT ---
async function initializeBot(botId) {
    if (bots[botId]) return;

    const client = new Client({
        authStrategy: new LocalAuth({ clientId: botId }),
        puppeteer: { args: ['--no-sandbox'] }
    });

    bots[botId] = {
        client,
        status: 'Iniciando...',
        lastStats: { messages: 0, contacts: 0 },
        adminOnly: (await getBotSetting(db, botId, 'admin_only', 0)) === 1
    };

    client.on('qr', (qr) => {
        bots[botId].status = 'Aguardando QR Code 📱';
        bots[botId].qr = qr;
    });

    client.on('authenticated', () => {
        bots[botId].status = 'Autenticado! ✨';
        bots[botId].qr = null;
    });

    client.on('auth_failure', (msg) => {
        bots[botId].status = 'Falha na Autenticação ⚠️';
    });

    client.on('loading_screen', (percent, message) => {
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
        const chatId = msg.fromMe ? msg.to : msg.from;
        if (!chatId || !chatId.endsWith('@c.us')) return;

        // 1. Salvar no histórico
        try {
            if (!msg.fromMe) {
                const contact = await msg.getContact();
                await saveContact(db, botId, chatId, contact.pushname || null);
            }
            await db.run(
                'INSERT INTO messages (whatsapp_id, from_number, body, is_from_me, bot_id) VALUES (?, ?, ?, ?, ?)',
                [msg.id.id, chatId, msg.body, msg.fromMe ? 1 : 0, botId]
            );
            await pruneMessages(db, chatId, 50);
        } catch (err) { }

        // 2. Detecção de Comando (Sempre processa "fred" se for o dono ou modo público)
        const isTriggerFred = msg.body.toLowerCase() === 'fred';
        const isCommand = await handleCommand(msg);

        // Se NÃO for comando e for msg enviada pelo bot (fromMe), ignoramos o resto do fluxo
        if (!isTriggerFred && !isCommand && msg.fromMe) return;

        // 3. Restrição de Admin (Só afeta quem NÃO é o dono)
        const isAdminOnly = bots[botId].adminOnly;
        if (isAdminOnly && !msg.fromMe && msg.from !== client.info.wid._serialized) {
            return;
        }

        // Se já processou handleCommand no passo 2, saímos daqui
        if (isCommand) return;

        // Responder ao "fred"
        if (isTriggerFred) {
            const { simulateTyping, delay } = require('./utils');
            await delay(500, 1500);
            await simulateTyping(msg, 1500);
            msg.reply('Olá! Eu sou o AI-Fred. Como posso ajudar?\n\nDigite */ajuda*.');
        }
    });

    client.initialize();
}

// --- UI: PAINEL GLOBAL ---
async function showGlobalDashboard() {
    console.clear();
    console.log('\n🌐 --- PAINEL GLOBAL AI-FRED (MULTI-BOT) ---');
    const rawSessions = getSessions();
    const sessions = [...new Set(rawSessions.map(s => s.replace('session-', '') || 'session'))];

    // Garantir que todas as sessões físicas foram carregadas
    for (const s of sessions) {
        if (!bots[s]) await initializeBot(s);
    }

    const activeIds = Object.keys(bots);
    if (activeIds.length === 0) {
        console.log('Nenhum bot configurado.');
    } else {
        console.log('Bots Ativos:');
        for (let i = 0; i < activeIds.length; i++) {
            const id = activeIds[i];
            const bot = bots[id];
            const stats = await getDatabaseStats(db, id);
            console.log(`${i + 1}. [${id}] Status: ${bot.status} | 📊 ${stats.contacts} contatos, ${stats.messages} msgs`);
        }
    }

    console.log('--------------------------------------------');
    console.log('Pressione [ENTER] para atualizar os status.');
    console.log('--------------------------------------------');
    console.log('N. [CRIAR NOVA SESSÃO]');
    console.log('D. [APAGAR UMA SESSÃO]');
    console.log('X. [SAIR DO PROGRAMA]');
    console.log('--------------------------------------------');

    rl.question('Escolha um número ou ENTER para atualizar: ', async (choice) => {
        const cmd = choice.toLowerCase();

        if (cmd === 'x') {
            console.log('Encerrando...');
            process.exit(0);
        }

        if (cmd === 'n') {
            const newName = await new Promise(resolve => rl.question('Nome da nova sessão: ', resolve));
            if (newName) await initializeBot(newName);
            return showGlobalDashboard();
        }

        if (cmd === 'd') {
            const delChoice = await new Promise(resolve => rl.question('Número da sessão para APAGAR: ', resolve));
            const delIdx = parseInt(delChoice) - 1;
            if (delIdx >= 0 && delIdx < activeIds.length) {
                const targetId = activeIds[delIdx];
                const confirm = await new Promise(resolve => rl.question(`⚠️  APAGAR [${targetId}]? (s/n): `, resolve));
                if (confirm.toLowerCase() === 's') {
                    if (bots[targetId]) {
                        await bots[targetId].client.destroy();
                        delete bots[targetId];
                    }
                    const folders = getSessions().filter(s => s === targetId || s === `session-${targetId}`);
                    folders.forEach(f => fs.rmSync(path.join(__dirname, '../.wwebjs_auth', f), { recursive: true, force: true }));
                    await deleteBotData(db, targetId);
                    console.log('✅ Sessão eliminada.');
                }
            }
            return showGlobalDashboard();
        }

        const idx = parseInt(choice) - 1;
        if (idx >= 0 && idx < activeIds.length) {
            const targetId = activeIds[idx];
            return showBotMenu(targetId);
        }

        showGlobalDashboard();
    });
}

// --- UI: MENU ESPECÍFICO DO BOT ---
async function showBotMenu(botId) {
    const bot = bots[botId];
    if (!bot) return showGlobalDashboard();

    // Se estiver aguardando QR, mostrar QR
    if (bot.qr) {
        console.clear();
        console.log(`\n� --- QR CODE: [${botId}] ---`);
        qrcode.generate(bot.qr, { small: true });
        console.log('\nEscaneie para conectar. Pressione ENTER para voltar.');
        await new Promise(resolve => rl.question('', resolve));
        return showGlobalDashboard();
    }

    const stats = await getDatabaseStats(db, botId);
    console.clear();
    console.log(`\n--- 🛠️  GERENCIANDO: [${botId}] ---`);
    console.log(`Status: ${bot.status}`);
    console.log(`📊 Banco: ${stats.contacts} Contatos | ${stats.messages} Mensagens`);
    console.log('---------------------------');
    console.log('1. Listar Contatos');
    console.log('2. Ver Histórico (Top 30)');
    console.log('3. Status Detalhado');
    console.log('4. Executar Faxina');
    console.log('5. Apagar Mensagens (Reset)');
    console.log(`6. Modo: ${bot.adminOnly ? '🔒 PRIVADO' : '🌐 PÚBLICO'}`);
    console.log('9. VOLTAR AO PAINEL GLOBAL');
    console.log('---------------------------');

    rl.question('Escolha: ', async (opt) => {
        if (!opt) return showBotMenu(botId); // Refresh

        switch (opt) {
            case '1':
                const users = await listUniqueUsers(db, botId);
                console.log('\n📇 CONTATOS:');
                users.forEach(u => console.log(`- ${u.contact_name || 'Sem Nome'} (${u.from_number})`));
                break;
            case '2':
                const msgs = await listMessages(db, botId);
                console.log('\n📊 ÚLTIMAS MENSAGENS:');
                const profileName = bot.client.info ? bot.client.info.pushname : 'Fred';
                msgs.forEach(m => {
                    const contact = m.contact_name ? `${m.contact_name} (${m.from_number})` : m.from_number;
                    const direction = m.is_from_me ? `🔹 [${profileName}] -> ${contact}` : `${contact} -> 🔹 [${profileName}]`;
                    console.log(`[${m.timestamp}] ${direction}: ${m.body.substring(0, 50).replace(/\n/g, ' ')}`);
                });
                break;
            case '3':
                console.log('\n📡 STATUS:');
                if (bot.client.info) console.log(`- Nome: ${bot.client.info.pushname}\n- Número: ${bot.client.info.wid.user}`);
                else console.log('- Bot ainda não está pronto.');
                break;
            case '4':
                await cleanupDatabase(db, botId);
                break;
            case '5':
                const confirm = await new Promise(resolve => rl.question('⚠️ Resetar mensagens? (s/n): ', resolve));
                if (confirm.toLowerCase() === 's') await clearAllMessages(db, botId);
                return showBotMenu(botId);
            case '6':
                const newMode = !bot.adminOnly;
                bot.adminOnly = newMode;
                await setBotSetting(db, botId, 'admin_only', newMode ? 1 : 0);
                console.log(`✅ Modo alterado para: ${newMode ? '🔒 PRIVADO' : '🌐 PÚBLICO'}`);
                break;
            case '9':
                return showGlobalDashboard();
        }
        console.log('\nPressione ENTER para continuar...');
        await new Promise(resolve => rl.question('', resolve));
        showBotMenu(botId);
    });
}

// --- START ---
async function start() {
    db = await setupDatabase();

    // Boot inicial de todas as sessões conhecidas
    const rawSessions = getSessions();
    const sessions = [...new Set(rawSessions.map(s => s.replace('session-', '') || 'session'))];

    console.log(`\n📦 Carregando ${sessions.length} sessões...`);
    for (const s of sessions) {
        await initializeBot(s);
    }

    showGlobalDashboard();
}

start().catch(err => console.error('❌ Erro Fatal:', err));
