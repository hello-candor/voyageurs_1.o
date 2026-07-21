import { signInAnonymously } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { db, auth } from '../firebaseConfig';

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1MZNtv8kjgr6bYzSW_ZPlY1R37-B2jBUt9YIS-QoxzpY/gviz/tq?tqx=out:csv&sheet=Guest%20List';
const EVENT_ID = 'voyageurs_2026';

function mapToGuest(row: any) {
    let status = 'Pending';
    const rsvpValue = String(row['RSVP '] || row['RSVP'] || '').trim().toLowerCase();
    if (rsvpValue === 'attending' || rsvpValue === 'confirmed') status = 'Confirmed';
    else if (rsvpValue === 'not attending' || rsvpValue === 'declined') status = 'Declined';
    else if (rsvpValue === 'waiting' || rsvpValue === 'pending') status = 'Pending';

    let arrivalMode = 'Plane';
    let arrivalNumber = '';
    if (row['Arrival Airport'] && String(row['Arrival Airport']).trim() !== '') {
        arrivalMode = 'Plane';
        arrivalNumber = String(row['Arrival Airport']).trim();
    } else if (row['Arrival Train'] && String(row['Arrival Train']).trim() !== '') {
        arrivalMode = 'Train';
        arrivalNumber = String(row['Arrival Train']).trim();
    }

    const email = String(row['Email'] || '').trim();
    const name = String(row['AddressTO'] || row['First Guest'] || '').trim();
    const invitationCode = String(row['Invite Code'] || row['Invitation Code'] || '').trim().toUpperCase();

    const docId = invitationCode || (email ? email.toLowerCase() : `guest-${Date.now()}`);

    const partyInfo = String(row['Party'] || '').trim();
    const likelihood = String(row['Likelihood'] || '').trim();
    const note = partyInfo || likelihood ? `Party: ${partyInfo} | Likelihood: ${likelihood}` : '';

    const eventConfirmations: Record<string, boolean> = {};
    if (row['Event Friday']) eventConfirmations['friday'] = String(row['Event Friday']).trim().toLowerCase() === 'yes';
    if (row['Event Excursion']) eventConfirmations['excursion'] = String(row['Event Excursion']).trim().toLowerCase() === 'yes';
    if (row['Event Saturday']) eventConfirmations['saturday'] = String(row['Event Saturday']).trim().toLowerCase() === 'yes';
    if (row['Event Sunday']) eventConfirmations['sunday'] = String(row['Event Sunday']).trim().toLowerCase() === 'yes';

    return {
        id: docId,
        name: name,
        email: email,
        status: status,
        guestsCount: parseInt(row['Party Size']) || 1,
        dietary: String(row['Dietary'] || '').trim(),
        note: note,
        img: `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Guest')}&background=D67252&color=fff`,
        invitationCode: invitationCode,
        privacy: {
            shareSocial: true,
            sharePhone: true,
            shareInterests: true,
            publicRegistry: true,
            smsConsent: true
        },
        travelDetails: {
            arrivalDate: String(row['Arrival Date'] || '').trim(),
            departureDate: String(row['Departure Date'] || '').trim(),
            arrivalMode: arrivalMode,
            arrivalNumber: arrivalNumber,
            accommodation: String(row['Lodging '] || row['Lodging'] || '').trim()
        },
        eventConfirmations: eventConfirmations
    };
}

async function fetchCSV(): Promise<string> {
    console.log(`🌐 Fetching from Google Sheets...`);
    const response = await fetch(SHEET_CSV_URL);
    if (!response.ok) throw new Error(`Failed to fetch sheet: ${response.status}`);
    return response.text();
}

async function importGuests() {
    console.log('\n🚀 Voyageurs Guest Import (Web SDK)\n');
    await signInAnonymously(auth);
    console.log('✅ Signed in anonymously.');

    const csvContent = await fetchCSV();
    const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
    });

    console.log(`📋 Found ${records.length} rows in spreadsheet\n`);

    let count = 0;
    const guests: any[] = [];

    for (const record of records) {
        const guestData = mapToGuest(record);
        if (!guestData.invitationCode) {
            console.warn(`  ⚠️  Skipping "${guestData.name}" — no invitation code`);
            continue;
        }

        console.log(`  ✅ ${guestData.name.padEnd(45)} Code: ${guestData.invitationCode}`);

        const docRef = doc(db, 'events', EVENT_ID, 'guests', guestData.id);
        await setDoc(docRef, guestData, { merge: true });
        guests.push(guestData);
        count++;
    }

    console.log(`\n📤 Committed ${count} guests to Firestore (events/${EVENT_ID}/guests)...`);
    console.log('✅ Import complete!\n');
    process.exit(0);
}

importGuests().catch((err) => {
    console.error('❌ Import failed:', err);
    process.exit(1);
});
