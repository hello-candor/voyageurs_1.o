import * as fs from 'fs';
import * as path from 'path';
import * as admin from 'firebase-admin';
import { parse } from 'csv-parse/sync';

// IMPORTANT: Setup
// 1. Run: npm install csv-parse
// 2. Run: npx tsx scripts/import_guests_csv.ts "dataconnect/example/Bryan's 40th Guest List - Sheet1 (1).csv"
// Make sure GOOGLE_APPLICATION_CREDENTIALS environment variable is set to your service account key.

if (!admin.apps.length) {
    admin.initializeApp({
      // Alternatively, provide credentials explicitly:
      // credential: admin.credential.cert(require('./serviceAccountKey.json'))
    });
}
const db = admin.firestore();

function mapToGuest(row: any) {
    // 1. Determine RSVP Status
    let status = 'Pending';
    const rsvpValue = String(row['RSVP '] || '').trim();
    if (rsvpValue === 'Attending') status = 'Confirmed';
    else if (rsvpValue === 'Not Attending') status = 'Declined';
    else if (rsvpValue === 'Waiting') status = 'Pending';
    
    // 2. Determine Transport
    let arrivalMode = 'Plane';
    let arrivalNumber = '';
    
    if (row['Arrival Airport'] && String(row['Arrival Airport']).trim() !== '') {
        arrivalMode = 'Plane';
        arrivalNumber = String(row['Arrival Airport']).trim();
    } else if (row['Arrival Train'] && String(row['Arrival Train']).trim() !== '') {
        arrivalMode = 'Train';
        arrivalNumber = String(row['Arrival Train']).trim();
    }
    
    // 3. Identity & Fallbacks
    const email = String(row['Email'] || '').trim();
    const name = String(row['AddressTO'] || row['First Guest'] || '').trim();
    const invitationCode = String(row['Invitation Code'] || '').trim();
    
    // We use Email for doc ID if present; otherwise, use the invitation code
    const docId = email ? email.toLowerCase() : invitationCode;
    
    // Build Note using extra columns
    const partyInfo = String(row['Party'] || '').trim();
    const likelihood = String(row['Likelihood'] || '').trim();
    const note = `Party: ${partyInfo} | Likelihood: ${likelihood}`;

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
            accommodation: String(row['Lodging '] || '').trim()
        }
    };
}

async function importCsv() {
    const csvFilePath = process.argv[2];
    if (!csvFilePath) {
        console.error("Please provide the path to the CSV file as an argument.");
        console.error("Usage: npx tsx scripts/import_guests_csv.ts <path-to-csv>");
        process.exit(1);
    }

    console.log(`Reading CSV from ${csvFilePath}`);
    const fileContent = fs.readFileSync(path.resolve(process.cwd(), csvFilePath), 'utf-8');
    
    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
    });

    console.log(`Parsed ${records.length} records. Uploading to Firestore...`);
    const batch = db.batch();
    const guestsRef = db.collection('guests');
    
    let processedCount = 0;

    for (const record of records) {
        const guestData = mapToGuest(record);
        if (!guestData.id) {
            console.warn(`Skipping row due to missing ID (no email and no invite code): ${guestData.name}`);
            continue;
        }
        
        console.log(`Queueing ${guestData.name} (${guestData.id})`);
        const docRef = guestsRef.doc(guestData.id);
        batch.set(docRef, guestData, { merge: true });
        processedCount++;
    }
    
    console.log(`Committing batch of ${processedCount} guests to Firestore...`);
    await batch.commit();
    console.log('Successfully imported guests!');
}

importCsv().catch(console.error);
