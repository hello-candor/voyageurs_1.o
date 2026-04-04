/// <reference types="vite/client" />

import { notificationService } from './notificationService';

export interface SMSPayload {
  to: string;
  body: string;
  mediaUrl?: string;
}

class TwilioService {
  private apiUrl: string = import.meta.env.VITE_TWILIO_FUNCTION_URL || '/api/send-sms';

  /**
   * Sends an SMS via Twilio.
   * Integrates with a backend proxy/function to keep SID/Token secure.
   */
  async sendSMS(to: string, body: string, mediaUrl?: string): Promise<boolean> {
    if (!to) {
      console.warn('TwilioService: No recipient phone number provided.');
      return false;
    }

    const payload: SMSPayload = { to, body, mediaUrl };

    try {
      // 1. Log to console for development visibility
      console.group('%c 📱 TWILIO SMS DISPATCH', 'color: #D67252; font-weight: bold; font-size: 12px;');
      console.log(`%cTo: ${to}`, 'color: #1E4472; font-weight: bold;');
      console.log(`%cMessage: ${body}`, 'color: #333; font-style: italic;');
      if (mediaUrl) console.log(`%cMedia: ${mediaUrl}`, 'color: #888;');
      console.groupEnd();

      // 2. Real transmission attempt if URL is configured
      if (import.meta.env.VITE_TWILIO_FUNCTION_URL) {
        const response = await fetch(this.apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`Twilio API failed with status ${response.status}`);
        }
      } else {
        // Simulation mode for development without secrets
        console.debug('TwilioService: VITE_TWILIO_FUNCTION_URL not set. Running in simulation mode.');
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      // 3. Trigger UI feedback (optional, but helps UX in this app)
      await notificationService.sendPush(
        `💬 SMS Sent`,
        `Message to ${to}: "${body.substring(0, 30)}..."`
      );

      return true;
    } catch (error) {
      console.error('TwilioService Error:', error);
      return false;
    }
  }

  /**
   * Specifically for TCPA-compliant welcome messages
   */
  async sendWelcomeSMS(name: string, to: string): Promise<boolean> {
    const body = `Bonjour ${name}! Welcome to Voyageurs 2026. You're all set for the hubs. Reply STOP to opt out.`;
    return this.sendSMS(to, body);
  }
}

export const twilioService = new TwilioService();
