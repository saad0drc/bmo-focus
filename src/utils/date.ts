/** Format a Date as a YYYY-MM-DD string in local timezone (avoids UTC-offset bugs). */
export function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Today's date as YYYY-MM-DD in local timezone. */
export function todayStr(): string {
  return toDateStr(new Date());
}
