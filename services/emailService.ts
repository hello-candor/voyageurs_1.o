/// <reference types="vite/client" />

import { templates, TemplateId } from './emailTemplates';
import { notificationService } from './notificationService';

class EmailService {
  private apiUrl: string = import.meta.env.VITE_SENDGRID_FUNCTION_URL || '/api/send-email';

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

    // --- MOCK OR REAL BACKEND TRANSMISSION ---
    try {
      if (import.meta.env.VITE_SENDGRID_FUNCTION_URL) {
        const response = await fetch(this.apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to, subject, html, text })
        });

        if (!response.ok) {
          throw new Error(`SendGrid API failed with status ${response.status}`);
        }
      } else {
        console.group(`%c 📧 EMAIL SENT (SIMULATED): ${to}`, 'color: #D67252; font-weight: bold; font-size: 14px;');
        console.log(`%cSubject: ${subject}`, 'font-weight: bold;');
        console.log(`%cTemplate: ${templateId}`, 'color: #888;');
        console.log(text);
        console.groupEnd();
        await new Promise(resolve => setTimeout(resolve, 600));
      }

      await notificationService.sendPush(
        `📧 Email Sent: ${subject}`,
        `To: ${to}`,
        data.url || '/'
      );
      
      return true;
    } catch (error) {
      console.error('EmailService Error:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
