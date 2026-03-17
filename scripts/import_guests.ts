import { google } from 'googleapis';
import * as admin from 'firebase-admin';
import * as path from 'path';

// IMPORTANT: You need to set up a service account for Firebase Admin and Google Sheets API.
// 1. Go to Firebase Console -> Project Settings -> Service Accounts
// 2. Click "Generate new private key" and save the JSON file.
// 3. Go to Google Cloud Console -> APIs & Services -> Credentials
// 4. Ensure the Google Sheets API is enabled for your project.
// 5. The service account email needs to be given "Viewer" access to the Google Sheet.
// 6. Set the GOOGLE_APPLICATION_CREDENTIALS environment variable to the path of your JSON key file.

// Initialize Firebase Admin (make sure you have the environment variable set or pass credentials directly)
if (!admin.apps.length) {
    admin.initializeApp({
      // If you are not using GOOGLE_APPLICATION_CREDENTIALS, you can provide credentials here:
      // credential: admin.credential.cert(require('./path/to/your/serviceAccountKey.json'))
    });
}

const db = admin.firestore();

// The ID of the spreadsheet to import.
// Extracted from: https://docs.google.com/spreadsheets/d/1MZNtv8kjgr6bYzSW_ZPlY1R37-B2jBUt9YIS-QoxzpY/edit
const SPREADSHEET_ID = '1MZNtv8kjgr6bYzSW_ZPlY1R37-B2jBUt9YIS-QoxzpY';
// The range to read from the sheet. Adjust this based on your sheet's structure.
// For example, 'Sheet1!A1:Z' reads all rows and columns A through Z from Sheet1.
const RANGE = 'Guest List!A1:Z'; // UPDATE THIS TO MATCH YOUR SHEET NAME

async function importGuestData() {
  try {
    // Authenticate with Google API
    const auth = new google.auth.GoogleAuth({
        // This relies on GOOGLE_APPLICATION_CREDENTIALS environment variable
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    console.log(`Fetching data from spreadsheet ${SPREADSHEET_ID}, range ${RANGE}...`);
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found in the spreadsheet.');
      return;
    }

    // Assuming the first row contains headers
    const headers = rows[0];
    console.log('Headers found:', headers);

    const batch = db.batch();
    const guestsRef = db.collection('guests'); // The name of your Firestore collection

    // Iterate through the rows (skipping the header row)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const guestData: any = {};

      // Map row data to object properties based on headers
      headers.forEach((header: string, index: number) => {
          // Normalize header to use as object key (e.g., "First Name" -> "firstName")
          // You might need to adjust this logic based on your exact column names
          const key = header.trim().toLowerCase().replace(/\s+(.)/g, (match, group1) => group1.toUpperCase());
          // Only add the value if it exists, otherwise use null or empty string
          guestData[key] = row[index] !== undefined ? row[index] : null;
      });

        console.log(`Processing row ${i}:`, guestData);

        // We need a unique ID for each guest. 
        // If your sheet has an 'email' column, that's often a good choice for document ID or checking for existing.
        // If not, Firestore can generate a random ID.
        
        let docRef;
        if (guestData.email) {
            // Use email as document ID (ensure it's lowercased and trimmed)
            docRef = guestsRef.doc(guestData.email.toLowerCase().trim());
        } else {
             // Generate random ID
             docRef = guestsRef.doc();
        }

        // Add to batch operation
        // We use set with merge:true to update existing documents without overwriting fields not in the sheet
        batch.set(docRef, guestData, { merge: true });
    }

    // Commit the batch
    console.log('Committing data to Firestore...');
    await batch.commit();
    console.log(`Successfully imported ${rows.length - 1} guests to Firestore.`);

  } catch (error) {
    console.error('Error importing data:', error);
  }
}

// Execute the import
importGuestData();