const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.processScheduledEmails = functions.pubsub.schedule('every 15 minutes').onRun(async (context) => {
  const db = admin.firestore();
  const now = admin.firestore.Timestamp.now();
  
  // Find pending emails scheduled for now or in the past
  const scheduledEmailsQuery = await db.collection('scheduled_emails')
    .where('status', '==', 'pending')
    .where('sendAt', '<=', now)
    .get();

  if (scheduledEmailsQuery.empty) {
    console.log('No scheduled emails to process.');
    return null;
  }

  const batch = db.batch();

  scheduledEmailsQuery.forEach((doc) => {
    const emailData = doc.data();
    
    // Create a new document in the "mail" collection for the Trigger Email extension
    const mailDocRef = db.collection('mail').doc();
    batch.set(mailDocRef, {
      to: emailData.to,
      message: emailData.message,
    });

    // Mark the scheduled email as sent
    batch.update(doc.ref, {
      status: 'sent',
      sentAt: now
    });
  });

  await batch.commit();
  console.log(`Processed ${scheduledEmailsQuery.size} scheduled emails.`);
  return null;
});
