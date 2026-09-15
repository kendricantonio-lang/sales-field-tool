import { useEffect, useState } from 'react';
import { EVENT_FIELDS } from '../config/fields';
import { DynamicForm } from '../components/DynamicForm';
import { addMonths, DAY_HEADERS, formatMonthLabel, getMonthGrid, getMonthStart } from '../lib/calendarUtils';
import { createEvent, deleteEvent, listEvents, updateEvent, type EventRecord, type FieldValues } from '../lib/db';

const detailFields = EVENT_FIELDS.filter((f) => f.key !== 'title' && f.key !== 'date');

export function CalendarPage() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthStart, setMonthStart] = useState(() => getMonthStart(new Date()));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<FieldValues>({});
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    setLoading(true);
    try {
      setEvents(await listEvents());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }

  function eventsForDay(date: string): EventRecord[] {
    return events.filter((e) => e.data.date === date);
  }

  function selectDay(date: string) {
    setSelectedDate(date);
    setShowForm(false);
  }

  function startAddEvent() {
    if (!selectedDate) return;
    setEditingId(null);
    setFormValues({ date: selectedDate });
    setShowForm(true);
  }

  function startEditEvent(event: EventRecord) {
    setEditingId(event.id);
    setFormValues(event.data);
    setShowForm(true);
  }

  async function handleSave() {
    try {
      if (editingId) {
        await updateEvent(editingId, formValues);
      } else {
        await createEvent(formValues);
      }
      setShowForm(false);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save event');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this event?')) return;
    try {
      await deleteEvent(id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
    }
  }

  const weeks = getMonthGrid(monthStart);
  const monthLabel = formatMonthLabel(monthStart);
  const isCurrentMonth = monthStart.getTime() === getMonthStart(new Date()).getTime();
  const selectedDayEvents = selectedDate ? eventsForDay(selectedDate) : [];

  return (
    <div className="page">
      <div className="page-header">
        <h2>Calendar</h2>
      </div>

      {error && <p className="form-error">{error}</p>}
      {loading && <p>Loading...</p>}

      <div className="panel">
        <div className="week-nav">
          <button className="secondary" onClick={() => setMonthStart(addMonths(monthStart, -1))}>
            ← Prev
          </button>
          <h3>{monthLabel}</h3>
          <button className="secondary" onClick={() => setMonthStart(addMonths(monthStart, 1))}>
            Next →
          </button>
        </div>
        {!isCurrentMonth && (
          <button className="link-button" onClick={() => setMonthStart(getMonthStart(new Date()))}>
            Back to this month
          </button>
        )}

        <div className="calendar-grid">
          {DAY_HEADERS.map((d) => (
            <div key={d} className="calendar-day-header">
              {d}
            </div>
          ))}
          {weeks.flatMap((week) =>
            week.map((cell) => {
              const dayEvents = eventsForDay(cell.date);
              const classes = [
                'calendar-cell',
                !cell.isCurrentMonth && 'other-month',
                cell.isToday && 'is-today',
                cell.date === selectedDate && 'is-selected',
              ]
                .filter(Boolean)
                .join(' ');
              return (
                <button key={cell.date} className={classes} onClick={() => selectDay(cell.date)}>
                  <span className="calendar-day-number">{cell.day}</span>
                  {dayEvents.length > 0 && <span className="calendar-event-dot" />}
                </button>
              );
            })
          )}
        </div>
      </div>

      {selectedDate && (
        <div className="panel">
          <div className="panel-title-row">
            <h3>{formatSelectedDate(selectedDate)}</h3>
            <button className="link-button" onClick={() => setSelectedDate(null)}>
              Close
            </button>
          </div>

          {selectedDayEvents.length === 0 ? (
            <p className="muted">No events on this day.</p>
          ) : (
            <ul className="record-list">
              {selectedDayEvents.map((event) => (
                <li key={event.id} className="record-card">
                  <div className="record-summary" onClick={() => startEditEvent(event)}>
                    <span className="record-field">{event.data.title}</span>
                    {detailFields.map((f) =>
                      event.data[f.key] ? (
                        <span key={f.key} className="record-field">
                          <span className="field-label">{f.label}:</span> {event.data[f.key]}
                        </span>
                      ) : null
                    )}
                  </div>
                  <button className="delete-button" onClick={() => handleDelete(event.id)}>
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}

          {showForm ? (
            <>
              <h4>{editingId ? 'Edit Event' : 'New Event'}</h4>
              <DynamicForm
                fields={EVENT_FIELDS}
                values={formValues}
                onChange={(key, value) => setFormValues((prev) => ({ ...prev, [key]: value }))}
              />
              <div className="panel-actions">
                <button onClick={handleSave}>Save</button>
                <button className="secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <div className="panel-actions">
              <button onClick={startAddEvent}>+ Add Event</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatSelectedDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}
