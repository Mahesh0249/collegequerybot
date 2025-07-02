// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { askGemini } = require('./gemini');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// POST /ask endpoint
app.post('/ask', async (req, res) => {
  const userQuestion = req.body.question;
  if (!userQuestion) {
    return res.status(400).json({ error: 'Question is required.' });
  }
  try {
    // Load FAQs from faqs.json
    const faqs = JSON.parse(fs.readFileSync('faqs.json', 'utf8'));
    const answer = await askGemini(userQuestion, faqs);
    res.json({ answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`CampusQueryBot server running on port ${PORT}`);
}); 