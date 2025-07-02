# CampusQueryBot

A full-stack AI chatbot web app to help college students get answers about campus events, roles, and deadlines.

## Features
- Ask questions like "When is the next hackathon?" or "Who is the NSS coordinator?"
- Uses Gemini API for natural language understanding
- Stores FAQs in Firebase Firestore
- Simple web chat interface

## Tech Stack
- **Backend:** Node.js, Express
- **Frontend:** HTML, JavaScript
- **Database:** Firebase Firestore
- **AI:** Gemini API (@google/generative-ai)

## Setup Instructions

1. **Clone the repo**
2. **Install dependencies:**
   ```
   npm install express cors dotenv firebase-admin @google/generative-ai@latest
   ```
3. **Set up Firebase:**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Firestore
   - Download your service account key JSON and set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to its path, e.g.:
     ```
     set GOOGLE_APPLICATION_CREDENTIALS=path/to/serviceAccountKey.json
     ```
4. **Add FAQ data to Firestore:**
   - Collection: `faq`
   - Example documents:
     - `{ question: "When is the next hackathon?", answer: "July 15th, registrations close on July 10th" }`
     - `{ question: "Who is the NSS coordinator?", answer: "K. Narendra sir is the NSS coordinator." }`
5. **Configure Gemini API:**
   - Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Add it to `.env`:
     ```
     GEMINI_API_KEY=your-gemini-api-key-here
     PORT=3000
     ```
6. **Run the server:**
   ```
   node server.js
   ```
7. **Open the app:**
   - Go to [http://localhost:3000](http://localhost:3000) in your browser

## File Structure
- `server.js` – Express backend
- `firebase.js` – Firebase config and data fetch
- `gemini.js` – Gemini API logic
- `public/index.html` – Chat frontend
- `.env` – Secrets

## Notes
- Make sure your Firestore rules allow read access for the server.
- If you get credential errors, check your `GOOGLE_APPLICATION_CREDENTIALS` path.

---

Happy querying! 🎓🤖 