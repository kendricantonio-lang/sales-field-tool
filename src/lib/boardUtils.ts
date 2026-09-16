export interface ChecklistItem {
  text: string;
  done: boolean;
}

const DONE_PREFIX = /^\[x\]\s*/i;
const OPEN_PREFIX = /^\[\s?\]\s*/i;

/** A list-type board note stores its items as newline-separated "[ ] text" / "[x] text" lines in `body`. */
export function parseChecklist(body: string): ChecklistItem[] {
  return body
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      if (DONE_PREFIX.test(line)) return { text: line.replace(DONE_PREFIX, ''), done: true };
      if (OPEN_PREFIX.test(line)) return { text: line.replace(OPEN_PREFIX, ''), done: false };
      return { text: line, done: false };
    });
}

export function serializeChecklist(items: ChecklistItem[]): string {
  return items.map((item) => `[${item.done ? 'x' : ' '}] ${item.text}`).join('\n');
}

export function parseTags(tagsField: string): string[] {
  return tagsField
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

export function collectAllTags(notesTags: string[]): string[] {
  const set = new Set<string>();
  for (const field of notesTags) {
    for (const tag of parseTags(field)) set.add(tag);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}
