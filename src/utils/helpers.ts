
// Date Helpers
export function formatDate(date: Date | string | number, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = new Date(date);
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };
  return dateObj.toLocaleDateString(navigator.language || 'pt-BR', defaultOptions);
}

export function formatTime(date: Date | string | number, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = new Date(date);
   const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    ...options,
  };
  return dateObj.toLocaleTimeString(navigator.language || 'pt-BR', defaultOptions);
}

export function formatDateTime(date: Date | string | number, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = new Date(date);
   const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  };
  return dateObj.toLocaleString(navigator.language || 'pt-BR', defaultOptions);
}

// Validation Helpers
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhoneNumber(phone: string): boolean {
  // Basic regex for common phone formats (e.g., (XX) XXXXX-XXXX or XXXXXXXXXXX)
  // Adjust as needed for specific country formats
  const phoneRegex = /^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/;
  return phoneRegex.test(phone);
}

export function isDateInFuture(date: Date | string): boolean {
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Compare dates only, not time
  return inputDate >= today;
}

// Mask Helpers
export function maskPhoneNumber(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{4,5})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone; // Return original if no match (e.g. incomplete)
}

export function maskCurrency(value: number | string, locale: string = 'pt-BR', currency: string = 'BRL'): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '';
  return new Intl.NumberFormat(locale, { style: 'currency', currency: currency }).format(numValue);
}

// General Helpers
export function capitalizeFirstLetter(string: string): string {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
