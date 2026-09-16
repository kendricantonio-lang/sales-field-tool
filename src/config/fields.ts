// Single source of truth for the fields on each record type.
// Add, remove, rename, or reorder entries here — forms, list views, and the
// note parser all read from these arrays, nothing else needs to change.

export type FieldType = 'text' | 'textarea' | 'date' | 'phone' | 'email';

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  /** Shown in the contact/visit list summary line. */
  showInList?: boolean;
  /** Words/phrases the note parser looks for when trying to auto-fill this field. */
  parseHints?: string[];
}

export const CONTACT_FIELDS: FieldDef[] = [
  { key: 'name', label: 'Name', type: 'text', required: true, showInList: true },
  { key: 'title', label: 'Title', type: 'text', showInList: true },
  { key: 'storeNumber', label: 'Store Number', type: 'text', showInList: true },
  { key: 'phone', label: 'Phone', type: 'phone', showInList: true },
  { key: 'email', label: 'Email', type: 'email' },
];

export const STORE_FIELDS: FieldDef[] = [
  { key: 'storeNumber', label: 'Store Number', type: 'text', required: true, showInList: true },
  { key: 'address', label: 'Address', type: 'text', showInList: true },
  { key: 'city', label: 'City', type: 'text', showInList: true },
  {
    key: 'deliveryDays',
    label: 'Delivery Days',
    type: 'text',
    showInList: true,
    placeholder: 'e.g. Mon, Thu',
  },
  { key: 'deliOps', label: 'Deli Ops', type: 'text', showInList: true },
  { key: 'notes', label: 'Notes', type: 'textarea' },
];

export const EVENT_FIELDS: FieldDef[] = [
  { key: 'date', label: 'Date', type: 'date', required: true, showInList: true },
  { key: 'storeNumber', label: 'Store Number', type: 'text', showInList: true },
  { key: 'title', label: 'Event', type: 'text', required: true, showInList: true },
  { key: 'notes', label: 'Notes', type: 'textarea' },
];

export interface BoardNoteColor {
  key: string;
  label: string;
}

export const BOARD_NOTE_COLORS: BoardNoteColor[] = [
  { key: 'yellow', label: 'Yellow' },
  { key: 'pink', label: 'Pink' },
  { key: 'blue', label: 'Blue' },
  { key: 'green', label: 'Green' },
  { key: 'purple', label: 'Purple' },
];

export const BOARD_NOTE_FIELDS: FieldDef[] = [
  { key: 'title', label: 'Title', type: 'text', required: true, showInList: true },
  { key: 'storeNumber', label: 'Store Number', type: 'text', showInList: true },
  { key: 'division', label: 'Division', type: 'text', showInList: true, placeholder: 'e.g. Grocery, Frozen' },
  { key: 'tags', label: 'Tags', type: 'text', placeholder: 'comma-separated, e.g. follow-up, urgent' },
];

export const CHECKLIST_FIELDS: FieldDef[] = [
  { key: 'visitDate', label: 'Date Visited', type: 'date', required: true, showInList: true },
  {
    key: 'storeNumber',
    label: 'Store Number',
    type: 'text',
    required: true,
    showInList: true,
    parseHints: ['store #', 'store#', 'store number', 'store'],
  },
  {
    key: 'purpose',
    label: 'Purpose of Visit',
    type: 'text',
    showInList: true,
    parseHints: ['purpose', 'reason', 'here for', 'in for', 'to discuss', 'regarding', 're:', 'for a'],
  },
  { key: 'notes', label: 'Extra Notes', type: 'textarea' },
];
