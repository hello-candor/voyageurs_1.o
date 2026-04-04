
export type TemplateId = 'WELCOME' | 'INVITATION' | 'NEW_MESSAGE';

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

const styles = {
  container: 'font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1E4472; line-height: 1.6;',
  header: 'background-color: #1E4472; color: #FDFBF7; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;',
  body: 'padding: 20px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;',
  button: 'display: inline-block; background-color: #D67252; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 20px;',
  footer: 'font-size: 12px; color: #888; text-align: center; margin-top: 20px;'
};

export const templates: Record<TemplateId, (data: any) => EmailContent> = {
  WELCOME: (data: { name: string; url: string }) => ({
    subject: `Bienvenue to , ${data.name}`,
    text: `Bonjour ${data.name}, Welcome to the Voyageurs App. We are thrilled to have you join the celebration. Access your itinerary here: ${data.url}`,
    html: `
      <div style="${styles.container}">
        <div style="${styles.header}">
          <h1 style="margin:0;">Voyageurs</h1>
        </div>
        <div style="${styles.body}">
          <h2 style="color: #D67252;">Bonjour ${data.name},</h2>
          <p>Welcome to the official companion app for September 18-20 Birthday celebration in .</p>
          <p>Your profile is now active. You can use the Hub to:</p>
          <ul>
            <li>Manage your RSVP & Logistics</li>
            <li>Connect with other guests</li>
            <li>View the official itinerary</li>
          </ul>
          <div style="text-align: center;">
            <a href="${data.url}" style="${styles.button}">Enter The Hub</a>
          </div>
        </div>
        <div style="${styles.footer}">
           2026 • L'Art de Vivre
        </div>
      </div>
    `
  }),

  INVITATION: (data: { inviteeName: string; senderName: string; code: string; url: string }) => ({
    subject: `${data.senderName} invited you to  2026`,
    text: `${data.inviteeName}, you have been invited by ${data.senderName} to join the travel party for September 18-20. Use code: ${data.code} to join.`,
    html: `
      <div style="${styles.container}">
        <div style="${styles.header}">
          <h1 style="margin:0;">You're Invited</h1>
        </div>
        <div style="${styles.body}">
          <h3>Hello ${data.inviteeName},</h3>
          <p><strong>${data.senderName}</strong> has invited you to join their travel party for the upcoming celebration in France.</p>
          <p>Sync your logistics, view the agenda, and join the excitement.</p>
          <p style="background: #f4f4f4; padding: 15px; text-align: center; font-family: monospace; font-size: 18px; letter-spacing: 2px; font-weight: bold; border-radius: 4px;">
            CODE: ${data.code}
          </p>
          <div style="text-align: center;">
            <a href="${data.url}?code=${data.code}" style="${styles.button}">Accept Invitation</a>
          </div>
        </div>
        <div style="${styles.footer}">
          Voyageurs App • 
        </div>
      </div>
    `
  }),

  NEW_MESSAGE: (data: { recipientName: string; senderName: string; preview: string; url: string }) => ({
    subject: `New Message from ${data.senderName}`,
    text: `You have a new message from ${data.senderName}: "${data.preview}"`,
    html: `
      <div style="${styles.container}">
        <div style="${styles.header}">
          <h1 style="margin:0;">New Message</h1>
        </div>
        <div style="${styles.body}">
          <p><strong>${data.senderName}</strong> sent you a message:</p>
          <blockquote style="font-style: italic; color: #555; border-left: 3px solid #D67252; padding-left: 10px; margin: 15px 0;">
            "${data.preview}"
          </blockquote>
          <div style="text-align: center;">
            <a href="${data.url}" style="${styles.button}">Reply in Hub</a>
          </div>
        </div>
        <div style="${styles.footer}">
          Voyageurs App • Secure Messaging
        </div>
      </div>
    `
  })
};
