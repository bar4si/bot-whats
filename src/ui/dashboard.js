const readline = require('readline');
const fs = require('fs');
const path = require('path');
const { getDatabaseStats, deleteBotData } = require('../core/database');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const getSessions = () => {
    const authPath = path.join(__dirname, '../../.wwebjs_auth');
    if (!fs.existsSync(authPath)) return [];
    return fs.readdirSync(authPath).filter(f => fs.lstatSync(path.join(authPath, f)).isDirectory());
};

async function showGlobalDashboard(bots, db, initializeBot, showBotMenu) {
    console.clear();
    console.log('\n🌐 --- PAINEL GLOBAL AI-FRED (MULTI-BOT) ---');

    const rawSessions = getSessions();
    const sessions = [...new Set(rawSessions.map(s => s.replace('session-', '') || 'session'))];

    // Garantir que sessões físicas estão registradas
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
    console.log('N. [CRIAR NOVA SESSÃO] | D. [APAGAR SESSÃO] | X. [SAIR]');
    console.log('--------------------------------------------');

    rl.question('Escolha: ', async (choice) => {
        const cmd = choice.toLowerCase();

        if (cmd === 'x') process.exit(0);

        if (cmd === 'n') {
            const newName = await new Promise(res => rl.question('Nome da nova sessão: ', res));
            if (newName) await initializeBot(newName);
            return showGlobalDashboard(bots, db, initializeBot, showBotMenu);
        }

        if (cmd === 'd') {
            const delChoice = await new Promise(res => rl.question('Número da sessão para APAGAR: ', res));
            const delIdx = parseInt(delChoice) - 1;
            if (delIdx >= 0 && delIdx < activeIds.length) {
                const targetId = activeIds[delIdx];
                const confirm = await new Promise(res => rl.question(`⚠️  APAGAR [${targetId}]? (s/n): `, res));
                if (confirm.toLowerCase() === 's') {
                    if (bots[targetId]) {
                        await bots[targetId].client.destroy();
                        delete bots[targetId];
                    }
                    const folders = getSessions().filter(s => s === targetId || s === `session-${targetId}`);
                    folders.forEach(f => fs.rmSync(path.join(__dirname, '../../.wwebjs_auth', f), { recursive: true, force: true }));
                    await deleteBotData(db, targetId);
                    console.log('✅ Sessão eliminada.');
                }
            }
            return showGlobalDashboard(bots, db, initializeBot, showBotMenu);
        }

        const idx = parseInt(choice) - 1;
        if (idx >= 0 && idx < activeIds.length) {
            return showBotMenu(activeIds[idx]);
        }

        showGlobalDashboard(bots, db, initializeBot, showBotMenu);
    });
}

module.exports = { showGlobalDashboard, rl };
