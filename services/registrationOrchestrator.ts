import { twilioService } from './twilioService';
import { zapierService } from './zapierService';
import { stripeService } from './stripeService';
import { bigQueryService } from './bigQueryService';
import { abacusService } from './abacusService';
import { emailService } from './emailService';

export interface RegistrationPayload {
  name: string;
  email: string;
  phone?: string;
  status: string;
  guests: number;
}

/**
 * Orchestrates all third-party integrations that fire when a guest completes registration.
 * Consolidates what was previously 6 inline fire-and-forget calls in OnboardingFlow.
 * Uses Promise.allSettled so failures are logged but never block the user flow.
 */
export async function onGuestRegistered(data: RegistrationPayload): Promise<void> {
  const results = await Promise.allSettled([
    data.phone
      ? twilioService.sendWelcomeSMS(data.name, data.phone)
      : Promise.resolve(),
    zapierService.syncNewRegistration({
      name: data.name,
      email: data.email,
      phone: data.phone,
      status: data.status,
      guests: data.guests,
    }),
    stripeService.handleNewRegistration({
      name: data.name,
      email: data.email,
      phone: data.phone,
      guests: data.guests,
    }),
    bigQueryService.trackRegistration({
      name: data.name,
      email: data.email,
      phone: data.phone,
      status: data.status,
      guests: data.guests,
    }),
    abacusService.notifyRegistration({
      name: data.name,
      email: data.email,
      phone: data.phone,
      guests: data.guests,
    }),
    emailService.sendTemplateEmail(data.email, 'WELCOME', {
      name: data.name,
      url: typeof window !== 'undefined' ? window.location.origin : '',
    }),
  ]);

  // Log failures for observability instead of silently swallowing
  const serviceNames = ['Twilio', 'Zapier', 'Stripe', 'BigQuery', 'Abacus', 'Email'];
  results.forEach((result, i) => {
    if (result.status === 'rejected') {
      console.error(`[RegistrationOrchestrator] ${serviceNames[i]} failed:`, result.reason);
    }
  });
}
