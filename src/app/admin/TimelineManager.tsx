"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import { TIMELINE_KINDS, type TimelineEntry } from "@/lib/types";
import ConfirmDelete from "./ConfirmDelete";
import {
  createTimelineEntry,
  deleteTimelineEntry,
  updateTimelineEntry,
  type ActionState,
} from "./actions";

const FIELD =
  "p-3 bg-gray-50 rounded-xl border border-transparent outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:border-sky-600";
const LABEL = "text-xs font-bold uppercase text-gray-600";

/**
 * Shared field set for both the "add" form and the inline "edit" form, so the
 * two cannot drift apart. `idPrefix` keeps label/input ids unique when several
 * forms are on the page.
 */
function EntryFields({
  idPrefix,
  entry,
}: {
  idPrefix: string;
  entry?: TimelineEntry;
}) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <label htmlFor={`${idPrefix}-title`} className={LABEL}>
          Title
        </label>
        <input
          id={`${idPrefix}-title`}
          name="title"
          required
          maxLength={200}
          defaultValue={entry?.title}
          placeholder="BSc Computer Science"
          className={FIELD}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={`${idPrefix}-org`} className={LABEL}>
          Organization
        </label>
        <input
          id={`${idPrefix}-org`}
          name="organization"
          required
          maxLength={200}
          defaultValue={entry?.organization}
          placeholder="Kasetsart University"
          className={FIELD}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={`${idPrefix}-period`} className={LABEL}>
          Period
        </label>
        <input
          id={`${idPrefix}-period`}
          name="period"
          required
          maxLength={80}
          defaultValue={entry?.period}
          placeholder="2023 - Present"
          className={FIELD}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={`${idPrefix}-kind`} className={LABEL}>
          Type
        </label>
        <select
          id={`${idPrefix}-kind`}
          name="kind"
          className={FIELD}
          defaultValue={entry?.kind ?? "experience"}
        >
          {TIMELINE_KINDS.map((kind) => (
            <option key={kind} value={kind}>
              {kind}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2 md:col-span-2">
        <label htmlFor={`${idPrefix}-desc`} className={LABEL}>
          Description (Optional)
        </label>
        <textarea
          id={`${idPrefix}-desc`}
          name="description"
          rows={3}
          maxLength={1000}
          defaultValue={entry?.description ?? ""}
          className={FIELD}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={`${idPrefix}-sort`} className={LABEL}>
          Sort order
        </label>
        <input
          id={`${idPrefix}-sort`}
          name="sort_order"
          type="number"
          defaultValue={entry?.sort_order ?? 0}
          aria-describedby={`${idPrefix}-sort-hint`}
          className={FIELD}
        />
        <p id={`${idPrefix}-sort-hint`} className="text-xs text-gray-600">
          Higher numbers appear first.
        </p>
      </div>
    </>
  );
}

function StatusLine({ state }: { state: ActionState }) {
  if (!state) return null;
  return (
    <p
      role="status"
      aria-live="polite"
      className={`md:col-span-2 rounded-xl px-4 py-3 text-sm font-medium ${
        state.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"
      }`}
    >
      {state.message}
    </p>
  );
}

function EditRow({
  entry,
  onDone,
}: {
  entry: TimelineEntry;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateTimelineEntry,
    null,
  );

  // Close the inline form once the server confirms the save. This reacts to
  // an external result; it does not derive state from props.
  useEffect(() => {
    if (state?.ok) onDone();
  }, [state, onDone]);

  return (
    <form
      action={formAction}
      className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-sky-300 bg-sky-50/40 rounded-2xl"
    >
      <input type="hidden" name="id" value={entry.id} />
      <EntryFields idPrefix={`edit-${entry.id}`} entry={entry} />

      <StatusLine state={state} />

      <div className="md:col-span-2 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="px-5 py-2.5 rounded-xl bg-sky-700 text-white text-sm font-bold hover:bg-sky-800 transition disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
        >
          {pending ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={onDone}
          disabled={pending}
          className="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function TimelineManager({
  entries,
}: {
  entries: TimelineEntry[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    async (prev, formData) => {
      const result = await createTimelineEntry(prev, formData);
      if (result?.ok) formRef.current?.reset();
      return result;
    },
    null,
  );

  return (
    <div className="space-y-6 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
      <div>
        <h2 className="font-bold text-gray-900">Manage Journey</h2>
        <p className="text-xs text-gray-600">
          Education, experience and awards shown in the Journey section.
        </p>
      </div>

      <form
        ref={formRef}
        action={formAction}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <EntryFields idPrefix="new" />

        <div className="flex items-end">
          <button
            type="submit"
            disabled={pending}
            className="w-full py-3 rounded-2xl bg-gray-900 text-white font-bold hover:bg-black transition disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
          >
            {pending ? "Saving..." : "Add Entry"}
          </button>
        </div>

        <StatusLine state={state} />
      </form>

      <ul className="space-y-3 list-none p-0">
        {entries.map((entry) =>
          editingId === entry.id ? (
            <li key={entry.id}>
              <EditRow entry={entry} onDone={() => setEditingId(null)} />
            </li>
          ) : (
            <li
              key={entry.id}
              className="flex flex-wrap items-center justify-between gap-4 p-4 border border-gray-200 rounded-2xl"
            >
              <div className="min-w-0">
                <p className="font-bold text-gray-900 truncate">
                  {entry.title}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {entry.organization} · {entry.period} · {entry.kind} · sort{" "}
                  {entry.sort_order}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setEditingId(entry.id)}
                  className="text-xs font-bold text-gray-700 hover:text-sky-800 transition p-2 hover:bg-sky-50 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
                >
                  Edit
                  <span className="sr-only"> {entry.title}</span>
                </button>
                <ConfirmDelete
                  action={deleteTimelineEntry}
                  fields={{ id: entry.id }}
                  itemLabel={entry.title}
                />
              </div>
            </li>
          ),
        )}
      </ul>

      {entries.length === 0 && (
        <p className="py-8 text-center text-sm text-gray-600 border-2 border-dashed border-gray-200 rounded-xl">
          No journey entries yet. The Journey section stays hidden until you add
          one.
        </p>
      )}
    </div>
  );
}
