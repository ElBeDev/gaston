// Vercel Serverless Function Entry Point
// This file exports the Express app for Vercel's serverless environment

// TEMPORARY: Using ultra-minimal version for debugging
const app = require('./index-ultra-minimal');

// ORIGINAL (commented for debugging):
// const app = require('../backend/src/app');

// Export the Express app as a serverless function
module.exports = app;
