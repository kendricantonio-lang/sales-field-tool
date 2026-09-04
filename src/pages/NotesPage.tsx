import { useEffect, useState } from 'react';
import { CHECKLIST_FIELDS } from '../config/fields';
import { DynamicForm } from '../components/DynamicForm';
import { parseNoteToFields } from '../lib/parseNote';
import { buildWeeklyCsv, buildWeeklySummaryText, downloadCsvFile, downloadTextFile } from '../lib/exportReport';
import {
  addWeeks,
  formatWeekRangeLabel,
  getWeekendDays,
  getWeekStart,
  getWorkWeekDays,
  type WeekDay,
} from '../lib/weekUtils';
import {
  createVisit,
  deleteVisit,
  listVisits,
  updateVisit,
  type FieldValues,
  type VisitRecord,
} from '../lib/db';

const detailFields = CHECKLIST_FIELDS.filter((f) => f.key !== 'visitDate');

function DayColumn({
  day,
  visits,
  onEdit,
  onDelete,
}: {
  day: WeekDay;
  visits: VisitRecord[];
  onEdit: (visit: VisitRecord) => void;
  onDelete: (id: string) => void;
}) {
  const dayVisits = visits.filter((v) => v.data.visitDate === day.date);
  return (
    <div className="week-day">
      <h4>
        {day.label} <span className="week-day-date">{day.shortLabel}</span>
      </h4>
      {dayVisits.length === 0 ? (
        <p className="muted">No visits logged.</p>
      ) : (
        <ul className="record-list">
          {dayVisits.map((visit) => (
            <li key={visit.id} className="record-card">
              <div className="record-summary" onClick={() => onEdit(visit)}>
                {detailFields.map((f) =>
                  visit.data[f.key] ? (
                    <span key={f.key} className="record-field">
                      {f.label}: {visit.data[f.key]}
                    </span>
                  ) : null
                )}
              </div>
              <button className="delete-button" onClick={() => onDelete(visit.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function NotesPage() {
  const [rawNote, setRawNote] = useState('');
  const [formValues, setFormValues] = useState<FieldValues>({});
  const [parsed, setParsed] = useState(false);
  const [visits, setVisits] = useState<VisitRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    setLoading(true);
    try {
      setVisits(await listVisits());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load visits');
    } finally {
      setLoading(false);
    }
  }

  function handleParse() {
    setFormValues(parseNoteToFields(rawNote));
    setParsed(true);
  }

  function startEdit(visit: VisitRecord) {
    setEditingId(visit.id);
    setRawNote(visit.raw_note);
    setFormValues(visit.data);
    setParsed(true);
  }

  function resetForm() {
    setEditingId(null);
    setRawNote('');
    setFormValues({});
    setParsed(false);
  }

  async function handleSave() {
    try {
      if (editingId) {
        await updateVisit(editingId, rawNote, formValues);
      } else {
        await createVisit(rawNote, formValues);
      }
      resetForm();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save visit');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this visit?')) return;
    try {
      await deleteVisit(id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete visit');
    }
  }

  const workDays = getWorkWeekDays(weekStart);
  const weekendDays = getWeekendDays(weekStart);
  const weekLabel = formatWeekRangeLabel(weekStart);
  const rangeStart = workDays[0].date;
  const rangeEnd = weekendDays[1].date;
  const visitsInWeek = visits.filter(
    (v) => v.data.visitDate >= rangeStart && v.data.visitDate <= rangeEnd
  );
  const weekendHasVisits = weekendDays.some((day) =>
    visitsInWeek.some((v) => v.data.visitDate === day.date)
  );

  function handleExportSummary() {
    const text = buildWeeklySummaryText(weekLabel, workDays, visitsInWeek);
    downloadTextFile(`store-visits-${rangeStart}-to-${workDays[4].date}.txt`, text);
  }

  function handleExportCsv() {
    const csv = buildWeeklyCsv(workDays, visitsInWeek);
    downloadCsvFile(`store-visits-${rangeStart}-to-${workDays[4].date}.csv`, csv);
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>Store Visit Notes</h2>
      </div>

      <div className="panel">
        <h3>{editingId ? 'Edit Visit' : 'Jot a note'}</h3>
        <textarea
          className="note-input"
          placeholder="e.g. Visited store #4821 today for a restock check. Talked to Maria about the new endcap display..."
          value={rawNote}
          onChange={(e) => {
            setRawNote(e.target.value);
            setParsed(false);
          }}
          rows={5}
        />
        <div className="panel-actions">
          <button onClick={handleParse} disabled={!rawNote.trim()}>
            Parse into Checklist
          </button>
          {(rawNote || editingId) && (
            <button className="secondary" onClick={resetForm}>
              Clear
            </button>
          )}
        </div>

        {parsed && (
          <>
            <h4>Review & edit before saving</h4>
            <DynamicForm
              fields={CHECKLIST_FIELDS}
              values={formValues}
              onChange={(key, value) => setFormValues((prev) => ({ ...prev, [key]: value }))}
            />
            <div className="panel-actions">
              <button onClick={handleSave}>Save Visit</button>
            </div>
          </>
        )}
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="panel">
        <div className="week-nav">
          <button className="secondary" onClick={() => setWeekStart(addWeeks(weekStart, -1))}>
            ← Prev
          </button>
          <h3>{weekLabel}</h3>
          <button className="secondary" onClick={() => setWeekStart(addWeeks(weekStart, 1))}>
            Next →
          </button>
        </div>
        {weekStart.getTime() !== getWeekStart(new Date()).getTime() && (
          <button className="link-button" onClick={() => setWeekStart(getWeekStart(new Date()))}>
            Back to this week
          </button>
        )}

        {loading && <p>Loading...</p>}

        <div className="week-days">
          {workDays.map((day) => (
            <DayColumn key={day.date} day={day} visits={visitsInWeek} onEdit={startEdit} onDelete={handleDelete} />
          ))}
          {weekendHasVisits &&
            weekendDays.map((day) => (
              <DayColumn key={day.date} day={day} visits={visitsInWeek} onEdit={startEdit} onDelete={handleDelete} />
            ))}
        </div>

        <div className="panel-actions">
          <button className="secondary" onClick={handleExportSummary} disabled={visitsInWeek.length === 0}>
            Download Summary (.txt)
          </button>
          <button className="secondary" onClick={handleExportCsv} disabled={visitsInWeek.length === 0}>
            Download Excel (.csv)
          </button>
        </div>
      </div>
    </div>
  );
}
