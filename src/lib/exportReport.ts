import { CHECKLIST_FIELDS } from '../config/fields';
import type { VisitRecord } from './db';
import type { WeekDay } from './weekUtils';

const DETAIL_FIELDS = CHECKLIST_FIELDS.filter((f) => f.key !== 'visitDate');

function visitsForDay(visits: VisitRecord[], date: string): VisitRecord[] {
  return visits.filter((v) => v.data.visitDate === date);
}

export function buildWeeklySummaryText(
  weekLabel: string,
  days: WeekDay[],
  visits: VisitRecord[]
): string {
  const lines: string[] = ['Store Visit Summary', weekLabel, ''];

  for (const day of days) {
    const dayVisits = visitsForDay(visits, day.date);
    lines.push(`${day.label}, ${day.shortLabel}`);
    if (dayVisits.length === 0) {
      lines.push('  No visits logged.');
    } else {
      dayVisits.forEach((visit, idx) => {
        if (idx > 0) lines.push('');
        for (const field of DETAIL_FIELDS) {
          const value = visit.data[field.key];
          if (value) lines.push(`  ${field.label}: ${value}`);
        }
      });
    }
    lines.push('');
  }

  return lines.join('\n');
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildWeeklyCsv(days: WeekDay[], visits: VisitRecord[]): string {
  const header = ['Day', 'Date', ...DETAIL_FIELDS.map((f) => f.label)];
  const rows: string[][] = [header];

  for (const day of days) {
    const dayVisits = visitsForDay(visits, day.date);
    if (dayVisits.length === 0) {
      rows.push([day.label, day.date, ...DETAIL_FIELDS.map(() => '')]);
      continue;
    }
    for (const visit of dayVisits) {
      rows.push([
        day.label,
        day.date,
        ...DETAIL_FIELDS.map((f) => visit.data[f.key] ?? ''),
      ]);
    }
  }

  return rows.map((row) => row.map(csvEscape).join(',')).join('\r\n');
}

function downloadFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadTextFile(filename: string, content: string): void {
  downloadFile(filename, content, 'text/plain');
}

export function downloadCsvFile(filename: string, content: string): void {
  // Leading BOM so Excel opens UTF-8 CSVs without mangling special characters.
  downloadFile(filename, '﻿' + content, 'text/csv');
}
