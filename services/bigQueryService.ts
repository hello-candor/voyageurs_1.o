/// <reference types="vite/client" />

export interface BigQueryPayload {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  status: string;
  guestsCount: number;
  event: string;
  timestamp: string;
}

class BigQueryService {
  private apiUrl: string = import.meta.env.VITE_BIGQUERY_FUNCTION_URL || '/api/bigquery';

  /**
   * Syncs registration and interaction data to a central BigQuery data warehouse for advanced analytics.
   * Leverages a backend function/proxy to securely store data in Google Cloud.
   */
  async appendLog(payload: BigQueryPayload): Promise<boolean> {
    if (!import.meta.env.VITE_BIGQUERY_FUNCTION_URL) {
      console.group('%c 📊 BIGQUERY APPEND (SIMULATED)', 'color: #D67252; font-weight: bold; font-size: 12px;');
      console.log('No VITE_BIGQUERY_FUNCTION_URL set. Appending log:', payload);
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
        throw new Error(`BigQuery Append failed with status ${response.status}`);
      }

      console.log('%c 📊 BIGQUERY APPEND SUCCESS', 'color: #D67252; font-weight: bold; font-size: 10px;');
      return true;
    } catch (error) {
      console.error('BigQueryService Error:', error);
      return false;
    }
  }

  /**
   * Specifically for tracking new registrations and status updates
   */
  async trackRegistration(data: { name: string; email: string; phone?: string; status: string; guests: number }): Promise<boolean> {
    const payload: BigQueryPayload = {
      ...data,
      userId: data.email, // Using email as a simple ID placeholder
      guestsCount: data.guests,
      event: 'REGISTER_ONBOARDING',
      timestamp: new Date().toISOString()
    };
    return this.appendLog(payload);
  }
}

export const bigQueryService = new BigQueryService();
