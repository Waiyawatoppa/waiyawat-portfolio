"use client";

import { useSyncExternalStore } from "react";

import {
  readTheme,
  subscribeTheme,
  THEMES,
  writeTheme,
  type Theme,
} from "@/lib/theme";

const LABEL: Record<Theme, string> = {
  system: "System theme",
  light: "Light theme",
  dark: "Dark theme",
};

function Icon({ theme }: { theme: Theme }) {
  const common = {
    className: "w-5 h-5",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (theme === "dark") {
    return (
      <svg {...common}>
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
      </svg>
    );
  }
  if (theme === "light") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4 1.4-1.4" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  );
}

/** Cycles system → light → dark. Server snapshot is "system", matching the un-attributed <html>. */
export default function ThemeToggle() {
  const theme = useSyncExternalStore<Theme>(
    subscribeTheme,
    readTheme,
    () => "system",
  );

  const next: Theme = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];

  return (
    <button
      type="button"
      onClick={() => writeTheme(next)}
      title={`${LABEL[theme]} — switch to ${LABEL[next].toLowerCase()}`}
      className="p-2 rounded-lg text-ink-secondary hover:text-ink hover:bg-surface-muted transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <Icon theme={theme} />
      <span className="sr-only">
        {LABEL[theme]}. Switch to {LABEL[next].toLowerCase()}.
      </span>
    </button>
  );
}
