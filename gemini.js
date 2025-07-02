const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function askGemini(userQuestion, faqs) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
  const prompt = `You are a helpful assistant for students asking about campus events and roles.\nUser Question: "${userQuestion}"\nReference Data: ${JSON.stringify(faqs)}\nRespond with a clear, helpful answer. If the question cannot be answered, say \"Sorry, I couldn't find that.\"`;
  const result = await model.generateContent(prompt);
  const response = result.response.text();
  return response;
}

module.exports = { askGemini }; 