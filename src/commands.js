require('dotenv').config();
const axios = require('axios');
const { MessageMedia } = require('whatsapp-web.js');

/**
 * Centralize all bot commands here.
 */

const commands = {
    '/status': async (msg) => {
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        await msg.reply(`🤖 *AI-Fred Status*\n\n✅ Sistema: Online\n⏳ Uptime: ${hours}h ${minutes}m\n📡 Conexão: Estável`);
    },

    '/ajuda': async (msg) => {
        const helpText = `🤖 *Comandos do AI-Fred*\n\n` +
            `*/status* - Verifica o estado do bot.\n` +
            `*/sticker* - Cria figurinha de uma imagem (use na legenda ou responda a uma foto).\n` +
            `*/clima [cidade]* - Consulta o clima atual.\n` +
            `*/resumo* - Gera um resumo das mensagens recentes.\n` +
            `*/ajuda* - Mostra esta lista.`;
        await msg.reply(helpText);
    },

    '/sticker': async (msg) => {
        let media;

        try {
            // 1. Verificar se a mensagem atual tem mídia
            if (msg.hasMedia) {
                console.log('[Sticker] Baixando mídia da mensagem direta...');
                media = await msg.downloadMedia();
            }
            // 2. Verificar se está respondendo a uma mensagem com mídia
            else if (msg.hasQuotedMsg) {
                console.log('[Sticker] Verificando mensagem respondida...');
                const quotedMsg = await msg.getQuotedMessage();
                if (quotedMsg.hasMedia) {
                    console.log('[Sticker] Baixando mídia da mensagem respondida...');
                    media = await quotedMsg.downloadMedia();
                }
            }

            if (!media || !media.mimetype.startsWith('image/')) {
                console.log('[Sticker] Mídia inválida ou inexistente.');
                return msg.reply('❌ Por favor, envie uma imagem com a legenda `/sticker` ou responda a uma imagem existente.');
            }

            console.log('[Sticker] Convertendo usando o método nativo...');
            await msg.reply('⏳ Criando sua figurinha...');

            // Método nativo: Enviar a mídia com sendMediaAsSticker: true
            await msg.reply(media, null, { sendMediaAsSticker: true });
            console.log('[Sticker] Enviado com sucesso.');
        } catch (error) {
            console.error('[Sticker] Erro detalhado:', error);
            await msg.reply('❌ Tive um problema ao converter essa imagem em figurinha. Tente novamente mais tarde.');
        }
    },

    '/clima': async (msg, args) => {
        if (args.length === 0) {
            return msg.reply('❌ Por favor, informe uma cidade. Ex: `/clima São Paulo`');
        }

        const city = args.join(' ');

        try {
            // HG Brasil Weather API (Free tier doesn't strictly require key for some requests, but it's limited)
            const response = await axios.get(`https://api.hgbrasil.com/weather?format=json-array&fields=only_results,temp,city_name,description,humidity,wind_speedy,date,time&city_name=${encodeURIComponent(city)}`);

            const data = response.data.results;

            if (!data || data.city_name === 'Cidade não encontrada') {
                return msg.reply(`❌ Não consegui encontrar informações para *${city}*. Verifique o nome e tente novamente.`);
            }

            const weatherMsg = `🌤️ *Clima em ${data.city_name}*\n\n` +
                `🌡️ *Temperatura:* ${data.temp}°C\n` +
                `☁️ *Condição:* ${data.description}\n` +
                `💧 *Umidade:* ${data.humidity}%\n` +
                `💨 *Vento:* ${data.wind_speedy}\n\n` +
                `🕒 _Atualizado em ${data.date} às ${data.time}_`;

            await msg.reply(weatherMsg);
        } catch (error) {
            console.error('Erro na API de Clima:', error.message);
            await msg.reply('❌ Desculpe, tive um problema ao consultar o clima agora. Tente novamente em instantes.');
        }
    },

    '/resumo': async (msg) => {
        // Placeholder for future AI integration (Phase 4)
        await msg.reply(`📝 Analisando conversas recentes para gerar o resumo...\n\n(Funcionalidade em desenvolvimento - Integração com Google Gemini em breve)`);
    }
};

const { simulateTyping, delay } = require('./utils');

/**
 * Parses and executes a command if it exists.
 * @param {import('whatsapp-web.js').Message} msg 
 */
async function handleCommand(msg) {
    if (!msg.body.startsWith('/')) return false;

    const [cmd, ...args] = msg.body.trim().split(/\s+/);
    const commandFn = commands[cmd.toLowerCase()];

    if (commandFn) {
        console.log(`[Command] Executing ${cmd} for ${msg.from}`);

        // Simular comportamento humano antes de responder comando
        await delay(500, 1500); // Espera um pouco antes de começar a digitar
        await simulateTyping(msg, 2000); // Digita por 2 segundos

        await commandFn(msg, args);
        return true;
    }

    return false;
}

module.exports = { handleCommand };
