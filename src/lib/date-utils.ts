// ============================================================================
// What's Poppin! - Date Utility Functions
// File: date-utils.ts
// Description: Date formatting and manipulation for events
// NASA Rule 10: All functions ≤60 lines
// ============================================================================

export type DateRange = 'today' | 'week' | 'weekend' | 'month';

/**
 * Format event date to readable string
 * @param date - Date to format
 * @returns Formatted date string (e.g., "Fri, Oct 4")
 */
export function formatEventDate(date: string | Date): string {
  const d = new Date(date);
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  };
  return d.toLocaleDateString('en-US', options);
}

/**
 * Format event time to readable string
 * @param date - Date to format
 * @returns Formatted time string (e.g., "7:00 PM")
 */
export function formatEventTime(date: string | Date): string {
  const d = new Date(date);
  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  };
  return d.toLocaleTimeString('en-US', options);
}

/**
 * Format event date and time combined
 * @param date - Date to format
 * @returns Formatted string (e.g., "Fri, Oct 4 at 7:00 PM")
 */
export function formatEventDateTime(date: string | Date): string {
  const formattedDate = formatEventDate(date);
  const formattedTime = formatEventTime(date);
  return `${formattedDate} at ${formattedTime}`;
}

/**
 * Get date range filter boundaries
 * @param range - Range type
 * @returns Start and end dates
 */
export function getDateRangeFilter(range: DateRange): {
  start: Date;
  end: Date;
} {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  switch (range) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'week':
      start.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() + 7);
      end.setHours(23, 59, 59, 999);
      break;
    case 'weekend':
      const currentDay = now.getDay();
      const daysUntilFriday = (5 - currentDay + 7) % 7;
      start.setDate(start.getDate() + daysUntilFriday);
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 2);
      end.setHours(23, 59, 59, 999);
      break;
    case 'month':
      start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth() + 1);
      end.setHours(23, 59, 59, 999);
      break;
  }

  return { start, end };
}

/**
 * Check if event is upcoming (in the future)
 * @param event - Event object with start_time
 * @returns True if event hasn't started yet
 */
export function isEventUpcoming(event: { start_time: string }): boolean {
  const now = new Date();
  const eventStart = new Date(event.start_time);
  return eventStart > now;
}

/**
 * Check if event is happening today
 * @param event - Event object with start_time
 * @returns True if event is today
 */
export function isEventToday(event: { start_time: string }): boolean {
  const now = new Date();
  const eventDate = new Date(event.start_time);

  return (
    eventDate.getDate() === now.getDate() &&
    eventDate.getMonth() === now.getMonth() &&
    eventDate.getFullYear() === now.getFullYear()
  );
}

/**
 * Get relative time description
 * @param date - Date to compare
 * @returns Relative string (e.g., "Today", "Tomorrow", "In 3 days")
 */
export function getRelativeTime(date: string | Date): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = target.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays > 7 && diffDays <= 30) {
    const weeks = Math.floor(diffDays / 7);
    return `In ${weeks} week${weeks > 1 ? 's' : ''}`;
  }

  return formatEventDate(date);
}

/**
 * Format price for display
 * @param price - Price in cents or null
 * @returns Formatted price string
 */
export function formatPrice(price: number | null): string {
  if (price === null || price === 0) return 'FREE';
  return `$${(price / 100).toFixed(2)}`;
}

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T14:30:00 | coder@sonnet-4.5 | Date utility functions | OK |
/* AGENT FOOTER END */
