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

// Important dates and events data
const importantDates = [
  { date: "January 26", event: "Republic Day", type: "National Holiday" },
  { date: "January 15", event: "Pongal Festival", type: "Cultural" },
  { date: "February 14", event: "Valentine's Day", type: "Cultural" },
  { date: "March 8", event: "International Women's Day", type: "Awareness" },
  { date: "March 15", event: "Technical Symposium", type: "Academic" },
  { date: "April 14", event: "Ambedkar Jayanti", type: "National Holiday" },
  { date: "May 1", event: "Labor Day", type: "National Holiday" },
  { date: "June 5", event: "World Environment Day", type: "Awareness" },
  { date: "July 15", event: "Hackathon", type: "Technical Event" },
  { date: "August 15", event: "Independence Day", type: "National Holiday" },
  { date: "September 5", event: "Teacher's Day", type: "Academic" },
  { date: "October 2", event: "Gandhi Jayanti", type: "National Holiday" },
  { date: "October 5", event: "World Teacher's Day", type: "Academic" },
  { date: "November 14", event: "Children's Day", type: "Cultural" },
  { date: "December 25", event: "Christmas", type: "Religious" },
  { date: "December 31", event: "New Year's Eve", type: "Cultural" }
];

// Club information with links
const clubsInfo = {
  "GDG": {
    name: "Google Developer Group",
    description: "A community of developers interested in Google's developer technology",
    lead: "Nandita",
    website: "https://gdg.community.dev/",
    instagram: "https://www.instagram.com/gdg_vijayawada/",
    linkedin: "https://www.linkedin.com/company/gdg-vijayawada/"
  },
  "Creatix": {
    name: "Creatix Photography Club",
    description: "Photography club managed by CSE department",
    lead: "CSE Department",
    website: "https://creatixclub.com/",
    instagram: "https://www.instagram.com/creatix_club/",
    linkedin: "https://www.linkedin.com/company/creatix-club/"
  },
  "NSS": {
    name: "National Service Scheme",
    description: "Social service organization for students",
    coordinator: "K. Narendra sir",
    website: "https://nss.gov.in/",
    instagram: "https://www.instagram.com/nss_vrsiddhartha/",
    linkedin: "https://www.linkedin.com/company/nss-vrsiddhartha/"
  },
  "IEEE": {
    name: "Institute of Electrical and Electronics Engineers",
    description: "Professional association for electrical and electronics engineering",
    lead: "IEEE Student Branch",
    website: "https://www.ieee.org/",
    instagram: "https://www.instagram.com/ieee_vrsiddhartha/",
    linkedin: "https://www.linkedin.com/company/ieee-vrsiddhartha/"
  }
};

// College official links
const collegeLinks = {
  official: "https://www.siddhartha.ac.in/",
  admissions: "https://www.siddhartha.ac.in/admissions/",
  academics: "https://www.siddhartha.ac.in/academics/",
  research: "https://www.siddhartha.ac.in/research/",
  contact: "https://www.siddhartha.ac.in/contact/",
  instagram: "https://www.instagram.com/siddhartha_academy/",
  linkedin: "https://www.linkedin.com/company/siddhartha-academy-of-higher-education/",
  facebook: "https://www.facebook.com/SiddharthaAcademy/",
  twitter: "https://twitter.com/SiddharthaAcademy"
};

// Add this near the top, after collegeLinks definition
const collegeLinksList = [
  { label: "Official College Website", url: "https://www.siddhartha.ac.in/" },
  { label: "Admissions Page", url: "https://www.siddhartha.ac.in/admissions/" },
  { label: "Academics Page", url: "https://www.siddhartha.ac.in/academics/" },
  { label: "Research Page", url: "https://www.siddhartha.ac.in/research/" },
  { label: "Contact Page", url: "https://www.siddhartha.ac.in/contact/" },
  { label: "Instagram", url: "https://www.instagram.com/siddhartha_academy/" },
  { label: "LinkedIn", url: "https://www.linkedin.com/company/siddhartha-academy-of-higher-education/" },
  { label: "Facebook", url: "https://www.facebook.com/SiddharthaAcademy/" },
  { label: "Twitter", url: "https://twitter.com/SiddharthaAcademy" }
];

// Add static club links
const clubLinks = {
  "Creatix": [
    { label: "Creatix Instagram", url: "https://www.instagram.com/creatix.sahe/" },
    { label: "Creatix LinkedIn", url: "https://www.linkedin.com/company/creatix-club-sahe/posts/?feedView=all" }
  ],
  "GDG": [
    { label: "GDG Instagram", url: "https://www.instagram.com/gdg_vrsec?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" },
    { label: "GDG LinkedIn", url: "https://www.linkedin.com/company/google-developer-student-clubs-velagapudi-ramakrishna-siddhartha-engineering/posts/?feedView=all" }
  ]
};

