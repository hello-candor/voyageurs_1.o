/// <reference types="vite/client" />

export interface ZapierPayload {
  name: string;
  email: string;
  phone?: string;
  status: string;
  guestsCount: number;
  dietaryRestrictions?: string;
  source: string;
  timestamp: string;
}

class ZapierService {
  private webhookUrl: string = import.meta.env.VITE_ZAPIER_WEBHOOK_URL || '';

  /**
   * Sends data to a Zapier Webhook.
   * Useful for syncing to Google Sheets, CRMs, or other third-party tools.
   */
  async triggerWebhook(payload: ZapierPayload): Promise<boolean> {
    if (!this.webhookUrl) {
      console.group('%c ⚡ ZAPIER WEBHOOK (SIMULATED)', 'color: #D67252; font-weight: bold; font-size: 12px;');
      console.log('No VITE_ZAPIER_WEBHOOK_URL set. Data would be sent to Zapier:', payload);
      console.groupEnd();
      return true;
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        // Note: Zapier usually expects 'application/json' but sometimes likes 
        // no content-type for CORS simple requests. JSON is standard modern practice.
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Zapier Webhook failed with status ${response.status}`);
      }

      console.log('%c ⚡ ZAPIER WEBHOOK SUCCESS', 'color: #D67252; font-weight: bold; font-size: 10px;');
      return true;
    } catch (error) {
      console.error('ZapierService Error:', error);
      return false;
    }
  }

  /**
   * Specifically for new RSVPs/Registrations
   */
  async syncNewRegistration(data: { 
    name: string; 
    email: string; 
    phone?: string; 
    status: string; 
    guests: number;
    dietary?: string;
  }): Promise<boolean> {
    const payload: ZapierPayload = {
      ...data,
      guestsCount: data.guests,
      source: 'Voyageurs App',
      timestamp: new Date().toISOString()
    };
    return this.triggerWebhook(payload);
  }
}

export const zapierService = new ZapierService();
