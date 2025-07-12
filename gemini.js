const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Fallback: extract label and URL from HTML anchor tags or plain URLs
function extractLabelAndUrlFromHtml(str) {
  // Try to extract <a href="...">label</a>
  const anchorRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/i;
  const match = anchorRegex.exec(str);
  if (match) {
    const url = match[1];
    let label = match[2].replace(/<[^>]*>/g, '').trim();
    if (!label || label === url) {
      return url;
    } else {
      return `${label}: ${url}`;
    }
  }
  // Fallback: extract first plain URL
  const urlRegex = /(https?:\/\/[^\s"'>]+)/;
  const urlMatch = urlRegex.exec(str);
  if (urlMatch) {
    return urlMatch[1];
  }
  // If nothing found, return the original string
  return str;
}

async function askGemini(userQuestion, faqs) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  // If the user is asking for links, use a special prompt
  const linkKeywords = [
    'link', 'website', 'admission', 'academics', 'research', 'contact', 'social', 'instagram', 'facebook', 'twitter', 'linkedin'
  ];
  const isLinkQuery = linkKeywords.some(word => userQuestion.toLowerCase().includes(word));

  // Detect club queries
  const isCreatix = /creatix/i.test(userQuestion);
  const isGDG = /gdg/i.test(userQuestion);
  const isClub = isCreatix || isGDG;

  let prompt;
  if (isLinkQuery) {
    prompt = `You are an AI assistant for Velagapudi Ramakrishna Siddhartha Engineering College.\nWhen providing links, format them as a JSON array of objects.\nEach object should have two keys:\n- label: A short, descriptive name for the link (e.g., 'Admissions Page', 'Official Website').\n- url: The full URL.\nDo NOT include any HTML tags, Markdown, or extra text outside the JSON.\n\nExample format:\n[\n  {\n    "label": "Official College Website",\n    "url": "https://www.siddhartha.ac.in/"\n  },\n  {\n    "label": "Admissions Information",\n    "url": "https://www.siddhartha.ac.in/admissions/"\n  }\n]\n\nBased on the following query, provide only the relevant links:\n${userQuestion}`;
  } else if (isClub) {
    // Special prompt for club queries: never mention links
    prompt = `You are a helpful assistant for students asking about campus clubs.\nUser Question: "${userQuestion}"\nReference Data: ${JSON.stringify(faqs)}\nDescribe the club and its activities. Do NOT mention or provide any links, URLs, or web addresses in your answer. If the question cannot be answered, say "Sorry, I couldn't find that."`;
  } else {
    prompt = `You are a helpful assistant for students asking about campus events and roles.\nUser Question: "${userQuestion}"\nReference Data: ${JSON.stringify(faqs)}\nRespond with a clear, helpful answer. If the question cannot be answered, say "Sorry, I couldn't find that."`;
  }

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  // If it's a link query, try to parse and format the JSON
  if (isLinkQuery) {
    try {
      const links = JSON.parse(response);
      if (Array.isArray(links)) {
        return links.map(link => `${link.label}: ${link.url}`).join('\n');
      } else {
        return 'Sorry, I could not parse the links.';
      }
    } catch (e) {
      // Fallback: extract from HTML or plain text
      return extractLabelAndUrlFromHtml(response);
    }
  }

  return response;
}

module.exports = { askGemini }; 