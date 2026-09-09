"use client";

import { useActionState, useState } from "react";

import type { ActionState } from "./actions";

type Variant = "row" | "overlay";

const TRIGGER: Record<Variant, string> = {
  row: "text-xs font-bold text-red-600 hover:text-red-800 transition p-2 hover:bg-red-50 rounded-lg disabled:opacity-50",
  overlay:
    "absolute inset-0 bg-red-600/85 text-white opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition flex items-center justify-center font-bold text-xs",
};

/**
 * Two-step delete. Replaces the native confirm() dialog, which blocks the main
 * thread, cannot be styled, and is suppressible by the browser.
 */
export default function ConfirmDelete({
  action,
  fields,
  itemLabel,
  variant = "row",
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  fields: Record<string, string>;
  itemLabel: string;
  variant?: Variant;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    action,
    null,
  );
  const [confirming, setConfirming] = useState(false);

  const hidden = Object.entries(fields).map(([name, value]) => (
    <input key={name} type="hidden" name={name} value={value} />
  ));

  if (!confirming) {
    return (
      <div className={variant === "overlay" ? "contents" : undefined}>
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className={TRIGGER[variant]}
        >
          Delete
          <span className="sr-only"> {itemLabel}</span>
        </button>
        {state && !state.ok && (
          <p role="alert" className="text-xs text-red-700">
            {state.message}
          </p>
        )}
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className={
        variant === "overlay"
          ? "absolute inset-0 bg-white/95 flex flex-col items-center justify-center gap-2 p-2 text-center"
          : "flex items-center gap-2"
      }
    >
      {hidden}
      <span className="text-xs text-gray-700">Delete {itemLabel}?</span>
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg disabled:opacity-60"
        >
          {pending ? "Deleting..." : "Confirm"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={pending}
          className="text-xs font-bold text-gray-700 hover:text-gray-900 px-2 py-1.5"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
