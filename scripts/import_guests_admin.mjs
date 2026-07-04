/**
 * Import guests into Firestore using Firebase Admin SDK.
 * 
 * Usage:
 *   node scripts/import_guests_admin.mjs
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Load service account
const serviceAccount = JSON.parse(
  readFileSync('/Users/bryanespey/Downloads/voyageurs-834eb-firebase-adminsdk-fbsvc-7e1d087487.json', 'utf-8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const EVENT_ID = 'voyageurs_2026';

const guests = [
  { code: "B40-ZZZ-TIM", name: "Tim & Kate Stephens", size: 2, note: "Party: Stephens | Likelihood: 4" },
  { code: "B40-201-BRI", name: "Brian & Daniela Johnson", size: 2, note: "Party: Johnson | Likelihood: 5" },
  { code: "B40-331-SAR", name: "Sarah Klugh & Guest", size: 1, note: "Party: Sanders | Likelihood: 5" },
  { code: "B40-415-PAU", name: "Paul Feuerborn & Mike Burkhalter", size: 1, note: "Party: Feuerborn | Likelihood: 4" },
  { code: "B40-605-RYA", name: "Ryan & Kelsey Gohl", size: 2, note: "Party: Gohl | Likelihood: 2" },
  { code: "B40-606-ADA", name: "Adam Beauchamp & Guest", size: 1, note: "Party: Beauchamp | Likelihood: 5" },
  { code: "B40-606-MIK", name: "Mike McGrath & Lindy Triebes", size: 2, note: "Party: Gohl | Likelihood: 2" },
  { code: "B40-606-PHI", name: "Phil Kural & Guest", size: 1, note: "Party: Kural | Likelihood: 3" },
  { code: "B40-606-STE", name: "Stephen Chambers & Guest", size: 1, note: "Party: Kural | Likelihood: 3" },
  { code: "B40-606-TIM", name: "Tim Kaatman & Stephen Schofield", size: 2, note: "Party: Kaatman | Likelihood: 5" },
  { code: "B40-630-JOS", name: "Josh & Shannon Bucholz", size: 2, note: "Party: Bucholz | Likelihood: 2" },
  { code: "B40-641-ADA", name: "Adam Ralston & Jonathan Richard", size: 2, note: "Party: Richard | Likelihood: 5" },
  { code: "B40-641-CHR", name: "Chris & Melissa Hawkins", size: 2, note: "Party: Faltermeier | Likelihood: 1" },
  { code: "B40-641-HAL", name: "Haley Grayless & Guest", size: 1, note: "Party: Grayless | Likelihood: 4" },
  { code: "B40-641-JOE", name: "Joe Tharp & Guest", size: 1, note: "Party: Tharp | Likelihood: 3" },
  { code: "B40-641-LUK", name: "Luke & Allison Armstrong", size: 2, note: "Party: Armstrong | Likelihood: 3" },
  { code: "B40-641-MAT", name: "Matthew LaBreche & Guest", size: 1, note: "Party: LaBreche | Likelihood: 2" },
  { code: "B40-641-MIT", name: "Mitch Messner & Whit Adams", size: 2, note: "Party: Messner | Likelihood: 5" },
  { code: "B40-644-JAM", name: "James & Terra Feick", size: 2, note: "Party: Messner | Likelihood: 2" },
  { code: "B40-648-ERI", name: "Erica Espey & Guest", size: 1, note: "Party: Beauchamp | Likelihood: 5" },
  { code: "B40-658-J.", name: "J. & Lori Hill", size: 2, note: "Party: Hill | Likelihood: 2" },
  { code: "B40-658-JAC", name: "Jacob Havens & Lindsey Wheeler", size: 2, note: "Party: Wheeler | Likelihood: 2" },
  { code: "B40-662-DOU", name: "Doug & Katie Faltermeier", size: 2, note: "Party: Faltermeier | Likelihood: 1" },
  { code: "B40-662-JER", name: "Jeremy Espey & Nika McDonald", size: 2, note: "Party: Espey | Likelihood: 5" },
  { code: "B40-681-DAV", name: "David Lemp & Guest", size: 1, note: "Party: Sanders | Likelihood: 5" },
  { code: "B40-681-JED", name: "Jed Sanders & Guest", size: 1, note: "Party: Sanders | Likelihood: 5" },
  { code: "B40-708-JEN", name: "Jenny Bräutigam & Guest", size: 1, note: "Party: Bräutigam | Likelihood: 2" },
  { code: "B40-752-WES", name: "Weslin Thomas & Guest", size: 1, note: "Party: Thomas | Likelihood: 5" },
  { code: "B40-774-CHA", name: "Chakra & Rupali Gopichetty", size: 2, note: "Party: Gopichetty | Likelihood: 3" },
  { code: "B40-802-MAT", name: "Matt & Amber Andre", size: 2, note: "Party: Andre | Likelihood: 1" },
  { code: "B40-805-CAR", name: "Carl & Paige Lorch", size: 2, note: "Party: Lorch | Likelihood: 1" },
  { code: "B40-860-JAY", name: "Jaymee Bohannon & Guest", size: 1, note: "Party: Bohannon | Likelihood: 5" },
  { code: "B40-871-ERI", name: "Eric Cruz & Kevin Schroeder", size: 2, note: "Party: Cruz | Likelihood: 1" },
  { code: "B40-904-NAS", name: "Nastasia Glaser & Guest", size: 1, note: "Party: Glaser | Likelihood: 2" },
  { code: "B40-M4E-PAU", name: "Paul & Victoria Mahoney", size: 2, note: "Party: Mahoney | Likelihood: 4" },
  { code: "B40-M6K-GAB", name: "Gabi Pirraglia & Guest", size: 1, note: "Party: Mahoney | Likelihood: 2" },
];

async function main() {
  console.log('\n🚀 Voyageurs Guest Import (Admin SDK)\n');

  const batch = db.batch();
  let count = 0;

  for (const guest of guests) {
    const docRef = db.collection('events').doc(EVENT_ID).collection('guests').doc(guest.code);
    const guestData = {
      id: guest.code,
      name: guest.name,
      email: "",
      status: "Pending",
      guestsCount: guest.size,
      dietary: "",
      note: guest.note,
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

    batch.set(docRef, guestData, { merge: true });
    console.log(`  ✅ ${guest.name.padEnd(45)} → ${guest.code}`);
    count++;
  }

  console.log(`\n📤 Committing ${count} guests to Firestore...`);
  await batch.commit();

  console.log(`✅ Import complete!`);
  console.log(`📂 Collection: events/${EVENT_ID}/guests`);
  console.log(`🌐 RSVP URL: https://bryans40th.voyageurs.app?code=<CODE>\n`);

  process.exit(0);
}

main().catch(err => { console.error('❌ Import failed:', err); process.exit(1); });
