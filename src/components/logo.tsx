import { cn } from "@/lib/utils";

/** FinTrack wordmark with a small rising-bars glyph. */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-flex items-center gap-2 font-semibold", className)}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
        aria-hidden
        className="text-primary"
      >
        <rect
          x="2"
          y="12"
          width="4"
          height="8"
          rx="1.5"
          fill="currentColor"
          opacity="0.5"
        />
        <rect
          x="9"
          y="7"
          width="4"
          height="13"
          rx="1.5"
          fill="currentColor"
          opacity="0.75"
        />
        <rect x="16" y="2" width="4" height="18" rx="1.5" fill="currentColor" />
      </svg>
      <span className="tracking-tight">FinTrack</span>
    </span>
  );
}
