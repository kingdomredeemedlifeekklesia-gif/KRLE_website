/**
 * Email validation
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Phone number validation
 * Accepts formats like: +1234567890, +256770000000, 1234567890, etc.
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  const cleanPhone = phone.replace(/\s/g, "");
  return phoneRegex.test(cleanPhone) && cleanPhone.length >= 10;
}

/**
 * Name validation
 */
export function isValidName(name: string): boolean {
  return name.trim().length >= 2 && name.trim().length <= 255;
}
