const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

require('dotenv').config(); // Load .env file
const db = require('./db');  // DB connection

app.use(express.json()); // To parse JSON requests

// Basic route to test
app.get('/', (req, res) => {
  res.send('🚀 Exabloom backend is working!');
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
