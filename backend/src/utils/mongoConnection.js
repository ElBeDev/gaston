/**
 * MongoDB Connection Manager para Serverless
 * Mantiene la conexión activa entre invocaciones y maneja reconexiones
 * NOTA: MongoDB es OPCIONAL en producción. Sistema funciona con Blob Storage.
 */

const mongoose = require('mongoose');

let isConnected = false;

/**
 * Conecta a MongoDB si no hay conexión activa
 * Reutiliza la conexión existente en funciones serverless
 */
const connectToDatabase = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      // No es un error - el sistema funciona sin MongoDB usando Blob Storage
      return null;
    }

    const connection = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log('✅ MongoDB conectado');
    
    return connection;
  } catch (error) {
    console.warn('⚠️  MongoDB no disponible (opcional):', error.message);
    isConnected = false;
    return null;
  }
};

/**
 * Middleware para intentar conexión MongoDB antes de cada request
 * No falla si MongoDB no está disponible - sistema funciona sin él
 */
const ensureMongoConnection = async (req, res, next) => {
  try {
    await connectToDatabase();
  } catch (error) {
    // Continuar sin MongoDB - muchas rutas funcionan sin DB
    console.warn('Request procesado sin MongoDB');
  }
  next();
};

module.exports = {
  connectToDatabase,
  ensureMongoConnection
};
