#!/usr/bin/env node

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log(`
🚀 EVA GOOGLE WORKSPACE SETUP WIZARD
====================================

Este asistente te ayudará a configurar Google Workspace para Eva.
Necesitarás tener las credenciales de Google Cloud Console.

Pasos previos requeridos:
1. ✅ Ir a https://console.cloud.google.com/
2. ✅ Crear/seleccionar proyecto
3. ✅ Habilitar APIs: Gmail, Calendar, Drive
4. ✅ Crear credenciales OAuth 2.0
5. ✅ Descargar archivo JSON de credenciales

`);

const questions = [
    {
        key: 'GOOGLE_CLIENT_ID',
        question: '📝 Ingresa tu Google Client ID: ',
        required: true
    },
    {
        key: 'GOOGLE_CLIENT_SECRET',
        question: '🔐 Ingresa tu Google Client Secret: ',
        required: true
    },
    {
        key: 'GOOGLE_REDIRECT_URI',
        question: '🔗 URI de redirección (default: http://localhost:3001/auth/google/callback): ',
        default: 'http://localhost:3001/auth/google/callback'
    }
];

async function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question.question, (answer) => {
            if (!answer && question.required) {
                console.log('❌ Este campo es requerido.');
                resolve(askQuestion(question));
            } else {
                resolve(answer || question.default);
            }
        });
    });
}

async function setupGoogleWorkspace() {
    const config = {};
    
    console.log('📋 Configurando credenciales de Google Workspace...\n');
    
    for (const question of questions) {
        config[question.key] = await askQuestion(question);
    }
    
    // Read existing .env file
    const envPath = path.join(__dirname, '../../.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Add or update Google Workspace variables
    const googleVars = [
        '',
        '# Google Workspace Integration',
        `GOOGLE_CLIENT_ID=${config.GOOGLE_CLIENT_ID}`,
        `GOOGLE_CLIENT_SECRET=${config.GOOGLE_CLIENT_SECRET}`,
        `GOOGLE_REDIRECT_URI=${config.GOOGLE_REDIRECT_URI}`,
        'GOOGLE_SCOPES=gmail,calendar,drive',
        ''
    ];
    
    // Remove existing Google Workspace config if any
    envContent = envContent.replace(/# Google Workspace Integration[\s\S]*?(?=\n\n|\n#|\n[A-Z]|$)/g, '');
    
    // Add new config
    envContent += googleVars.join('\n');
    
    // Write back to .env
    fs.writeFileSync(envPath, envContent);
    
    console.log(`
✅ CONFIGURACIÓN COMPLETADA!

📁 Variables agregadas a .env:
${googleVars.join('\n')}

🚀 PRÓXIMOS PASOS:

1. 🔄 Reinicia el servidor de Eva:
   cd /Users/bener/GitHub/GastonAssistan/backend
   npm start

2. 🔗 Obtén la URL de autorización:
   curl http://localhost:3001/api/google/auth/url

3. 🌐 Visita la URL para autorizar Eva

4. 🎯 Copia el código de autorización y úsalo:
   curl -X POST http://localhost:3001/api/google/auth/callback \\
   -H "Content-Type: application/json" \\
   -d '{"code":"TU_CODIGO_AQUI"}'

5. ✅ Verifica la conexión:
   curl http://localhost:3001/api/google/status

¡Eva estará lista para manejar tu Gmail, Calendar y Drive! 🎉
`);
    
    rl.close();
}

setupGoogleWorkspace().catch(console.error);
