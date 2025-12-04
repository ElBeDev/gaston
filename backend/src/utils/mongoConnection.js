/**
 * MongoDB Connection Manager para Serverless
 * Mantiene la conexión activa entre invocaciones y maneja reconexiones
 */

const mongoose = require('mongoose');

let isConnected = false;

/**
 * Conecta a MongoDB si no hay conexión activa
 * Reutiliza la conexión existente en funciones serverless
 */
const connectToDatabase = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log('♻️  Reutilizando conexión MongoDB existente');
    return mongoose.connection;
  }

  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.warn('⚠️  MONGODB_URI no configurado, funcionando sin base de datos');
      return null;
    }

    console.log('🔌 Conectando a MongoDB...');
    
    const connection = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // Timeout rápido en serverless
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log('✅ Conectado a MongoDB');
    
    return connection;
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    isConnected = false;
    return null;
  }
};

/**
 * Middleware para asegurar conexión MongoDB antes de cada request
 */
const ensureMongoConnection = async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error('Error en middleware de MongoDB:', error);
    // Continuar sin MongoDB - algunas rutas pueden funcionar sin DB
    next();
  }
};

module.exports = {
  connectToDatabase,
  ensureMongoConnection
};
