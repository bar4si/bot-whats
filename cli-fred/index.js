const axios = require('axios');
const chalk = require('chalk');
const inquirer = require('inquirer');
const qrcode = require('qrcode-terminal');

const API_URL = 'http://localhost:3000';

/**
 * Função principal do Cliente Console.
 */
async function main() {
    console.clear();
    console.log(chalk.cyan('--------------------------------------------'));
    console.log(chalk.bold.white('      🚀 AI-FRED CONSOLE CLIENT 🚀         '));
    console.log(chalk.cyan('--------------------------------------------'));

    while (true) {
        const { action } = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'O que deseja fazer?',
                choices: [
                    { name: '📊 Ver Status dos Bots', value: 'status' },
                    { name: '🆕 Criar Novo Bot', value: 'create' },
                    { name: '🔒 Alterar Privacidade', value: 'privacy' },
                    { name: '🔗 Visualizar QR Code', value: 'qr' },
                    { name: '✉️  Enviar Mensagem Manual', value: 'send' },
                    { name: '❌ Sair', value: 'exit' }
                ]
            }
        ]);

        if (action === 'exit') break;

        try {
            if (action === 'status') {
                await showStatus();
            } else if (action === 'create') {
                await createBot();
            } else if (action === 'privacy') {
                await togglePrivacy();
            } else if (action === 'qr') {
                await viewQrCode();
            } else if (action === 'send') {
                await sendMessage();
            }
        } catch (err) {
            console.error(chalk.red('\n❌ Erro de conexão com a API:'), err.message);
        }

        console.log(chalk.cyan('\n--------------------------------------------'));
    }
}

async function showStatus() {
    const res = await axios.get(`${API_URL}/status`);
    const bots = res.data;

    if (bots.length === 0) {
        console.log(chalk.yellow('\nNenhum bot encontrado no momento.'));
        return;
    }

    console.log(chalk.bold.underline('\nStatus dos Bots:'));
    bots.forEach(bot => {
        let statusColor = bot.status.includes('Online') ? chalk.green : chalk.yellow;
        if (bot.status.includes('❌')) statusColor = chalk.red;

        const privacyLabel = bot.adminOnly ? chalk.red('[PRIVATE]') : chalk.cyan('[PUBLIC]');
        const audioLabel = bot.transcriptionEnabled ? chalk.magenta('[🎙️ ON]') : chalk.gray('[🎙️ OFF]');

        console.log(`${chalk.blue(`[${bot.id}]`)} ${statusColor(bot.status)} ${privacyLabel} ${audioLabel} | 📊 ${bot.contacts} ctt, ${bot.messages} msg`);
        if (bot.hasQr) {
            console.log(chalk.magenta(`   🔗 QR Code disponível em: ${API_URL}/qr/${bot.id}`));
        }
    });
}

async function sendMessage() {
    const statusRes = await axios.get(`${API_URL}/status`);
    const onlineBots = statusRes.data.filter(b => b.status === 'Online ✅');

    if (onlineBots.length === 0) {
        console.log(chalk.red('\nNão há bots online para enviar mensagens.'));
        return;
    }

    const { botId, to, message } = await inquirer.prompt([
        {
            type: 'list',
            name: 'botId',
            message: 'Escolha o bot:',
            choices: onlineBots.map(b => b.id)
        },
        {
            type: 'input',
            name: 'to',
            message: 'Telefone do destinatário (com DDD, ex: 5511999999999):',
            validate: input => input.length >= 10 || 'Telefone inválido'
        },
        {
            type: 'input',
            name: 'message',
            message: 'Mensagem:',
            validate: input => input.length > 0 || 'Mensagem não pode ser vazia'
        }
    ]);

    console.log(chalk.yellow('Enviando...'));
    const res = await axios.post(`${API_URL}/send-message`, { botId, to, message });

    if (res.data.success) {
        console.log(chalk.green('✅ Mensagem enviada com sucesso!'));
    } else {
        console.log(chalk.red('❌ Erro ao enviar:'), res.data.error);
    }
}

async function viewQrCode() {
    console.log(chalk.yellow('\nBuscando bots com QR Code pendente...'));
    const res = await axios.get(`${API_URL}/status`);
    const pendingBots = res.data.filter(b => b.hasQr);

    if (pendingBots.length === 0) {
        console.log(chalk.yellow('\nNenhum bot aguardando autenticação (QR Code).'));
        return;
    }

    const { botId } = await inquirer.prompt([
        {
            type: 'list',
            name: 'botId',
            message: 'Escolha o bot para ver o QR Code:',
            choices: pendingBots.map(b => b.id)
        }
    ]);

    try {
        const qrRes = await axios.get(`${API_URL}/qr/${botId}`);
        if (qrRes.data.qr) {
            console.log(chalk.bold.white('\nEscaneie o QR Code abaixo com seu WhatsApp:'));
            qrcode.generate(qrRes.data.qr, { small: true });
        } else {
            console.log(chalk.red('\nO bot já autenticou ou o QR Code expirou. Atualize o status.'));
        }
    } catch (err) {
        console.error(chalk.red('\nErro ao buscar QR Code:'), err.message);
    }
}

async function createBot() {
    const { botId } = await inquirer.prompt([
        {
            type: 'input',
            name: 'botId',
            message: 'Nome/ID da nova sessão (sem espaços):',
            validate: input => (input.length > 0 && !input.includes(' ')) || 'ID inválido ou contém espaços'
        }
    ]);

    console.log(chalk.yellow(`\nSolicitando criação do bot [${botId}]...`));

    try {
        const res = await axios.post(`${API_URL}/create-bot`, { botId });

        if (res.data.success) {
            console.log(chalk.green(`✅ ${res.data.message}`));
            console.log(chalk.cyan('Aguarde alguns segundos e use a opção "Visualizar QR Code" para autenticar.'));
        } else {
            console.log(chalk.red('❌ Erro:'), res.data.error);
        }
    } catch (err) {
        const errorMsg = err.response && err.response.data ? err.response.data.error : err.message;
        console.error(chalk.red('\n❌ Erro ao criar bot:'), errorMsg);
    }
}

async function togglePrivacy() {
    console.log(chalk.yellow('\nBuscando bots...'));
    const res = await axios.get(`${API_URL}/status`);
    const bots = res.data;

    if (bots.length === 0) {
        console.log(chalk.yellow('\nNenhum bot encontrado.'));
        return;
    }

    const { botId } = await inquirer.prompt([
        {
            type: 'list',
            name: 'botId',
            message: 'Escolha o bot para alterar a privacidade:',
            choices: bots.map(b => ({
                name: `${b.id} - Atual: ${b.adminOnly ? 'PRIVADO' : 'PÚBLICO'}`,
                value: b.id
            }))
        }
    ]);

    try {
        const toggleRes = await axios.post(`${API_URL}/toggle-privacy`, { botId });
        if (toggleRes.data.success) {
            const state = toggleRes.data.adminOnly ? chalk.red('PRIVADO') : chalk.cyan('PÚBLICO');
            console.log(chalk.green(`\n✅ Privacidade do bot [${botId}] alterada para: ${state}`));
        }
    } catch (err) {
        console.error(chalk.red('\nErro ao alterar privacidade:'), err.message);
    }
}

main().catch(err => {
    console.error(chalk.red('Erro Fatal no Cliente:'), err);
    process.exit(1);
});
