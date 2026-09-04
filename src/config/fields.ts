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
