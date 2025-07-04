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

let facultyData = [];
try {
  facultyData = JSON.parse(fs.readFileSync('faculty.json', 'utf-8'));
} catch (e) {
  facultyData = [];
}

// API endpoint to get faculty info
app.get('/api/faculty', (req, res) => {
  const { department } = req.query;
  let result = facultyData;
  if (department) {
    result = result.filter(f => f.department.toLowerCase() === department.toLowerCase());
  }
  res.json(result);
});

app.post('/api/chat', (req, res) => {
  const userMessage = req.body.message.toLowerCase();

  // Improved: Check for HOD queries
  if (userMessage.includes('hod') || userMessage.includes('head of department')) {
    const deptMatch = userMessage.match(/hod of ([a-zA-Z &]+)/) || userMessage.match(/head of department of ([a-zA-Z &]+)/);
    let dept = deptMatch ? deptMatch[1].trim().toLowerCase() : null;
    let hod = facultyData.find(f =>
      (f.designation.toLowerCase().includes('head') || f.designation.toLowerCase().includes('hod')) &&
      (dept ? f.department.toLowerCase().includes(dept) : true)
    );
    if (hod) {
      return res.json({ reply: `The HOD of ${hod.department} is ${hod.name} (${hod.designation}).` });
    } else {
      return res.json({ reply: "Sorry, I couldn't find the HOD for that department." });
    }
  }

  // Professors of a department
  const deptProfMatch = userMessage.match(/professors? of ([a-zA-Z &]+)/) || userMessage.match(/([a-zA-Z &]+) department professors?/);
  if (deptProfMatch) {
    // Remove the word 'department' if present, and trim
    let dept = deptProfMatch[1].replace(/department/i, '').trim().toLowerCase();
    if (dept.endsWith('department')) {
      dept = dept.replace(/department$/i, '').trim();
    }
    // Debug logging
    console.log('User message:', userMessage);
    console.log('Extracted department:', dept);
    console.log('Faculty departments:', [...new Set(facultyData.map(f => f.department))]);
    const matches = facultyData.filter(f =>
      f.department.toLowerCase() === dept ||
      f.department.toLowerCase().includes(dept)
    ).filter(f =>
      f.designation.toLowerCase().includes('professor')
    );
    console.log('Matches found:', matches.length);
    if (matches.length > 0) {
      const response = matches.map(f =>
        `${f.name} (${f.designation})`
      ).join('\n');
      return res.json({ reply: `Professors in the ${dept.toUpperCase()} department:\n${response}` });
    } else {
      return res.json({ reply: `Sorry, I couldn't find professors for the ${dept.toUpperCase()} department.` });
    }
  }

  // General professors list
  if (userMessage.match(/professors? list/)) {
    const matches = facultyData.filter(f =>
      f.designation.toLowerCase().includes('professor')
    );
    if (matches.length > 0) {
      const response = matches.slice(0, 10).map(f =>
        `${f.name} (${f.designation}, ${f.department})`
      ).join('\n');
      return res.json({ reply: `Here are some professors:\n${response}` });
    } else {
      return res.json({ reply: "Sorry, I couldn't find any professors in the data." });
    }
  }

  // Simple keyword check for faculty-related queries
  if (
    userMessage.includes('faculty') ||
    userMessage.includes('professor') ||
    userMessage.includes('who teaches')
  ) {
    let matches = [];
    facultyData.forEach(faculty => {
      if (
        userMessage.includes(faculty.department.toLowerCase()) ||
        userMessage.includes(faculty.name.toLowerCase()) ||
        userMessage.includes(faculty.designation.toLowerCase())
      ) {
        matches.push(faculty);
      }
    });
    if (matches.length > 0) {
      const response = matches.slice(0, 5).map(f =>
        `${f.name} (${f.designation}, ${f.department})`
      ).join('\n');
      return res.json({ reply: `Here are some faculty members I found:\n${response}` });
    } else {
      return res.json({ reply: "I couldn't find a matching faculty member. Please specify the department or name." });
    }
  }

  // ... existing AI/Gemini logic for other questions ...
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`CampusQueryBot server running on port ${PORT}`);
});

// Example: If you have a welcome message route or variable, update it like this:
const WELCOME_MESSAGE = 'Welcome to CampusQueryBot for Velagapudi Ramakrishna Siddhartha Engineering College (now Siddhartha Academy of Higher Education)! How can I help you today?'; 