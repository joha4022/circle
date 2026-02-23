export function getNextBirthdayDate(birthday: Date, now = new Date()): Date {
  const month = birthday.getUTCMonth();
  const day = birthday.getUTCDate();

  const candidate = new Date(Date.UTC(now.getUTCFullYear(), month, day));

  if (candidate < new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))) {
    candidate.setUTCFullYear(candidate.getUTCFullYear() + 1);
  }

  return candidate;
}

export function daysUntil(target: Date, now = new Date()): number {
  const oneDayMs = 24 * 60 * 60 * 1000;
  return Math.ceil((target.getTime() - now.getTime()) / oneDayMs);
}
