/**
 * localStorage-backed autosave for the markdown editor.
 *
 * Exposed as an external store so components read it through
 * useSyncExternalStore instead of copying it into React state inside an
 * effect. Writes notify same-tab subscribers explicitly; the native `storage`
 * event only fires in *other* tabs.
 */

export type Draft = { content: string; savedAt: number };

const PREFIX = "draft:";
const listeners = new Set<() => void>();

function key(id: string) {
  return `${PREFIX}${id}`;
}

function emit() {
  listeners.forEach((listener) => listener());
}

export function subscribeDrafts(onChange: () => void): () => void {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

/**
 * Returns the raw stored string so useSyncExternalStore gets a stable
 * primitive snapshot. Parse with parseDraft().
 */
export function readDraftRaw(id: string): string | null {
  try {
    return window.localStorage.getItem(key(id));
  } catch {
    return null;
  }
}

export function parseDraft(raw: string | null): Draft | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<Draft>;
    if (typeof parsed.content !== "string") return null;
    return {
      content: parsed.content,
      savedAt: typeof parsed.savedAt === "number" ? parsed.savedAt : 0,
    };
  } catch {
    return null;
  }
}

export function writeDraft(id: string, content: string): void {
  try {
    const draft: Draft = { content, savedAt: Date.now() };
    window.localStorage.setItem(key(id), JSON.stringify(draft));
  } catch {
    /* storage unavailable — autosave simply does not happen */
  }
  emit();
}

export function clearDraft(id: string): void {
  try {
    window.localStorage.removeItem(key(id));
  } catch {
    /* nothing to clear */
  }
  emit();
}
