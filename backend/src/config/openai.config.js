/**
 * Configuración central de OpenAI
 * Punto único para cambiar el modelo usado en toda la aplicación
 */

const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o';

const MODELS = {
    // Modelo principal para todos los clientes
    PRIMARY: DEFAULT_MODEL,
    
    // Modelos específicos (si necesitas usar diferentes modelos para diferentes casos)
    ADVANCED: 'gpt-4o',          // Para tareas complejas
    STANDARD: 'gpt-4o',          // Para tareas estándar
    FAST: 'gpt-3.5-turbo',       // Para tareas rápidas
    
    // Configuraciones
    TEMPERATURE: {
        CREATIVE: 0.9,
        BALANCED: 0.7,
        PRECISE: 0.3,
        DETERMINISTIC: 0.1
    },
    
    MAX_TOKENS: {
        SHORT: 500,
        MEDIUM: 1000,
        LONG: 2000,
        EXTENDED: 4000
    }
};

/**
 * Obtiene el modelo a usar según el contexto
 * @param {string} context - Contexto de uso (opcional)
 * @returns {string} Nombre del modelo a usar
 */
function getModel(context = 'default') {
    // Para asegurar que todos los clientes usen GPT-5.2-Codex
    return MODELS.PRIMARY;
}

/**
 * Configuración de OpenAI para diferentes tipos de requests
 */
const CONFIG = {
    chat: {
        model: getModel('chat'),
        temperature: MODELS.TEMPERATURE.BALANCED,
        max_tokens: MODELS.MAX_TOKENS.LONG
    },
    
    analysis: {
        model: getModel('analysis'),
        temperature: MODELS.TEMPERATURE.PRECISE,
        max_tokens: MODELS.MAX_TOKENS.MEDIUM
    },
    
    creative: {
        model: getModel('creative'),
        temperature: MODELS.TEMPERATURE.CREATIVE,
        max_tokens: MODELS.MAX_TOKENS.EXTENDED
    },
    
    code: {
        model: getModel('code'),
        temperature: MODELS.TEMPERATURE.PRECISE,
        max_tokens: MODELS.MAX_TOKENS.EXTENDED
    },
    
    decision: {
        model: getModel('decision'),
        temperature: MODELS.TEMPERATURE.BALANCED,
        max_tokens: MODELS.MAX_TOKENS.MEDIUM
    }
};

module.exports = {
    MODELS,
    getModel,
    CONFIG,
    DEFAULT_MODEL
};
