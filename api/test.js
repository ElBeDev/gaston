// Minimal test to see if serverless function works at all
module.exports = (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'Minimal serverless function working!',
    timestamp: new Date().toISOString()
  });
};
