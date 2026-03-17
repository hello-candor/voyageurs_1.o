Voyageurs

Voyageurs is a Mediterranean-inspired, comprehensive event planning and group travel application. Designed to replace fragmented group chats and spreadsheets, Voyageurs provides an elegant, centralized hub for large group celebrations.

From RSVP management and collaborative itinerary planning to shared expense tracking and an AI-powered concierge, Voyageurs makes travel logistics invisible so you can focus on the experience.

✨ Key Features

AI Concierge (Céleste): Powered by the Gemini API, Céleste can answer guest questions, suggest local activities, and analyze receipts.

Collaborative Itinerary & Logistics: Real-time multiplayer planning for flights, trains, hotels, and activities.

Smart Shared Ledger: Snap a photo of a receipt to instantly extract totals and split costs transparently among the group.

Guest Registry & Matchmaker: A directory that helps guests connect before the trip based on shared interests.

Interactive Global Map: Visual orientation of official events, accommodations, and curated local recommendations.

WebOS Spatial Interface: A fluid, card-based UI that works seamlessly across desktop and mobile.

PWA (Progressive Web App): Installable on mobile devices with offline capabilities for access without data roaming.

🛠️ Tech Stack

Frontend: React 18, Vite, Tailwind CSS, Framer Motion

Backend & Database: Firebase (Auth, Firestore, Storage)

AI Integration: Google Gemini API (@google/genai)

Maps: Leaflet & React-Leaflet

🚀 Getting Started

Follow these steps to run Voyageurs locally.

Prerequisites

Node.js (v18 or higher recommended)

A Google Gemini API Key

A Firebase Project (for Authentication, Firestore, and Storage)

1. Clone & Install

Clone the repository and install the dependencies:

npm install


2. Environment Setup

Create a .env file (or .env.local) in the root directory and add your Gemini API Key and Firebase configuration:

VITE_FIREBASE_API_KEY=your_firebase_api_key
GEMINI_API_KEY=your_gemini_api_key


3. Firebase Configuration

The app relies on Firebase for syncing data. If you are setting up your own Firebase backend:

Enable Anonymous Authentication in the Firebase Console (Authentication > Sign-in method).

Enable Google Sign-in for Host Access.

Initialize a Firestore Database.

Initialize Firebase Storage.

Update firebaseConfig.ts with your own Firebase project credentials.

(Note: The app includes graceful fallbacks to an "Offline/Demo Mode" using local storage if Firebase rules or authentication are not fully configured).

4. Run Locally

Start the Vite development server:

npm run dev


The app will be available at http://localhost:3000.

📱 App Modes

Guest View: Guests enter via an invitation code (e.g., BAXTER) to access the travel hub, RSVP, chat, and view the itinerary.

Host Console (Admin): Event organizers can log in via Google (or password) to access the Command Center, manage the guest list, broadcast messages, and build the experience content.

📄 License

© 2026 Candor Digital Group, LLC. All rights reserved.