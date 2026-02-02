const { formatInTimeZone } = require('date-fns-tz');

/**
 * Utilitário Senior para Formatação de Datas
 * 
 * Segue o padrão de manter o Core em UTC e converter apenas na exibição.
 */

// Lê o fuso horário da variável de ambiente ou usa UTC como fallback
const TIMEZONE = process.env.TIMEZONE || 'America/Sao_Paulo';

/**
 * Converte uma data UTC para o fuso horário configurado e formata.
 * 
 * @param {string|Date} date A data em formato ISO ou objeto Date (em UTC)
 * @param {string} pattern O padrão de formatação (ex: 'dd/MM/yyyy HH:mm:ss')
 * @returns {string} Data formatada no fuso local
 */
function formatLocalTime(date, pattern = 'dd/MM/yyyy HH:mm:ss') {
    if (!date) return 'N/A';

    try {
        // O banco salva 'YYYY-MM-DD HH:MM:SS' (UTC), o date-fns-tz precisa saber que é UTC
        const utcDate = typeof date === 'string' && !date.includes('Z') ? `${date}Z` : date;
        return formatInTimeZone(utcDate, TIMEZONE, pattern);
    } catch (err) {
        console.error('[DateFormatter] Erro ao formatar data:', err.message);
        return String(date);
    }
}

module.exports = { formatLocalTime };
