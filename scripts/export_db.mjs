import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import fs from 'fs';
import path from 'path';

const firebaseConfig = {
  apiKey: "AIzaSyAC5sjtZnu9ccHXLVeoiawnjq0w_dwNeq8",
  authDomain: "voyageurs-834eb.firebaseapp.com",
  projectId: "voyageurs-834eb",
  storageBucket: "voyageurs-834eb.firebasestorage.app",
  messagingSenderId: "435975494588",
  appId: "1:435975494588:web:2e12eb825a53477ebbe9b9",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const EVENT_ID = "voyageurs_2026";

async function exportGuests() {
  console.log('🔑 Signing in anonymously...');
  await signInAnonymously(auth);
  
  console.log('Fetching guests from Firestore...');
  const guestsRef = collection(db, "events", EVENT_ID, "guests");
  const snapshot = await getDocs(guestsRef);
  
  const guests = [];
  snapshot.forEach(doc => {
    guests.push({ docId: doc.id, ...doc.data() });
  });
  
  if (guests.length === 0) {
    console.log("No guests found.");
    process.exit(0);
  }
  
  // Flatten objects if needed or just JSON.stringify
  const headerSet = new Set();
  guests.forEach(guest => {
    Object.keys(guest).forEach(key => headerSet.add(key));
  });
  
  const headers = Array.from(headerSet);
  let csvContent = headers.join(',') + '\n';
  
  guests.forEach(guest => {
    const row = headers.map(header => {
      let val = guest[header];
      if (val === undefined || val === null) return '';
      if (typeof val === 'object') {
        val = JSON.stringify(val);
      }
      let strVal = String(val);
      if (strVal.includes(',') || strVal.includes('"') || strVal.includes('\n')) {
        strVal = '"' + strVal.replace(/"/g, '""') + '"';
      }
      return strVal;
    });
    csvContent += row.join(',') + '\n';
  });
  
  const outPath = path.resolve('./firestore_guests_export.csv');
  fs.writeFileSync(outPath, csvContent);
  console.log(`✅ Exported ${guests.length} guests to ${outPath}`);
  
  process.exit(0);
}

exportGuests().catch(err => {
  console.error('❌ Export failed:', err);
  process.exit(1);
});
