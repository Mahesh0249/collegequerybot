# CampusQueryBot

A full-stack AI chatbot web app to help students of Velagapudi Ramakrishna Siddhartha Engineering College (now Siddhartha Academy of Higher Education) get answers about campus events, roles, deadlines, and faculty information.

## Features
- Ask questions like "When is the next hackathon?" or "Who is the NSS coordinator?"
- Uses Gemini API for natural language understanding
- Stores FAQs in a local JSON file (`faqs.json`)
- Simple, modern web chat interface
- **Suggested questions**: Clickable starter questions to help users begin
- Responsive and visually appealing UI
- **Faculty Info:** Automatically scrapes and updates faculty data from the [official directory](https://www.vrsiddhartha.ac.in/faculty-u-2/)

## Tech Stack
- **Backend:** Node.js, Express
- **Frontend:** HTML, JavaScript, CSS
- **Database:** Local JSON file (`faqs.json`)
- **AI:** Gemini API (@google/generative-ai)

## Screenshots
<!-- Add a screenshot of the chat UI here after deployment -->

## Setup Instructions

1. **Clone the repo**
2. **Install dependencies:**
   ```
   npm install
   ```
3. **Add FAQ data:**
   - Edit `faqs.json` to add your own questions and answers.
   - Example:
     ```json
     [
       { "question": "When is the next hackathon?", "answer": "July 15th, registrations close on July 10th" },
       { "question": "Who is the NSS coordinator?", "answer": "K. Narendra sir is the NSS coordinator." }
     ]
     ```
4. **Configure Gemini API:**
   - Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Add it to `.env`:
     ```
     GEMINI_API_KEY=your-gemini-api-key-here
     PORT=3000
     ```
5. **Run the server:**
   ```
   npm start
   ```
6. **Open the app:**
   - Go to [http://localhost:3000](http://localhost:3000) in your browser

## Deployment (Render)
- Push your code to GitHub (do **not** include `.env` or `node_modules/`)
- Create a new Web Service on [Render](https://render.com/)
- Set build command: `npm install`
- Set start command: `npm start`
- Add your `GEMINI_API_KEY` as an environment variable
- Deploy and share your app!

## Customizing Suggested Questions
- Suggested questions are shown as clickable buttons above the chat area.
- To change them, edit the `<button class="suggestion">...</button>` elements in `public/index.html`.
- Example:
  ```html
  <button class="suggestion">When is the next hackathon?</button>
  <button class="suggestion">Who is the NSS coordinator?</button>
  <button class="suggestion">What is creatix club about?</button>
  ```
- You can add, remove, or change these as you like.

## File Structure
- `server.js` – Express backend
- `faqs.json` – FAQ data (edit this to add more Q&A)
- `gemini.js` – Gemini API logic
- `public/index.html` – Chat frontend (UI, suggested questions)
- `.env` – Secrets (not committed)
- `.gitignore` – Ignore node_modules, .env, etc.

## Notes
- Make sure your `.env` is not committed to GitHub.
- If you get credential errors, check your `GEMINI_API_KEY` and `.env` setup.
- To update FAQs, edit `faqs.json` and restart the server.
