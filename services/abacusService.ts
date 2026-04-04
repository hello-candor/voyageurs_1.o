/// <reference types="vite/client" />

export interface AbacusLogEvent {
  source: string;
  type: 'REGISTRATION' | 'RSVP_UPDATE' | 'PAYMENT' | 'MESSAGE_SENT' | 'SYSTEM_ALERT';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  payload: Record<string, any>;
  timestamp: string;
}

class AbacusService {
  private endpoint: string = import.meta.env.VITE_ABACUS_CONSOLE_URL || 'https://console.voyageurs.app/api/abacus';
  private apiKey: string = import.meta.env.VITE_ABACUS_API_KEY || '';

  /**
   * Dispatches a state update or log event to the central Abacus Console.
   * This bridges the local guest app with the master host dashboard.
   */
  async syncEvent(event: AbacusLogEvent): Promise<boolean> {
    if (!this.apiKey) {
      console.group('%c 🧮 ABACUS CONSOLE SYNC (SIMULATED)', 'color: #1E4472; font-weight: bold; font-size: 12px;');
      console.log('No VITE_ABACUS_API_KEY set. Event details:', event);
      console.groupEnd();
      return true;
    }

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Abacus-Source': 'voyageurs-app-v1'
        },
        body: JSON.stringify(event)
      });

      if (!response.ok) {
        throw new Error(`Abacus Sync failed with status ${response.status}`);
      }

      console.log('%c 🧮 ABACUS SYNC SUCCESS', 'color: #1E4472; font-weight: bold; font-size: 10px;');
      return true;
    } catch (error) {
      console.error('AbacusService Error:', error);
      return false;
    }
  }

  /**
   * Helper to notify Abacus of a new registration
   */
  async notifyRegistration(guestData: { name: string; email: string; phone?: string; guests: number }): Promise<boolean> {
    return this.syncEvent({
      source: 'ONBOARDING_FLOW',
      type: 'REGISTRATION',
      severity: 'INFO',
      payload: {
        name: guestData.name,
        email: guestData.email,
        phone: guestData.phone,
        guestsCount: guestData.guests,
        integrations: ['Twilio', 'SendGrid', 'Zapier', 'Stripe', 'BigQuery']
      },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Generates a direct management URL for a specific guest in the Abacus Console
   */
  getConsoleDeepLink(guestId: string): string {
    const baseUrl = import.meta.env.VITE_ABACUS_CONSOLE_URL || 'https://console.voyageurs.app';
    return `${baseUrl}/guests/${encodeURIComponent(guestId)}`;
  }
}

export const abacusService = new AbacusService();
