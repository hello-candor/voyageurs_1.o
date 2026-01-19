
export const isValidEmail = (email: string): boolean => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
};

export const isValidName = (name: string): boolean => {
  return name.trim().length >= 2;
};

export const isValidPhone = (phone: string): boolean => {
  if (!phone) return true; // Optional fields return true if empty
  
  // Remove all non-numeric characters (allow + at start is handled by logic below)
  const clean = phone.replace(/[^0-9+]/g, '');
  
  // Basic sanity check: 
  // Min 8 digits (e.g. some countries), Max 15 (E.164 standard)
  // Must allow leading +
  const digitsOnly = clean.replace(/[^0-9]/g, '');
  
  if (digitsOnly.length < 8 || digitsOnly.length > 15) return false;

  // Specific check for French mobile logic if it looks like one (starts with 06, 07, or +336, +337)
  // This is optional loose validation to guide users but not block valid international numbers
  return true; 
};

export const isValidInstagram = (handle: string): boolean => {
  if (!handle) return true;
  // allow with or without @, no spaces, allowed chars
  const re = /^@?[a-zA-Z0-9._]{1,30}$/;
  return re.test(handle);
};

export const isValidAmount = (amount: number): boolean => {
  return amount > 0 && isFinite(amount);
};
