import { toInputDate } from './dateUtils';

export interface WeekDay {
  date: string; // yyyy-mm-dd
  label: string; // 'Monday'
  shortLabel: string; // '9/1'
}

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/** Monday of the work week containing `date`. */
export function getWeekStart(date: Date): Date {
  const day = date.getDay();
  const diff = (day + 6) % 7; // days since the most recent Monday
  const start = new Date(date);
  start.setDate(date.getDate() - diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

function buildDay(d: Date): WeekDay {
  return {
    date: toInputDate(d),
    label: DAY_NAMES[d.getDay()],
    shortLabel: d.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }),
  };
}

/** Monday through Friday of the work week starting at `weekStart`. */
export function getWorkWeekDays(weekStart: Date): WeekDay[] {
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return buildDay(d);
  });
}

/** Saturday and Sunday following `weekStart` — shown only when they have logged visits. */
export function getWeekendDays(weekStart: Date): WeekDay[] {
  return [5, 6].map((offset) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + offset);
    return buildDay(d);
  });
}

export function formatWeekRangeLabel(weekStart: Date): string {
  const end = new Date(weekStart);
  end.setDate(weekStart.getDate() + 4);
  const fmt = (d: Date) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return `Week of ${fmt(weekStart)} – ${fmt(end)}, ${end.getFullYear()}`;
}

export function addWeeks(weekStart: Date, delta: number): Date {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + delta * 7);
  return d;
}
