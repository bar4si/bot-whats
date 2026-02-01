const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function setupDatabase() {
    const db = await open({
        filename: path.join(__dirname, '../database.sqlite'),
        driver: sqlite3.Database
    });

    // 1. Tabela de Mensagens
    await db.exec(`
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            whatsapp_id TEXT UNIQUE,
            from_number TEXT,
            body TEXT,
            is_from_me INTEGER DEFAULT 0,
            bot_id TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 2. Tabela de Configurações (Per-Bot)
    await db.exec(`
        CREATE TABLE IF NOT EXISTS bot_settings (
            bot_id TEXT PRIMARY KEY,
            admin_only INTEGER DEFAULT 0
        )
    `);

    // 2. Tabela de Contatos (Verificação Profunda)
    const tableInfo = await db.all("PRAGMA table_info(contacts)");
    const pkColumns = tableInfo.filter(c => c.pk > 0);

    // Se a tabela não existe ou a PK não é composta (jid, bot_id), precisamos reconstruir
    if (tableInfo.length === 0 || pkColumns.length < 2) {
        console.log('🔄 Reconstruindo tabela de contatos para suportar multi-bot...');

        // Backup temporário se a tabela existir
        if (tableInfo.length > 0) {
            await db.exec(`ALTER TABLE contacts RENAME TO contacts_old`);
        }

        await db.exec(`
            CREATE TABLE contacts (
                jid TEXT,
                pushname TEXT,
                bot_id TEXT,
                last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (jid, bot_id)
            )
        `);

        if (tableInfo.length > 0) {
            try {
                // Tenta migrar dados antigos
                await db.exec(`INSERT OR IGNORE INTO contacts (jid, pushname, bot_id, last_seen) 
                               SELECT jid, pushname, IFNULL(bot_id, 'session'), last_seen FROM contacts_old`);
                await db.exec(`DROP TABLE contacts_old`);
            } catch (e) {
                console.log('⚠️  Não foi possível migrar dados antigos, iniciando nova tabela.');
            }
        }
    }

    // Migrações de colunas nas mensagens
    const msgInfo = await db.all("PRAGMA table_info(messages)");
    if (!msgInfo.some(c => c.name === 'bot_id')) {
        await db.exec("ALTER TABLE messages ADD COLUMN bot_id TEXT DEFAULT 'session'");
    }

    console.log('✅ Banco de dados SQLite inicializado.');
    return db;
}

async function listMessages(db, bot_id) {
    try {
        const messages = await db.all(`
            SELECT m.*, c.pushname as contact_name 
            FROM messages m
            LEFT JOIN contacts c ON m.from_number = c.jid AND m.bot_id = c.bot_id
            WHERE m.bot_id = ?
            ORDER BY m.timestamp DESC 
            LIMIT 30
        `, [bot_id]);
        return messages;
    } catch (err) {
        console.error('Erro ao listar mensagens:', err.message);
        return [];
    }
}

async function saveContact(db, bot_id, jid, pushname) {
    try {
        await db.run(`
            INSERT INTO contacts (jid, pushname, bot_id, last_seen) 
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(jid, bot_id) DO UPDATE SET 
                pushname = COALESCE(?, pushname),
                last_seen = CURRENT_TIMESTAMP
        `, [jid, pushname, bot_id, pushname]);
    } catch (err) {
        // Se ainda der erro de conflito, logamos os detalhes para depurar
        console.error('Erro ao salvar contato:', err.message);
    }
}

async function listUniqueUsers(db, bot_id) {
    try {
        const users = await db.all('SELECT jid as from_number, pushname as contact_name FROM contacts WHERE bot_id = ? ORDER BY last_seen DESC', [bot_id]);
        return users;
    } catch (err) {
        console.error('Erro ao listar usuários únicos:', err.message);
        return [];
    }
}

async function cleanupDatabase(db, bot_id) {
    try {
        const msgRes = await db.run("DELETE FROM messages WHERE from_number NOT LIKE '%@c.us%' AND bot_id = ?", [bot_id]);
        const contRes = await db.run("DELETE FROM contacts WHERE jid NOT LIKE '%@c.us%' AND bot_id = ?", [bot_id]);
        if (msgRes.changes > 0 || contRes.changes > 0) {
            console.log(`🧹 Limpeza completa [${bot_id}]: ${msgRes.changes} msgs e ${contRes.changes} contatos removidos.`);
        }
    } catch (err) {
        console.error('Erro na limpeza do banco:', err.message);
    }
}

async function pruneMessages(db, from_number, limit = 50) {
    try {
        await db.run(`
            DELETE FROM messages 
            WHERE from_number = ? AND id NOT IN (
                SELECT id FROM messages 
                WHERE from_number = ? 
                ORDER BY timestamp DESC 
                LIMIT ?
            )
        `, [from_number, from_number, limit]);
    } catch (err) {
        console.error(`Erro ao podar mensagens para ${from_number}:`, err.message);
    }
}

async function clearAllMessages(db, bot_id) {
    try {
        const result = await db.run('DELETE FROM messages WHERE bot_id = ?', [bot_id]);
        console.log(`\n🗑️  Banco de mensagens limpo para ${bot_id}. ${result.changes} entradas removidas.`);
    } catch (err) {
        console.error('Erro ao limpar banco de mensagens:', err.message);
    }
}

async function deleteBotData(db, bot_id) {
    try {
        const msgRes = await db.run('DELETE FROM messages WHERE bot_id = ?', [bot_id]);
        const contRes = await db.run('DELETE FROM contacts WHERE bot_id = ?', [bot_id]);
        console.log(`\n🧹 Dados removidos do banco para [${bot_id}]: ${msgRes.changes} msgs, ${contRes.changes} contatos.`);
    } catch (err) {
        console.error('Erro ao deletar dados do bot:', err.message);
    }
}

async function getDatabaseStats(db, bot_id) {
    try {
        const msgCount = await db.get('SELECT COUNT(*) as total FROM messages WHERE bot_id = ?', [bot_id]);
        const contCount = await db.get('SELECT COUNT(*) as total FROM contacts WHERE bot_id = ?', [bot_id]);
        return {
            messages: msgCount.total,
            contacts: contCount.total
        };
    } catch (err) {
        console.error('Erro ao obter estatísticas do banco:', err.message);
        return { messages: 0, contacts: 0 };
    }
}

async function getBotSetting(db, bot_id, key, defaultValue = 0) {
    try {
        const row = await db.get('SELECT * FROM bot_settings WHERE bot_id = ?', [bot_id]);
        if (!row) return defaultValue;
        return row[key] !== undefined ? row[key] : defaultValue;
    } catch (err) {
        return defaultValue;
    }
}

async function setBotSetting(db, bot_id, key, value) {
    try {
        await db.run(`
            INSERT INTO bot_settings (bot_id, ${key}) VALUES (?, ?)
            ON CONFLICT(bot_id) DO UPDATE SET ${key} = ?
        `, [bot_id, value, value]);
    } catch (err) {
        console.error('Erro ao salvar configuração:', err.message);
    }
}

module.exports = {
    setupDatabase,
    listMessages,
    listUniqueUsers,
    cleanupDatabase,
    pruneMessages,
    clearAllMessages,
    saveContact,
    deleteBotData,
    getDatabaseStats,
    getBotSetting,
    setBotSetting
};
