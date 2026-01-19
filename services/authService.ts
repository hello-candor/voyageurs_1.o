
/**
 * Authentication Service
 * 
 * Currently a stub to simulate secure backend authentication.
 * In production, this will be replaced with Firebase Auth or a real API call.
 */

export const authService = {
  /**
   * Simulates a secure host login.
   */
  loginHost: async (password: string): Promise<boolean> => {
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock Validation Logic
    // In a real scenario, this password is sent to the server.
    // For this prototype refactor, we accept complex passwords to simulate security
    // without exposing the literal 'BRYAN' check in the component tree.
    // Logic: Accepts specific "admin" patterns or the legacy password for transition.
    const isValid = (
        password === 'BRYAN' || 
        (
            password.length > 5 && 
            (
                password.toLowerCase().includes('montpellier') || 
                password.includes('admin')
            )
        )
    );

    return isValid;
  },

  /**
   * Simulates creating a new host account.
   * Allows any valid email/password combination to create a new host session.
   */
  createHostAccount: async (email: string, password: string): Promise<boolean> => {
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, this would create the user record.
    // For the prototype, we just allow the flow to proceed.
    console.log(`Creating host account for ${email}`);
    return true;
  },

  logoutHost: async (): Promise<void> => {
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 300));
    return;
  }
};
