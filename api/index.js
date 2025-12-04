// Vercel Serverless Function Entry Point
// This file exports the Express app for Vercel's serverless environment

const app = require('../backend/src/app');

// Export the Express app as a serverless function
module.exports = app;
