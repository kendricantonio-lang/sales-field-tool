import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CONTACT_FIELDS, EVENT_FIELDS, STORE_FIELDS } from '../config/fields';
import { normalizeStoreNumber } from '../lib/storeMatch';
import { toInputDate, fromInputDate } from '../lib/dateUtils';
import {
  listContacts,
  listEvents,
  listStores,
  updateStore,
  type ContactRecord,
  type EventRecord,
  type StoreRecord,
} from '../lib/db';

const summaryFields = STORE_FIELDS.filter((f) => f.showInList && f.key !== 'storeNumber');
const contactPreviewFields = CONTACT_FIELDS.filter((f) => f.key !== 'storeNumber');
const eventDetailFields = EVENT_FIELDS.filter((f) => f.key !== 'title' && f.key !== 'date' && f.key !== 'storeNumber');

function formatEventDate(date: string): string {
  return fromInputDate(date).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function StoreDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [stores, setStores] = useState<StoreRecord[]>([]);
  const [contacts, setContacts] = useState<ContactRecord[]>([]);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [layoutDraft, setLayoutDraft] = useState('');

  useEffect(() => {
    refresh();
  }, []);

  const store = stores.find((s) => s.id === id) ?? null;

  useEffect(() => {
    setLayoutDraft(store?.data.layoutNotes ?? '');
  }, [store?.id, store?.data.layoutNotes]);

  async function refresh() {
    setLoading(true);
    const [storeResult, contactResult, eventResult] = await Promise.allSettled([
      listStores(),
      listContacts(),
      listEvents(),
    ]);
    if (storeResult.status === 'fulfilled') setStores(storeResult.value);
    if (contactResult.status === 'fulfilled') setContacts(contactResult.value);
    if (eventResult.status === 'fulfilled') setEvents(eventResult.value);
    const failure =
      storeResult.status === 'rejected'
        ? storeResult.reason
        : contactResult.status === 'rejected'
          ? contactResult.reason
          : eventResult.status === 'rejected'
            ? eventResult.reason
            : null;
    setError(failure instanceof Error ? failure.message : failure ? 'Failed to load store details' : null);
    setLoading(false);
  }

  /** Pressing Enter on a "- " line continues the hyphen list; pressing it on an empty "- " line ends the list instead. */
  function handleLayoutKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== 'Enter') return;
    const textarea = e.currentTarget;
    const { selectionStart, selectionEnd, value } = textarea;
    if (selectionStart !== selectionEnd) return;

    const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
    const lineEnd = value.indexOf('\n', selectionStart);
    const currentLine = value.slice(lineStart, lineEnd === -1 ? value.length : lineEnd);
    const match = /^(\s*)-\s(.*)$/.exec(currentLine);
    if (!match) return;

    e.preventDefault();
    const [, indent, rest] = match;

    if (rest.trim() === '') {
      const newValue = value.slice(0, lineStart) + value.slice(selectionStart);
      setLayoutDraft(newValue);
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = lineStart;
      });
      return;
    }

    const insertion = `\n${indent}- `;
    const newValue = value.slice(0, selectionStart) + insertion + value.slice(selectionStart);
    setLayoutDraft(newValue);
    const newCursor = selectionStart + insertion.length;
    requestAnimationFrame(() => {
      textarea.selectionStart = textarea.selectionEnd = newCursor;
    });
  }

  async function handleSaveLayout() {
    if (!store) return;
    try {
      await updateStore(store.id, { ...store.data, layoutNotes: layoutDraft });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save layout notes');
    }
  }

  if (loading) {
    return (
      <div className="page">
        <p>Loading...</p>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="page">
        <button className="link-button" onClick={() => navigate('/stores')}>
          ← Back to Stores
        </button>
        <p className="form-error">Store not found.</p>
      </div>
    );
  }

  const target = normalizeStoreNumber(store.data.storeNumber);
  const storeContacts = contacts.filter((c) => normalizeStoreNumber(c.data.storeNumber) === target);
  const storeEvents = events
    .filter((e) => normalizeStoreNumber(e.data.storeNumber) === target)
    .sort((a, b) => a.data.date.localeCompare(b.data.date));
  const today = toInputDate(new Date());
  const upcomingEvents = storeEvents.filter((e) => e.data.date >= today);

  return (
    <div className="page">
      <button className="link-button" onClick={() => navigate('/stores')}>
        ← Back to Stores
      </button>

      {error && <p className="form-error">{error}</p>}

      <div className="page-header">
        <h2>Store #{store.data.storeNumber}</h2>
      </div>

      <div className="panel">
        {summaryFields.map((f) =>
          store.data[f.key] ? (
            <p key={f.key} className="record-field">
              <span className="field-label">{f.label}:</span> {store.data[f.key]}
            </p>
          ) : null
        )}

        <h4>Contacts at this store</h4>
        {storeContacts.length === 0 ? (
          <p className="muted">No contacts on file for this store yet.</p>
        ) : (
          <ul className="contact-chip-list">
            {storeContacts.map((c) => (
              <li key={c.id} className="contact-chip">
                <strong>{c.data.name || 'Unnamed contact'}</strong>
                {contactPreviewFields.map((f) =>
                  c.data[f.key] ? <span key={f.key}> · {c.data[f.key]}</span> : null
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="panel">
        <div className="panel-title-row">
          <h3>Upcoming Events</h3>
          <button className="link-button" onClick={() => navigate('/calendar')}>
            Open Calendar →
          </button>
        </div>
        {upcomingEvents.length === 0 ? (
          <p className="muted">No upcoming events for this store.</p>
        ) : (
          <ul className="record-list">
            {upcomingEvents.map((event) => (
              <li key={event.id} className="record-card">
                <div className="record-summary">
                  <span className="record-field">
                    <span className="field-label">{formatEventDate(event.data.date)}:</span> {event.data.title}
                  </span>
                  {eventDetailFields.map((f) =>
                    event.data[f.key] ? (
                      <span key={f.key} className="record-field">
                        {event.data[f.key]}
                      </span>
                    ) : null
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="panel">
        <h3>Store Layout Notes</h3>
        <p className="muted">Aisle layout, endcap locations, back-room access — anything worth remembering on-site.</p>
        <textarea
          value={layoutDraft}
          onChange={(e) => setLayoutDraft(e.target.value)}
          onKeyDown={handleLayoutKeyDown}
          placeholder="e.g. Deli case is at the back left, endcaps rotate monthly..."
          rows={10}
        />
        <div className="panel-actions">
          <button onClick={handleSaveLayout} disabled={layoutDraft === (store.data.layoutNotes ?? '')}>
            Save Layout Notes
          </button>
        </div>
      </div>
    </div>
  );
}
