// Ultra-minimal Express app for debugging
const express = require('express');
const app = express();

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Ultra-minimal Express working!' });
});

module.exports = app;
