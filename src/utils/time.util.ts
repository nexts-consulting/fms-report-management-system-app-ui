/**
 * Formats a date string to HH:mm AM/PM format
 * @param date - ISO date string
 * @returns Formatted time string (e.g., "09:30 AM")
 */
export const formatTime = (date: string): string => {
  const d = new Date(date);
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`;
};

/**
 * Checks if date1 is after date2
 * @param date1 - First date to compare
 * @param date2 - Second date (ISO string) to compare
 * @returns True if date1 is after date2
 */
export const isAfter = (date1: Date, date2: string): boolean => {
  return date1.getTime() > new Date(date2).getTime();
};