// Utility to extract anchor tag labels and URLs as 'Label: URL', and also include any plain URLs
function extractLinksAndLabels(str) {
  if (!str) return '';
  const results = [];
  // Extract anchor tags: <a href="url">label</a>
  const anchorRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
  let match;
  const foundUrls = new Set();
  while ((match = anchorRegex.exec(str)) !== null) {
    const url = match[1];
    let label = match[2].replace(/<[^>]*>/g, '').trim();
    if (!label || label === url) {
      results.push(url);
    } else {
      results.push(`${label}: ${url}`);
    }
    foundUrls.add(url);
  }
  // Extract any remaining plain URLs not in anchor tags
  const urlRegex = /(https?:\/\/[^\s"'>]+)/g;
  let urlMatch;
  while ((urlMatch = urlRegex.exec(str)) !== null) {
    const url = urlMatch[1];
    if (!foundUrls.has(url)) {
      results.push(url);
      foundUrls.add(url);
    }
  }
  if (results.length === 0) return str;
  return results.join('\n');
}

// POST /ask endpoint
app.post('/ask', async (req, res) => {
  const userQuestion = req.body.question;
  if (!userQuestion) {
    return res.status(400).json({ error: 'Question is required.' });
  }

  // Intercept club-related queries
  const isCreatix = /creatix/i.test(userQuestion);
  const isGDG = /gdg/i.test(userQuestion);
  const isClub = isCreatix || isGDG;
  const isLinkQuery = /link|social|instagram|linkedin/i.test(userQuestion);

  if (isClub && isLinkQuery) {
    // Only links requested
    let links = [];
    if (isCreatix) links = clubLinks.Creatix;
    if (isGDG) links = links.concat(clubLinks.GDG);
    if (links.length > 0) {
      const formatted = links.map(link => `${link.label}: ${link.url}`).join('\n');
      return res.json({ answer: formatted });
    }
  }

  if (isClub && !isLinkQuery) {
    // Description + links requested
    try {
      const faqs = JSON.parse(fs.readFileSync('faqs.json', 'utf8'));
      let answer = await askGemini(userQuestion, faqs);
      if (typeof answer === 'string' && answer.length > 500) {
        answer = answer.slice(0, 497) + '...';
      }
      let links = [];
      if (isCreatix) links = clubLinks.Creatix;
      if (isGDG) links = links.concat(clubLinks.GDG);
      if (links.length > 0) {
        answer += '\n\nHere are some useful links:';
        answer += '\n' + links.map(link => `${link.label}: ${link.url}`).join('\n');
      }
      return res.json({ answer });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  }

  // Intercept link-related queries and return static links
  if (/college links|all links|website|admission|academics|research|contact|social|instagram|facebook|twitter|linkedin/i.test(userQuestion)) {
    const formatted = collegeLinksList.map(link => `${link.label}: ${link.url}`).join('\n');
    return res.json({ answer: formatted });
  }

  // Otherwise, use Gemini for open-ended questions
  try {
    // Load FAQs from faqs.json
    const faqs = JSON.parse(fs.readFileSync('faqs.json', 'utf8'));
    let answer = await askGemini(userQuestion, faqs);
    // Limit Gemini's answer to 500 characters
    if (typeof answer === 'string' && answer.length > 500) {
      answer = answer.slice(0, 497) + '...';
    }
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

  // Check for important dates queries
  if (userMessage.includes('important dates') || userMessage.includes('events') || userMessage.includes('calendar')) {
    const response = importantDates.map(date => 
      `${date.date}: ${date.event} (${date.type})`
    ).join('\n');
    return res.json({ reply: `Important dates and events:\n${response}` });
  }

  // Check for club information queries
  if (userMessage.includes('club') || userMessage.includes('gdg') || userMessage.includes('creatix') || userMessage.includes('nss') || userMessage.includes('ieee')) {
    let clubName = '';
    if (userMessage.includes('gdg')) clubName = 'GDG';
    else if (userMessage.includes('creatix')) clubName = 'Creatix';
    else if (userMessage.includes('nss')) clubName = 'NSS';
    else if (userMessage.includes('ieee')) clubName = 'IEEE';
    
    if (clubName && clubsInfo[clubName]) {
      const club = clubsInfo[clubName];
      const response = `${club.name}\nDescription: ${club.description}\nLead: ${club.lead || club.coordinator}\n\nLinks:\nWebsite: ${club.website}\nInstagram: ${club.instagram}\nLinkedIn: ${club.linkedin}`;
      return res.json({ reply: response });
    } else {
      const allClubs = Object.keys(clubsInfo).map(name => `${name}: ${clubsInfo[name].description}`).join('\n');
      return res.json({ reply: `Available clubs:\n${allClubs}\n\nAsk about a specific club for more details!` });
    }
  }

  // Check for college links queries
  if (userMessage.includes('website') || userMessage.includes('link') || userMessage.includes('social media') || userMessage.includes('instagram') || userMessage.includes('linkedin') || userMessage.includes('facebook') || userMessage.includes('twitter') || userMessage.includes('admission') || userMessage.includes('academic') || userMessage.includes('research') || userMessage.includes('contact')) {
    // Lowercase mapping for easier matching
    const linkMap = {
      'website': `Official Website: ${collegeLinks.official}`,
      'official website': `Official Website: ${collegeLinks.official}`,
      'main website': `Official Website: ${collegeLinks.official}`,
      'admission': `Admissions: ${collegeLinks.admissions}`,
      'admissions': `Admissions: ${collegeLinks.admissions}`,
      'academic': `Academics: ${collegeLinks.academics}`,
      'academics': `Academics: ${collegeLinks.academics}`,
      'research': `Research: ${collegeLinks.research}`,
      'contact': `Contact: ${collegeLinks.contact}`,
      'instagram': `Instagram: ${collegeLinks.instagram}`,
      'linkedin': `LinkedIn: ${collegeLinks.linkedin}`,
      'facebook': `Facebook: ${collegeLinks.facebook}`,
      'twitter': `Twitter: ${collegeLinks.twitter}`
    };
    // If user asks for all links
    if (userMessage.includes('all links') || userMessage.includes('all social') || userMessage.includes('all website') || userMessage.includes('all info') || userMessage.includes('all details') || userMessage.includes('college links') || userMessage.includes('website and social media') || userMessage.includes('all')) {
      const response = [
        'College Website and Social Media:',
        '',
        `* Official Website: ${collegeLinks.official}`,
        `* Instagram: ${collegeLinks.instagram}`,
        `* LinkedIn: ${collegeLinks.linkedin}`,
        `* Facebook: ${collegeLinks.facebook}`,
        `* Twitter: ${collegeLinks.twitter}`,
        '',
        'Admissions and Academics:',
        '',
        `* Admissions: ${collegeLinks.admissions}`,
        `* Academics: ${collegeLinks.academics}`,
        `* Research: ${collegeLinks.research}`,
        `* Contact: ${collegeLinks.contact}`
      ].join('\n');
      return res.json({ reply: response });
    }
    // Otherwise, return only the requested links
    let found = [];
    for (const key in linkMap) {
      if (userMessage.includes(key)) {
        found.push(linkMap[key]);
      }
    }
    if (found.length > 0) {
      return res.json({ reply: found.join('\n') });
    } else {
      // Fallback: if no specific link matched, show a help message
      return res.json({ reply: 'Please specify which link or info you need (e.g., Instagram, LinkedIn, website, admissions, etc.).' });
    }
  }

  // Check for Vice Chancellor and Pro Vice Chancellor queries
  if (userMessage.includes('vice chancellor') || userMessage.includes('vc') || userMessage.includes('pro vice chancellor') || userMessage.includes('pvc')) {
    if (userMessage.includes('pro') || userMessage.includes('pvc')) {
      return res.json({ reply: "DR. A.V. RATNA PRASAD is the Pro Vice Chancellor of Siddhartha Academy of Higher Education." });
    } else {
      return res.json({ reply: "DR. D. VENKATESWARA RAO PARUCHURI is the Vice Chancellor of Siddhartha Academy of Higher Education." });
    }
  }

  // Improved: Check for HOD queries
  if (userMessage.includes('hod') || userMessage.includes('head of department')) {
    const deptMatch = userMessage.match(/hod of ([a-zA-Z &]+)/) || userMessage.match(/head of department of ([a-zA-Z &]+)/);
    let dept = deptMatch ? deptMatch[1].trim().toLowerCase() : null;
    
    // Find HOD by designation
    let hod = facultyData.find(f =>
      (f.designation.toLowerCase().includes('hod') || f.designation.toLowerCase().includes('head')) &&
      (dept ? f.department.toLowerCase().includes(dept) : true)
    );
    
    if (hod) {
      return res.json({ reply: `The HOD of ${hod.department} is ${hod.name} (${hod.designation}).` });
    } else {
      // If no specific HOD found, list all departments and their potential HODs
      const departments = [...new Set(facultyData.map(f => f.department))];
      const hodList = departments.map(dept => {
        const deptFaculty = facultyData.filter(f => f.department === dept);
        const hod = deptFaculty.find(f => f.designation.toLowerCase().includes('hod') || f.designation.toLowerCase().includes('head'));
        return hod ? `${dept}: ${hod.name}` : `${dept}: HOD information not available`;
      }).join('\n');
      return res.json({ reply: `Department HODs:\n${hodList}` });
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