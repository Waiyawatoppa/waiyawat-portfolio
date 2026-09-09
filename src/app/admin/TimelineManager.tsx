"use client";

import { useActionState, useRef } from "react";

import { TIMELINE_KINDS, type TimelineEntry } from "@/lib/types";
import ConfirmDelete from "./ConfirmDelete";
import {
  createTimelineEntry,
  deleteTimelineEntry,
  type ActionState,
} from "./actions";

const FIELD =
  "p-3 bg-gray-50 rounded-xl border border-transparent outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:border-sky-600";
const LABEL = "text-xs font-bold uppercase text-gray-600";

export default function TimelineManager({
  entries,
}: {
  entries: TimelineEntry[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
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
        <div className="flex flex-col gap-2">
          <label htmlFor="tl_title" className={LABEL}>
            Title
          </label>
          <input
            id="tl_title"
            name="title"
            required
            maxLength={200}
            placeholder="BSc Computer Science"
            className={FIELD}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="tl_org" className={LABEL}>
            Organization
          </label>
          <input
            id="tl_org"
            name="organization"
            required
            maxLength={200}
            placeholder="Kasetsart University"
            className={FIELD}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="tl_period" className={LABEL}>
            Period
          </label>
          <input
            id="tl_period"
            name="period"
            required
            maxLength={80}
            placeholder="2023 - Present"
            className={FIELD}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="tl_kind" className={LABEL}>
            Type
          </label>
          <select id="tl_kind" name="kind" className={FIELD} defaultValue="experience">
            {TIMELINE_KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {kind}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2 md:col-span-2">
          <label htmlFor="tl_desc" className={LABEL}>
            Description (Optional)
          </label>
          <textarea
            id="tl_desc"
            name="description"
            rows={3}
            maxLength={1000}
            className={FIELD}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="tl_sort" className={LABEL}>
            Sort order
          </label>
          <input
            id="tl_sort"
            name="sort_order"
            type="number"
            defaultValue={0}
            aria-describedby="tl_sort_hint"
            className={FIELD}
          />
          <p id="tl_sort_hint" className="text-xs text-gray-600">
            Higher numbers appear first.
          </p>
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={pending}
            className="w-full py-3 rounded-2xl bg-gray-900 text-white font-bold hover:bg-black transition disabled:opacity-60"
          >
            {pending ? "Saving..." : "Add Entry"}
          </button>
        </div>

        {state && (
          <p
            role="status"
            aria-live="polite"
            className={`md:col-span-2 rounded-xl px-4 py-3 text-sm font-medium ${
              state.ok
                ? "bg-emerald-50 text-emerald-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            {state.message}
          </p>
        )}
      </form>

      <ul className="space-y-3 list-none p-0">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="flex flex-wrap items-center justify-between gap-4 p-4 border border-gray-200 rounded-2xl"
          >
            <div className="min-w-0">
              <p className="font-bold text-gray-900 truncate">{entry.title}</p>
              <p className="text-xs text-gray-600 truncate">
                {entry.organization} · {entry.period} · {entry.kind} · sort{" "}
                {entry.sort_order}
              </p>
            </div>
            <ConfirmDelete
              action={deleteTimelineEntry}
              fields={{ id: entry.id }}
              itemLabel={entry.title}
            />
          </li>
        ))}
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
