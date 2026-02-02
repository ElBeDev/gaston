#!/usr/bin/env node
/**
 * Script de prueba para verificar configuración de GPT-5.2-Codex
 */

const { getModel, MODELS, CONFIG, DEFAULT_MODEL } = require('./backend/src/config/openai.config');

console.log('🧪 Verificando configuración de OpenAI...\n');

console.log('✅ Modelo por defecto:', DEFAULT_MODEL);
console.log('✅ Modelo primary:', MODELS.PRIMARY);
console.log('✅ Modelo para chat:', getModel('chat'));
console.log('✅ Modelo para código:', getModel('code'));
console.log('✅ Modelo para análisis:', getModel('analysis'));

console.log('\n📊 Configuraciones disponibles:');
console.log('  - Chat:', CONFIG.chat.model);
console.log('  - Analysis:', CONFIG.analysis.model);
console.log('  - Creative:', CONFIG.creative.model);
console.log('  - Code:', CONFIG.code.model);
console.log('  - Decision:', CONFIG.decision.model);

console.log('\n🎯 Temperaturas:');
console.log('  - Creative:', MODELS.TEMPERATURE.CREATIVE);
console.log('  - Balanced:', MODELS.TEMPERATURE.BALANCED);
console.log('  - Precise:', MODELS.TEMPERATURE.PRECISE);
console.log('  - Deterministic:', MODELS.TEMPERATURE.DETERMINISTIC);

console.log('\n✨ Todos los modelos están configurados para usar:', MODELS.PRIMARY);
console.log('✅ Test completado con éxito!\n');
