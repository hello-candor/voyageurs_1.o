/**
 * Import guests from the Google Sheet CSV into Firestore.
 * 
 * This script reads your guest list directly from Google Sheets (published as CSV)
 * and writes each guest to Firestore at: events/voyageurs_2026/guests/{id}
 * 
 * Usage:
 *   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"
 *   npx tsx scripts/import_guests_sheet.ts
 * 
 * Or with a local CSV file:
 *   npx tsx scripts/import_guests_sheet.ts --csv path/to/file.csv
 */

import admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1MZNtv8kjgr6bYzSW_ZPlY1R37-B2jBUt9YIS-QoxzpY/gviz/tq?tqx=out:csv&sheet=Guest%20List';
const EVENT_ID = 'voyageurs_2026';

function mapToGuest(row: any) {
    // RSVP Status
    let status = 'Pending';
    const rsvpValue = String(row['RSVP '] || row['RSVP'] || '').trim().toLowerCase();
    if (rsvpValue === 'attending' || rsvpValue === 'confirmed') status = 'Confirmed';
    else if (rsvpValue === 'not attending' || rsvpValue === 'declined') status = 'Declined';
    else if (rsvpValue === 'waiting' || rsvpValue === 'pending') status = 'Pending';

    // Transport
    let arrivalMode = 'Plane';
    let arrivalNumber = '';
    if (row['Arrival Airport'] && String(row['Arrival Airport']).trim() !== '') {
        arrivalMode = 'Plane';
        arrivalNumber = String(row['Arrival Airport']).trim();
    } else if (row['Arrival Train'] && String(row['Arrival Train']).trim() !== '') {
        arrivalMode = 'Train';
        arrivalNumber = String(row['Arrival Train']).trim();
    }

    // Identity
    const email = String(row['Email'] || '').trim();
    const name = String(row['AddressTO'] || row['First Guest'] || '').trim();
    const invitationCode = String(row['Invite Code'] || row['Invitation Code'] || '').trim().toUpperCase();

    // Use invitation code as doc ID (more reliable than email for this guest list)
    const docId = invitationCode || (email ? email.toLowerCase() : `guest-${Date.now()}`);

    // Notes
    const partyInfo = String(row['Party'] || '').trim();
    const likelihood = String(row['Likelihood'] || '').trim();
    const note = partyInfo || likelihood ? `Party: ${partyInfo} | Likelihood: ${likelihood}` : '';

    // Event Confirmations
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
    const csvArg = process.argv.indexOf('--csv');
    if (csvArg !== -1 && process.argv[csvArg + 1]) {
        const filePath = process.argv[csvArg + 1];
        console.log(`📄 Reading from local CSV: ${filePath}`);
        return fs.readFileSync(path.resolve(process.cwd(), filePath), 'utf-8');
    }

    console.log(`🌐 Fetching from Google Sheets...`);
    const response = await fetch(SHEET_CSV_URL);
    if (!response.ok) throw new Error(`Failed to fetch sheet: ${response.status}`);
    return response.text();
}

async function importGuests() {
    console.log('\n🚀 Voyageurs Guest Import\n');

    const csvContent = await fetchCSV();
    const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
    });

    console.log(`📋 Found ${records.length} rows in spreadsheet\n`);

    const guestsRef = db.collection('events').doc(EVENT_ID).collection('guests');
    const batch = db.batch();
    let count = 0;
    const guests: any[] = [];

    for (const record of records) {
        const guestData = mapToGuest(record);
        if (!guestData.invitationCode) {
            console.warn(`  ⚠️  Skipping "${guestData.name}" — no invitation code`);
            continue;
        }

        console.log(`  ✅ ${guestData.name.padEnd(45)} Code: ${guestData.invitationCode}`);

        const docRef = guestsRef.doc(guestData.id);
        batch.set(docRef, guestData, { merge: true });
        guests.push(guestData);
        count++;
    }

    console.log(`\n📤 Committing ${count} guests to Firestore (events/${EVENT_ID}/guests)...`);
    await batch.commit();
    console.log('✅ Import complete!\n');

    // Print summary table
    console.log('┌──────────────────────────────────────────────────┬───────────────┐');
    console.log('│ Guest Name                                       │ RSVP Code     │');
    console.log('├──────────────────────────────────────────────────┼───────────────┤');
    for (const g of guests) {
        console.log(`│ ${g.name.padEnd(48)} │ ${g.invitationCode.padEnd(13)} │`);
    }
    console.log('└──────────────────────────────────────────────────┴───────────────┘');
    console.log(`\n Total: ${count} guests imported`);
    console.log(` RSVP URL format: https://voyageurs.rsvp?code=<CODE>\n`);
}

importGuests().catch((err) => {
    console.error('❌ Import failed:', err);
    process.exit(1);
});
