import { toInputDate } from './dateUtils';

export interface CalendarDay {
  date: string; // yyyy-mm-dd
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(monthStart: Date, delta: number): Date {
  return new Date(monthStart.getFullYear(), monthStart.getMonth() + delta, 1);
}

export function formatMonthLabel(monthStart: Date): string {
  return monthStart.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

/** Full weeks (7-day rows) covering the month, padded with adjacent-month days. */
export function getMonthGrid(monthStart: Date): CalendarDay[][] {
  const year = monthStart.getFullYear();
  const month = monthStart.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const todayStr = toInputDate(new Date());

  const cells: CalendarDay[] = [];

  for (let i = firstWeekday - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const date = toInputDate(new Date(year, month - 1, day));
    cells.push({ date, day, isCurrentMonth: false, isToday: date === todayStr });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = toInputDate(new Date(year, month, day));
    cells.push({ date, day, isCurrentMonth: true, isToday: date === todayStr });
  }

  let trailingDay = 1;
  while (cells.length % 7 !== 0) {
    const date = toInputDate(new Date(year, month + 1, trailingDay));
    cells.push({ date, day: trailingDay, isCurrentMonth: false, isToday: date === todayStr });
    trailingDay++;
  }

  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}
