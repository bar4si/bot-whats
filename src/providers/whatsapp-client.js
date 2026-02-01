const { Client, LocalAuth } = require('whatsapp-web.js');

/**
 * Creates a new WhatsApp Client instance with standard configuration.
 * @param {string} botId 
 */
function createClient(botId) {
    return new Client({
        authStrategy: new LocalAuth({ clientId: botId }),
        puppeteer: {
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            // Se estiver no Windows, as vezes o puppeteer precisa de ajuda para achar o Chrome,
            // mas o padrão costuma funcionar bem.
        }
    });
}

module.exports = { createClient };
