import { useEffect, useState } from 'react';
import { CONTACT_FIELDS } from '../config/fields';
import { DynamicForm } from '../components/DynamicForm';
import { normalizeStoreNumber } from '../lib/storeMatch';
import {
  createContact,
  deleteContact,
  listContacts,
  listStores,
  updateContact,
  type ContactRecord,
  type FieldValues,
  type StoreRecord,
} from '../lib/db';

const listFields = CONTACT_FIELDS.filter((f) => f.showInList);

export function ContactsPage() {
  const [contacts, setContacts] = useState<ContactRecord[]>([]);
  const [stores, setStores] = useState<StoreRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [storeFilter, setStoreFilter] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<FieldValues>({});
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    setLoading(true);
    const [contactResult, storeResult] = await Promise.allSettled([listContacts(), listStores()]);
    if (contactResult.status === 'fulfilled') setContacts(contactResult.value);
    if (storeResult.status === 'fulfilled') setStores(storeResult.value);

    const failure = contactResult.status === 'rejected' ? contactResult.reason : storeResult.status === 'rejected' ? storeResult.reason : null;
    setError(failure instanceof Error ? failure.message : failure ? 'Failed to load data' : null);
    setLoading(false);
  }

  function startCreate() {
    setEditingId(null);
    setFormValues({});
    setShowForm(true);
  }

  function startEdit(contact: ContactRecord) {
    setEditingId(contact.id);
    setFormValues(contact.data);
    setShowForm(true);
  }

  async function handleSave() {
    try {
      if (editingId) {
        await updateContact(editingId, formValues);
      } else {
        await createContact(formValues);
      }
      setShowForm(false);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save contact');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this contact?')) return;
    try {
      await deleteContact(id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete contact');
    }
  }

  const storeNumbers = Array.from(
    new Set(
      [...stores.map((s) => s.data.storeNumber), ...contacts.map((c) => c.data.storeNumber)]
        .map((v) => (v ?? '').trim())
        .filter(Boolean)
    )
  ).sort();

  const filtered = contacts.filter((c) => {
    if (storeFilter && normalizeStoreNumber(c.data.storeNumber) !== normalizeStoreNumber(storeFilter)) {
      return false;
    }
    if (!search.trim()) return true;
    const haystack = Object.values(c.data).join(' ').toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  return (
    <div className="page">
      <div className="page-header">
        <h2>Contacts</h2>
        <button onClick={startCreate}>+ Add Contact</button>
      </div>

      <div className="filter-row">
        <input
          className="search-box"
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={storeFilter} onChange={(e) => setStoreFilter(e.target.value)}>
          <option value="">All Stores</option>
          {storeNumbers.map((num) => (
            <option key={num} value={num}>
              Store {num}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="form-error">{error}</p>}
      {loading && <p>Loading...</p>}

      {showForm && (
        <div className="panel">
          <h3>{editingId ? 'Edit Contact' : 'New Contact'}</h3>
          <DynamicForm
            fields={CONTACT_FIELDS}
            values={formValues}
            onChange={(key, value) => setFormValues((prev) => ({ ...prev, [key]: value }))}
          />
          <div className="panel-actions">
            <button onClick={handleSave}>Save</button>
            <button className="secondary" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <ul className="record-list">
        {filtered.map((contact) => (
          <li key={contact.id} className="record-card">
            <div className="record-summary" onClick={() => startEdit(contact)}>
              {listFields.map((f) => (
                <span key={f.key} className="record-field">
                  {contact.data[f.key] ? `${f.label}: ${contact.data[f.key]}` : null}
                </span>
              ))}
            </div>
            <button className="delete-button" onClick={() => handleDelete(contact.id)}>
              Delete
            </button>
          </li>
        ))}
        {!loading && filtered.length === 0 && <p>No contacts yet.</p>}
      </ul>
    </div>
  );
}
