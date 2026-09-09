import { cn } from "@/lib/utils";

/**
 * Editorial wordmark: a struck-through disc (abstract coin / ledger entry)
 * next to "FinTrack" set in the display serif.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-2 font-serif text-[1.05rem] font-medium tracking-tight",
        className,
      )}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        aria-hidden
        className="translate-y-[3px] text-primary"
      >
        <circle
          cx="9"
          cy="9"
          r="7.25"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M4 9h10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <span>
        Fin<span className="italic">Track</span>
      </span>
    </span>
  );
}
