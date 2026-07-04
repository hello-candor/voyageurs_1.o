/**
 * Import guests into Firestore using the Firebase Client SDK.
 * No service account key needed — uses the same config as the app.
 * 
 * Usage:
 *   node scripts/import_guests_client.mjs
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection, getDocs } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAC5sjtZnu9ccHXLVeoiawnjq0w_dwNeq8",
  authDomain: "v6yage4rs.firebaseapp.com",
  projectId: "v6yage4rs",
  storageBucket: "v6yage4rs.firebasestorage.app",
  messagingSenderId: "435975494588",
  appId: "1:435975494588:web:2e12eb825a53477ebbe9b9",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const EVENT_ID = "voyageurs_2026";

const guests = [
  { code: "B40-ZZZ-TIM", name: "Tim & Kate Stephens", partySize: 2, party: "Stephens", likelihood: "4" },
  { code: "B40-201-BRI", name: "Brian & Daniela Johnson", partySize: 2, party: "Johnson", likelihood: "5" },
  { code: "B40-331-SAR", name: "Sarah Klugh & Guest", partySize: 1, party: "Sanders", likelihood: "5" },
  { code: "B40-415-PAU", name: "Paul Feuerborn & Mike Burkhalter", partySize: 1, party: "Feuerborn", likelihood: "4" },
  { code: "B40-605-RYA", name: "Ryan & Kelsey Gohl", partySize: 2, party: "Gohl", likelihood: "2" },
  { code: "B40-606-ADA", name: "Adam Beauchamp & Guest", partySize: 1, party: "Beauchamp", likelihood: "5" },
  { code: "B40-606-MIK", name: "Mike McGrath & Lindy Triebes", partySize: 2, party: "Gohl", likelihood: "2" },
  { code: "B40-606-PHI", name: "Phil Kural & Guest", partySize: 1, party: "Kural", likelihood: "3" },
  { code: "B40-606-STE", name: "Stephen Chambers & Guest", partySize: 1, party: "Kural", likelihood: "3" },
  { code: "B40-606-TIM", name: "Tim Kaatman & Stephen Schofield", partySize: 2, party: "Kaatman", likelihood: "5" },
  { code: "B40-630-JOS", name: "Josh & Shannon Bucholz", partySize: 2, party: "Bucholz", likelihood: "2" },
  { code: "B40-641-ADA", name: "Adam Ralston & Jonathan Richard", partySize: 2, party: "Richard", likelihood: "5" },
  { code: "B40-641-CHR", name: "Chris & Melissa Hawkins", partySize: 2, party: "Faltermeier", likelihood: "1" },
  { code: "B40-641-HAL", name: "Haley Grayless & Guest", partySize: 1, party: "Grayless", likelihood: "4" },
  { code: "B40-641-JOE", name: "Joe Tharp & Guest", partySize: 1, party: "Tharp", likelihood: "3" },
  { code: "B40-641-LUK", name: "Luke & Allison Armstrong", partySize: 2, party: "Armstrong", likelihood: "3" },
  { code: "B40-641-MAT", name: "Matthew LaBreche & Guest", partySize: 1, party: "LaBreche", likelihood: "2" },
  { code: "B40-641-MIT", name: "Mitch Messner & Whit Adams", partySize: 2, party: "Messner", likelihood: "5" },
  { code: "B40-644-JAM", name: "James & Terra Feick", partySize: 2, party: "Messner", likelihood: "2" },
  { code: "B40-648-ERI", name: "Erica Espey & Guest", partySize: 1, party: "Beauchamp", likelihood: "5" },
  { code: "B40-658-J.", name: "J. & Lori Hill", partySize: 2, party: "Hill", likelihood: "2" },
  { code: "B40-658-JAC", name: "Jacob Havens & Lindsey Wheeler", partySize: 2, party: "Wheeler", likelihood: "2" },
  { code: "B40-662-DOU", name: "Doug & Katie Faltermeier", partySize: 2, party: "Faltermeier", likelihood: "1" },
  { code: "B40-662-JER", name: "Jeremy Espey & Nika McDonald", partySize: 2, party: "Espey", likelihood: "5" },
  { code: "B40-681-DAV", name: "David Lemp & Guest", partySize: 1, party: "Sanders", likelihood: "5" },
  { code: "B40-681-JED", name: "Jed Sanders & Guest", partySize: 1, party: "Sanders", likelihood: "5" },
  { code: "B40-708-JEN", name: "Jenny Bräutigam & Guest", partySize: 1, party: "Bräutigam", likelihood: "2" },
  { code: "B40-752-WES", name: "Weslin Thomas & Guest", partySize: 1, party: "Thomas", likelihood: "5" },
  { code: "B40-774-CHA", name: "Chakra & Rupali Gopichetty", partySize: 2, party: "Gopichetty", likelihood: "3" },
  { code: "B40-802-MAT", name: "Matt & Amber Andre", partySize: 2, party: "Andre", likelihood: "1" },
  { code: "B40-805-CAR", name: "Carl & Paige Lorch", partySize: 2, party: "Lorch", likelihood: "1" },
  { code: "B40-860-JAY", name: "Jaymee Bohannon & Guest", partySize: 1, party: "Bohannon", likelihood: "5" },
  { code: "B40-871-ERI", name: "Eric Cruz & Kevin Schroeder", partySize: 2, party: "Cruz", likelihood: "1" },
  { code: "B40-904-NAS", name: "Nastasia Glaser & Guest", partySize: 1, party: "Glaser", likelihood: "2" },
  { code: "B40-M4E-PAU", name: "Paul & Victoria Mahoney", partySize: 2, party: "Mahoney", likelihood: "4" },
  { code: "B40-M6K-GAB", name: "Gabi Pirraglia & Guest", partySize: 1, party: "Mahoney", likelihood: "2" },
];

async function importGuests() {
  console.log('\n🚀 Voyageurs Guest Import (Client SDK)\n');

  // Sign in anonymously
  console.log('🔑 Signing in anonymously...');
  await signInAnonymously(auth);
  console.log('✅ Authenticated\n');

  // Check existing guests
  const guestsRef = collection(db, "events", EVENT_ID, "guests");
  const existing = await getDocs(guestsRef);
  console.log(`📋 Existing guests in Firestore: ${existing.size}\n`);

  let imported = 0;
  let skipped = 0;

  for (const guest of guests) {
    const docId = guest.code;
    const guestData = {
      id: docId,
      name: guest.name,
      email: "",
      status: "Pending",
      guestsCount: guest.partySize,
      dietary: "",
      note: `Party: ${guest.party} | Likelihood: ${guest.likelihood}`,
      img: `https://ui-avatars.com/api/?name=${encodeURIComponent(guest.name)}&background=D67252&color=fff`,
      invitationCode: guest.code,
      privacy: {
        shareSocial: true,
        sharePhone: true,
        shareInterests: true,
        publicRegistry: true,
        smsConsent: true,
      },
      travelDetails: {
        arrivalDate: "",
        departureDate: "",
        arrivalMode: "Plane",
        arrivalNumber: "",
        accommodation: "",
      },
    };

    try {
      await setDoc(doc(db, "events", EVENT_ID, "guests", docId), guestData, { merge: true });
      console.log(`  ✅ ${guest.name.padEnd(45)} → ${guest.code}`);
      imported++;
    } catch (err) {
      console.error(`  ❌ ${guest.name.padEnd(45)} → ${err.message}`);
      skipped++;
    }
  }

  console.log(`\n────────────────────────────────────────`);
  console.log(`✅ Imported: ${imported}`);
  if (skipped > 0) console.log(`❌ Skipped:  ${skipped}`);
  console.log(`📂 Collection: events/${EVENT_ID}/guests`);
  console.log(`🌐 RSVP URL: https://bryans40th.voyageurs.app?code=<CODE>\n`);

  process.exit(0);
}

importGuests().catch(err => {
  console.error('❌ Import failed:', err);
  process.exit(1);
});
