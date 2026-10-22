export const DateUtils = {
  /**
   * Formats a timestamp into dd/MM/yyyy
   */
  format(millis: number): string {
    const d = new Date(millis);
    if (isNaN(d.getTime())) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  },

  /**
   * Adds specified months to dateMillis
   */
  addMonths(dateMillis: number, months: number): number {
    const d = new Date(dateMillis);
    const day = d.getDate();
    d.setMonth(d.getMonth() + months);
    // Handle month overflow edge cases (e.g. 31st into Feb)
    if (d.getDate() !== day) {
      d.setDate(0);
    }
    return d.getTime();
  },

  /**
   * Calculates days remaining until expiryDate, comparing midnight to midnight
   */
  daysRemaining(expiryMillis: number): number {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const expiry = new Date(expiryMillis);
    expiry.setHours(0, 0, 0, 0);

    const diffMs = expiry.getTime() - now.getTime();
    return Math.round(diffMs / (24 * 60 * 60 * 1000));
  },

  /**
   * Converts timestamp to HTML date input string YYYY-MM-DD
   */
  toInputDate(millis: number): string {
    const d = new Date(millis);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  /**
   * Converts YYYY-MM-DD to start of day timestamp
   */
  fromInputDate(dateStr: string): number {
    if (!dateStr) return Date.now();
    const parts = dateStr.split('-');
    if (parts.length !== 3) return Date.now();
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 0, 0, 0, 0);
    return d.getTime();
  },

  /**
   * Currency formatter in Indian Rupees matching Android app layout: ₹xx.xx
   */
  formatPrice(price: number): string {
    return `₹${price.toFixed(2)}`;
  }
};
