import { cn } from "@/lib/utils";

/** The Gather mark: an open doorway with a light inside. */
export function Mark({ className, inverted }: { className?: string; inverted?: boolean }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-7", className)} aria-hidden>
      <path
        d="M6 29V15C6 9.477 10.477 5 16 5s10 4.477 10 10v14H6Z"
        className={inverted ? "fill-paper" : "fill-forest-700"}
      />
      <path d="M11 29V17.5a5 5 0 0 1 10 0V29" className={inverted ? "fill-forest-800" : "fill-paper"} />
      <circle cx="16" cy="21.5" r="2.25" className="fill-honey" />
    </svg>
  );
}

export function Logo({ className, inverted }: { className?: string; inverted?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Mark inverted={inverted} />
      <span
        className={cn(
          "font-display text-[26px] leading-none tracking-[-0.02em]",
          inverted ? "text-paper" : "text-forest-800",
        )}
      >
        Gather
      </span>
    </span>
  );
}
