/// <reference types="vite/client" />

export interface StripeCustomerPayload {
  name: string;
  email: string;
  phone?: string;
  metadata?: Record<string, any>;
}

class StripeService {
  private apiUrl: string = import.meta.env.VITE_STRIPE_FUNCTION_URL || '/api/stripe';

  /**
   * Syncs user details to Stripe to create/update a customer.
   * Useful for managing individual stay payments or group activity billing.
   */
  async syncCustomer(payload: StripeCustomerPayload): Promise<boolean> {
    if (!import.meta.env.VITE_STRIPE_FUNCTION_URL) {
      console.group('%c 💳 STRIPE CUSTOMER SYNC (SIMULATED)', 'color: #D67252; font-weight: bold; font-size: 12px;');
      console.log('No VITE_STRIPE_FUNCTION_URL set. Customer data:', payload);
      console.groupEnd();
      return true;
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Stripe Sync failed with status ${response.status}`);
      }

      console.log('%c 💳 STRIPE SYNC SUCCESS', 'color: #D67252; font-weight: bold; font-size: 10px;');
      return true;
    } catch (error) {
      console.error('StripeService Error:', error);
      return false;
    }
  }

  /**
   * Specifically for new registrations
   */
  async handleNewRegistration(data: { name: string; email: string; phone?: string; guests: number }): Promise<boolean> {
    return this.syncCustomer({
      name: data.name,
      email: data.email,
      phone: data.phone,
      metadata: {
        source: 'Voyageurs App',
        guests: data.guests.toString(),
        joined_at: new Date().toISOString()
      }
    });
  }
}

export const stripeService = new StripeService();
