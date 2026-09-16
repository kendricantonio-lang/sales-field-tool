import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BOARD_NOTE_COLORS, BOARD_NOTE_FIELDS } from '../config/fields';
import { DynamicForm } from '../components/DynamicForm';
import { collectAllTags, parseChecklist, parseTags, serializeChecklist, type ChecklistItem } from '../lib/boardUtils';
import { pinStoreActive } from '../lib/activeStore';
import { normalizeStoreNumber } from '../lib/storeMatch';
import {
  createBoardNote,
  deleteBoardNote,
  listBoardNotes,
  listStores,
  updateBoardNote,
  type BoardNoteRecord,
  type FieldValues,
  type StoreRecord,
} from '../lib/db';

type NoteKind = 'note' | 'list';

const CARD_WIDTH = 220;

function numberOr(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return value !== undefined && !Number.isNaN(n) ? n : fallback;
}

export function BoardPage() {
  const [notes, setNotes] = useState<BoardNoteRecord[]>([]);
  const [stores, setStores] = useState<StoreRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('all');
  const [dragPos, setDragPos] = useState<{ id: string; x: number; y: number } | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [kind, setKind] = useState<NoteKind>('note');
  const [color, setColor] = useState(BOARD_NOTE_COLORS[0].key);
  const [formValues, setFormValues] = useState<FieldValues>({});
  const [bodyDraft, setBodyDraft] = useState('');
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [newItemText, setNewItemText] = useState('');
  const [pendingPos, setPendingPos] = useState<{ x: number; y: number } | null>(null);

  const canvasRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    setLoading(true);
    const [notesResult, storesResult] = await Promise.allSettled([listBoardNotes(), listStores()]);
    if (notesResult.status === 'fulfilled') setNotes(notesResult.value);
    if (storesResult.status === 'fulfilled') setStores(storesResult.value);
    const failure =
      notesResult.status === 'rejected' ? notesResult.reason : storesResult.status === 'rejected' ? storesResult.reason : null;
    setError(failure instanceof Error ? failure.message : failure ? 'Failed to load board notes' : null);
    setLoading(false);
  }

  const allTags = useMemo(() => collectAllTags(notes.map((n) => n.data.tags ?? '')), [notes]);

  const visibleNotes = notes.filter((n) => {
    if (tagFilter !== 'all' && !parseTags(n.data.tags ?? '').includes(tagFilter)) return false;
    if (!search.trim()) return true;
    const haystack = Object.values(n.data).join(' ').toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  const contentWidth = Math.max(1200, ...notes.map((n) => numberOr(n.data.x, 0) + CARD_WIDTH + 80));
  const contentHeight = Math.max(900, ...notes.map((n) => numberOr(n.data.y, 0) + 320));

  function nextPosition(): { x: number; y: number } {
    const canvas = canvasRef.current;
    const scrollLeft = canvas?.scrollLeft ?? 0;
    const scrollTop = canvas?.scrollTop ?? 0;
    const stagger = notes.length % 6;
    return { x: scrollLeft + 24 + stagger * 28, y: scrollTop + 24 + stagger * 28 };
  }

  function startCreate(newKind: NoteKind) {
    setEditingId(null);
    setKind(newKind);
    setColor(BOARD_NOTE_COLORS[0].key);
    setFormValues({});
    setBodyDraft('');
    setItems([]);
    setNewItemText('');
    setPendingPos(nextPosition());
  }

  function startEdit(note: BoardNoteRecord) {
    setEditingId(note.id);
    setKind(note.data.kind === 'list' ? 'list' : 'note');
    setColor(note.data.color || BOARD_NOTE_COLORS[0].key);
    setFormValues(note.data);
    setBodyDraft(note.data.body ?? '');
    setItems(parseChecklist(note.data.body ?? ''));
    setNewItemText('');
    setPendingPos(null);
  }

  function closeForm() {
    setEditingId(null);
    setPendingPos(null);
  }

  const isFormOpen = editingId !== null || pendingPos !== null;

  function addItem() {
    if (!newItemText.trim()) return;
    setItems((prev) => [...prev, { text: newItemText.trim(), done: false }]);
    setNewItemText('');
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function toggleDraftItem(index: number) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, done: !item.done } : item)));
  }

  async function handleSave() {
    const body = kind === 'list' ? serializeChecklist(items) : bodyDraft;
    const values: FieldValues = { ...formValues, kind, color, body };
    try {
      if (editingId) {
        await updateBoardNote(editingId, values);
      } else {
        const pos = pendingPos ?? nextPosition();
        await createBoardNote({ ...values, x: String(pos.x), y: String(pos.y) });
      }
      closeForm();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save note');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this note?')) return;
    try {
      await deleteBoardNote(id);
      closeForm();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note');
    }
  }

  async function toggleCardItem(note: BoardNoteRecord, index: number) {
    const currentItems = parseChecklist(note.data.body ?? '');
    if (!currentItems[index]) return;
    currentItems[index] = { ...currentItems[index], done: !currentItems[index].done };
    try {
      await updateBoardNote(note.id, { ...note.data, body: serializeChecklist(currentItems) });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
    }
  }

  async function persistPosition(note: BoardNoteRecord, x: number, y: number) {
    try {
      await updateBoardNote(note.id, { ...note.data, x: String(Math.max(0, x)), y: String(Math.max(0, y)) });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move note');
    }
  }

  function handleCardPointerDown(e: React.PointerEvent<HTMLDivElement>, note: BoardNoteRecord) {
    if ((e.target as HTMLElement).closest('.board-note-no-drag')) return;
    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const origX = numberOr(note.data.x, 0);
    const origY = numberOr(note.data.y, 0);
    let moved = false;
    const cardEl = e.currentTarget;
    const pointerId = e.pointerId;
    cardEl.setPointerCapture(pointerId);

    function onMove(ev: PointerEvent) {
      const dx = ev.clientX - startClientX;
      const dy = ev.clientY - startClientY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) moved = true;
      if (moved) setDragPos({ id: note.id, x: origX + dx, y: origY + dy });
    }
    function onUp(ev: PointerEvent) {
      cardEl.releasePointerCapture(pointerId);
      cardEl.removeEventListener('pointermove', onMove);
      cardEl.removeEventListener('pointerup', onUp);
      setDragPos(null);
      if (moved) {
        const dx = ev.clientX - startClientX;
        const dy = ev.clientY - startClientY;
        void persistPosition(note, origX + dx, origY + dy);
      } else {
        startEdit(note);
      }
    }
    cardEl.addEventListener('pointermove', onMove);
    cardEl.addEventListener('pointerup', onUp);
  }

  function handleViewStore(storeNumber: string) {
    const target = normalizeStoreNumber(storeNumber);
    const match = stores.find((s) => normalizeStoreNumber(s.data.storeNumber) === target);
    if (match) pinStoreActive(match.id);
    navigate('/stores');
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>Board</h2>
        <div className="panel-actions">
          <button onClick={() => startCreate('note')}>+ Note</button>
          <button className="secondary" onClick={() => startCreate('list')}>
            + List
          </button>
        </div>
      </div>

      <div className="filter-row">
        <input
          className="search-box"
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)}>
          <option value="all">All Tags</option>
          {allTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="form-error">{error}</p>}
      {loading && <p>Loading...</p>}
      {!loading && notes.length === 0 && <p className="muted">No notes yet — add one to get started.</p>}
      {!loading && notes.length > 0 && visibleNotes.length === 0 && (
        <p className="muted">No notes match your search.</p>
      )}

      <div className="board-canvas" ref={canvasRef}>
        <div className="board-canvas-content" style={{ width: contentWidth, height: contentHeight }}>
          {visibleNotes.map((note) => {
            const dragForThis = dragPos && dragPos.id === note.id ? dragPos : null;
            const isDragging = dragForThis !== null;
            const x = dragForThis ? dragForThis.x : numberOr(note.data.x, 0);
            const y = dragForThis ? dragForThis.y : numberOr(note.data.y, 0);
            const noteColor = note.data.color || BOARD_NOTE_COLORS[0].key;
            const noteKind: NoteKind = note.data.kind === 'list' ? 'list' : 'note';
            const noteItems = noteKind === 'list' ? parseChecklist(note.data.body ?? '') : [];
            const tags = parseTags(note.data.tags ?? '');

            return (
              <div
                key={note.id}
                className={`board-note color-${noteColor}${isDragging ? ' is-dragging' : ''}`}
                style={{ left: x, top: y, width: CARD_WIDTH }}
                onPointerDown={(e) => handleCardPointerDown(e, note)}
              >
                <div className="board-note-header">
                  <strong>{note.data.title || 'Untitled'}</strong>
                  <button
                    className="link-button board-note-no-drag"
                    onClick={() => handleDelete(note.id)}
                    aria-label="Delete note"
                  >
                    ×
                  </button>
                </div>

                {(note.data.storeNumber || note.data.division) && (
                  <p className="board-note-meta">
                    {[note.data.storeNumber && `Store #${note.data.storeNumber}`, note.data.division]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                )}

                {noteKind === 'note' ? (
                  <p className="board-note-body">{note.data.body}</p>
                ) : (
                  <ul className="board-checklist">
                    {noteItems.map((item, i) => (
                      <li
                        key={i}
                        className={`board-checklist-item board-note-no-drag${item.done ? ' is-done' : ''}`}
                        onClick={() => toggleCardItem(note, i)}
                      >
                        <input type="checkbox" checked={item.done} readOnly />
                        <span>{item.text}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {tags.length > 0 && (
                  <div className="board-tag-list">
                    {tags.map((tag) => (
                      <span key={tag} className="board-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {isFormOpen && (
        <div className="board-modal-backdrop" onClick={closeForm}>
          <div className="board-modal panel" onClick={(e) => e.stopPropagation()}>
            <div className="panel-title-row">
              <h3>{editingId ? 'Edit Note' : kind === 'list' ? 'New List' : 'New Note'}</h3>
              <button className="link-button" onClick={closeForm}>
                Close
              </button>
            </div>

            {!editingId && (
              <div className="board-kind-toggle">
                <button
                  className={kind === 'note' ? '' : 'secondary'}
                  onClick={() => setKind('note')}
                  type="button"
                >
                  Note
                </button>
                <button
                  className={kind === 'list' ? '' : 'secondary'}
                  onClick={() => setKind('list')}
                  type="button"
                >
                  Checklist
                </button>
              </div>
            )}

            <DynamicForm
              fields={BOARD_NOTE_FIELDS}
              values={formValues}
              onChange={(key, value) => setFormValues((prev) => ({ ...prev, [key]: value }))}
            />

            <div className="board-color-row">
              {BOARD_NOTE_COLORS.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  aria-label={c.label}
                  className={`board-color-swatch color-${c.key}${color === c.key ? ' is-selected' : ''}`}
                  onClick={() => setColor(c.key)}
                />
              ))}
            </div>

            {kind === 'note' ? (
              <label className="form-field">
                <span className="form-label">Details</span>
                <textarea
                  value={bodyDraft}
                  onChange={(e) => setBodyDraft(e.target.value)}
                  rows={4}
                  placeholder="Notes, requests, follow-ups..."
                />
              </label>
            ) : (
              <div className="form-field">
                <span className="form-label">Items</span>
                <ul className="board-checklist board-checklist-edit">
                  {items.map((item, i) => (
                    <li key={i} className="board-checklist-item">
                      <input type="checkbox" checked={item.done} onChange={() => toggleDraftItem(i)} />
                      <span>{item.text}</span>
                      <button className="link-button" onClick={() => removeItem(i)}>
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="board-add-item-row">
                  <input
                    value={newItemText}
                    placeholder="Add an item..."
                    onChange={(e) => setNewItemText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addItem();
                      }
                    }}
                  />
                  <button type="button" className="secondary" onClick={addItem}>
                    Add
                  </button>
                </div>
              </div>
            )}

            {formValues.storeNumber && (
              <button className="link-button" onClick={() => handleViewStore(formValues.storeNumber)}>
                View store in Stores tab →
              </button>
            )}

            <div className="panel-actions">
              <button onClick={handleSave}>Save</button>
              {editingId && (
                <button className="delete-button" onClick={() => handleDelete(editingId)}>
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
