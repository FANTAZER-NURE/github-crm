/**
 * Convert a Date object to UTC Unix timestamp (seconds since epoch)
 */
export function dateToUnixTimestamp(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

