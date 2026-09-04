import { useEffect, useState } from 'react';
import { CONTACT_FIELDS, STORE_FIELDS } from '../config/fields';
import { DynamicForm } from '../components/DynamicForm';
import { normalizeStoreNumber } from '../lib/storeMatch';
import {
  createStore,
  deleteStore,
  listContacts,
  listStores,
  updateStore,
  type ContactRecord,
  type FieldValues,
  type StoreRecord,
} from '../lib/db';

const listFields = STORE_FIELDS.filter((f) => f.showInList);
const contactPreviewFields = CONTACT_FIELDS.filter((f) => f.key !== 'storeNumber');

/** Numeric compare when both sides parse as numbers, otherwise alphabetical. */
function compareFieldValues(a: string, b: string): number {
  const aNum = Number(a);
  const bNum = Number(b);
  if (a.trim() !== '' && b.trim() !== '' && !Number.isNaN(aNum) && !Number.isNaN(bNum)) {
    return aNum - bNum;
  }
  return a.localeCompare(b, undefined, { sensitivity: 'base' });
}

function contactsForStore(contacts: ContactRecord[], storeNumber: string): ContactRecord[] {
  const target = normalizeStoreNumber(storeNumber);
  if (!target) return [];
  return contacts.filter((c) => normalizeStoreNumber(c.data.storeNumber) === target);
}

function ContactChips({ contacts }: { contacts: ContactRecord[] }) {
  if (contacts.length === 0) {
    return <p className="muted">No contacts on file for this store yet.</p>;
  }
  return (
    <ul className="contact-chip-list">
      {contacts.map((c) => (
        <li key={c.id} className="contact-chip">
          <strong>{c.data.name || 'Unnamed contact'}</strong>
          {contactPreviewFields.map((f) =>
            c.data[f.key] ? <span key={f.key}> · {c.data[f.key]}</span> : null
          )}
        </li>
      ))}
    </ul>
  );
}

export function StoresPage() {
  const [stores, setStores] = useState<StoreRecord[]>([]);
  const [contacts, setContacts] = useState<ContactRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState(STORE_FIELDS[0].key);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<FieldValues>({});
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    setLoading(true);
    const [storeResult, contactResult] = await Promise.allSettled([listStores(), listContacts()]);
    if (storeResult.status === 'fulfilled') setStores(storeResult.value);
    if (contactResult.status === 'fulfilled') setContacts(contactResult.value);

    const failure = storeResult.status === 'rejected' ? storeResult.reason : contactResult.status === 'rejected' ? contactResult.reason : null;
    setError(failure instanceof Error ? failure.message : failure ? 'Failed to load data' : null);
    setLoading(false);
  }

  function startCreate() {
    setEditingId(null);
    setFormValues({});
    setShowForm(true);
  }

  function startEdit(store: StoreRecord) {
    setEditingId(store.id);
    setFormValues(store.data);
    setShowForm(true);
  }

  async function handleSave() {
    try {
      if (editingId) {
        await updateStore(editingId, formValues);
      } else {
        await createStore(formValues);
      }
      setShowForm(false);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save store');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this store?')) return;
    try {
      await deleteStore(id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete store');
    }
  }

  const filtered = stores.filter((s) => {
    if (!search.trim()) return true;
    const haystack = Object.values(s.data).join(' ').toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  const sorted = [...filtered].sort((a, b) =>
    compareFieldValues(a.data[sortBy] ?? '', b.data[sortBy] ?? '')
  );

  return (
    <div className="page">
      <div className="page-header">
        <h2>Stores</h2>
        <button onClick={startCreate}>+ Add Store</button>
      </div>

      <div className="filter-row">
        <input
          className="search-box"
          placeholder="Search stores..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          {STORE_FIELDS.map((f) => (
            <option key={f.key} value={f.key}>
              Sort: {f.label}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="form-error">{error}</p>}
      {loading && <p>Loading...</p>}

      {showForm && (
        <div className="panel">
          <h3>{editingId ? 'Edit Store' : 'New Store'}</h3>
          <DynamicForm
            fields={STORE_FIELDS}
            values={formValues}
            onChange={(key, value) => setFormValues((prev) => ({ ...prev, [key]: value }))}
          />
          <h4>Contacts at this store</h4>
          <ContactChips contacts={contactsForStore(contacts, formValues.storeNumber ?? '')} />
          <div className="panel-actions">
            <button onClick={handleSave}>Save</button>
            <button className="secondary" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <ul className="record-list">
        {sorted.map((store) => (
          <li key={store.id} className="record-card store-card">
            <div className="record-summary" onClick={() => startEdit(store)}>
              {listFields.map((f) =>
                store.data[f.key] ? (
                  <span key={f.key} className="record-field">
                    {f.label}: {store.data[f.key]}
                  </span>
                ) : null
              )}
              <ContactChips contacts={contactsForStore(contacts, store.data.storeNumber ?? '')} />
            </div>
            <button className="delete-button" onClick={() => handleDelete(store.id)}>
              Delete
            </button>
          </li>
        ))}
        {!loading && sorted.length === 0 && <p>No stores yet.</p>}
      </ul>
    </div>
  );
}
