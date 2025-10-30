export type Reminder = {
  id: string;
  rrule: string | null;
  time_of_day: string | null;
};

export function isDue(reminder: Reminder, now: Date): boolean {
  if (!reminder.rrule) return false;
  const [, timePart] = reminder.rrule.split(';BYHOUR=');
  if (!timePart) return false;
  const [hourPart] = timePart.split(';');
  const hour = Number(hourPart);
  const reminderTime = new Date(now);
  reminderTime.setHours(hour, reminder.time_of_day ? Number(reminder.time_of_day.split(':')[1]) : 0, 0, 0);
  return Math.abs(reminderTime.getTime() - now.getTime()) < 10 * 60 * 1000;
}
