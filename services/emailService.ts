
import { templates, TemplateId } from './emailTemplates';
import { notificationService } from './notificationService';

class EmailService {
  /**
   * Sends a templated email.
   * In a real environment, this would call a backend API (e.g. /api/send-email).
   * In this demo, it simulates the send and logs to console.
   */
  async sendTemplateEmail(to: string, templateId: TemplateId, data: any): Promise<boolean> {
    const generator = templates[templateId];
    if (!generator) {
      console.error(`Email Template ${templateId} not found.`);
      return false;
    }

    const { subject, html, text } = generator(data);

    // --- MOCK BACKEND TRANSMISSION ---
    console.group(`%c 📧 EMAIL SENT TO: ${to}`, 'color: #D67252; font-weight: bold; font-size: 14px;');
    console.log(`%cSubject: ${subject}`, 'font-weight: bold;');
    console.log(`%cTemplate: ${templateId}`, 'color: #888;');
    console.log(text); // Log text version for readability
    console.log('%c[HTML Body Hidden - See Network Tab in Prod]', 'color: #aaa; font-style: italic;');
    console.groupEnd();

    // Simulate Network Latency
    await new Promise(resolve => setTimeout(resolve, 600));

    // Trigger a simulated Push Notification to give visual feedback to the user testing the app
    await notificationService.sendPush(
      `📧 Email Sent: ${subject}`,
      `To: ${to}`,
      data.url || '/'
    );

    return true;
  }
}

export const emailService = new EmailService();
