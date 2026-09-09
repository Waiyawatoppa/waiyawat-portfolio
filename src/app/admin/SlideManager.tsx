"use client";

import Image from "next/image";
import { useActionState, useRef } from "react";

import type { Slide } from "@/lib/types";
import ConfirmDelete from "./ConfirmDelete";
import { createSlide, deleteSlide, type ActionState } from "./actions";

/**
 * Slides are fetched on the server and passed in, so this component no longer
 * needs its own effect-driven fetch (which had no abort handling and could
 * leave the list stale after a failed request).
 */
export default function SlideManager({ slides }: { slides: Slide[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    async (prev, formData) => {
      const result = await createSlide(prev, formData);
      if (result?.ok) formRef.current?.reset();
      return result;
    },
    null,
  );

  return (
    <div className="space-y-6 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-bold text-gray-900">Manage About Slider</h2>
          <p className="text-xs text-gray-600">
            Images shown beside the About section on the homepage.
          </p>
        </div>

        <form
          ref={formRef}
          action={formAction}
          className="flex items-center gap-3"
        >
          <label htmlFor="slide_image" className="sr-only">
            Slide image
          </label>
          <input
            id="slide_image"
            type="file"
            name="image_file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
            required
            className="text-xs max-w-[12rem]"
          />
          <button
            type="submit"
            disabled={pending}
            className="bg-sky-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-sky-700 transition disabled:opacity-60"
          >
            {pending ? "Uploading..." : "Add Slide"}
          </button>
        </form>
      </div>

      {state && (
        <p
          role="status"
          aria-live="polite"
          className={`rounded-xl px-4 py-3 text-sm font-medium ${
            state.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"
          }`}
        >
          {state.message}
        </p>
      )}

      <ul className="grid grid-cols-2 md:grid-cols-4 gap-4 list-none p-0">
        {slides.map((slide, index) => (
          <li
            key={slide.id}
            className="relative aspect-square rounded-xl overflow-hidden group border border-gray-200"
          >
            <Image
              src={slide.image_url}
              alt={`About slider image ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            <ConfirmDelete
              action={deleteSlide}
              fields={{ id: slide.id, image_url: slide.image_url }}
              itemLabel={`slider image ${index + 1}`}
              variant="overlay"
            />
          </li>
        ))}
      </ul>

      {slides.length === 0 && (
        <p className="py-10 text-center text-sm text-gray-600 border-2 border-dashed border-gray-200 rounded-xl">
          No slider images yet. Upload one to get started.
        </p>
      )}
    </div>
  );
}
