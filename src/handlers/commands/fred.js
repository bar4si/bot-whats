/**
 * Comando: fred
 * Descrição: Gatilho de interação natural (sem prefixo).
 */
module.exports = {
    name: 'fred',
    isKeyword: true, // Indica que este comando não exige o prefixo '/'
    execute: async (msg) => {
        const { simulateTyping, delay } = require('../../utils/humanizer');
        await delay(500, 1500);
        await simulateTyping(msg, 1500);
        msg.reply('Olá! Eu sou o AI-Fred. Como posso ajudar?\n\nDigite */ajuda*.');
    }
};
