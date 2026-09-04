import { CHECKLIST_FIELDS } from '../config/fields';
import type { FieldValues } from './db';
import { toInputDate } from './dateUtils';

const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function extractDate(text: string): string | null {
  // Explicit numeric date: 9/4, 9/4/26, 09-04-2026
  const numeric = text.match(/\b(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?\b/);
  if (numeric) {
    const month = parseInt(numeric[1], 10);
    const day = parseInt(numeric[2], 10);
    let year = numeric[3] ? parseInt(numeric[3], 10) : new Date().getFullYear();
    if (year < 100) year += 2000;
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const d = new Date(year, month - 1, day);
      return toInputDate(d);
    }
  }

  const lower = text.toLowerCase();
  if (/\byesterday\b/.test(lower)) {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return toInputDate(d);
  }
  if (/\btoday\b/.test(lower)) {
    return toInputDate(new Date());
  }

  // Weekday name -> most recent occurrence of that weekday (including today)
  for (let i = 0; i < WEEKDAYS.length; i++) {
    const name = WEEKDAYS[i];
    if (new RegExp(`\\b${name}\\b`).test(lower)) {
      const d = new Date();
      const currentDay = d.getDay();
      const diff = (currentDay - i + 7) % 7;
      d.setDate(d.getDate() - diff);
      return toInputDate(d);
    }
  }

  return null;
}

function extractStoreNumber(text: string): string | null {
  const match = text.match(/store\s*#?\s*(\d{1,6})/i) || text.match(/#\s*(\d{1,6})\b/);
  return match ? match[1] : null;
}

function extractPurpose(text: string, hints: string[]): string | null {
  const lower = text.toLowerCase();
  for (const hint of hints) {
    const idx = lower.indexOf(hint.toLowerCase());
    if (idx === -1) continue;
    const after = text.slice(idx + hint.length).replace(/^[:\s-]+/, '');
    const sentence = after.split(/[.\n]/)[0].trim();
    if (sentence) return sentence;
  }
  return null;
}

/**
 * Best-effort extraction of checklist fields from a free-text note.
 * Anything not confidently found is left blank for the user to fill in by hand.
 */
export function parseNoteToFields(text: string): FieldValues {
  const values: FieldValues = {};

  for (const field of CHECKLIST_FIELDS) {
    switch (field.key) {
      case 'visitDate': {
        values[field.key] = extractDate(text) ?? toInputDate(new Date());
        break;
      }
      case 'storeNumber': {
        const found = extractStoreNumber(text);
        if (found) values[field.key] = found;
        break;
      }
      case 'purpose': {
        const found = extractPurpose(text, field.parseHints ?? []);
        if (found) values[field.key] = found;
        break;
      }
      case 'notes': {
        values[field.key] = text.trim();
        break;
      }
      default:
        break;
    }
  }

  return values;
}
