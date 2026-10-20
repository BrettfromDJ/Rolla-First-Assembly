"use client";

import { forwardRef, useId } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string | null;
  optional?: boolean;
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(({ label, hint, error, optional, className, id, ...props }, ref) => {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={fid} className="flex items-baseline justify-between text-sm font-medium text-stone-800">
        {label}
        {optional && <span className="text-xs font-normal text-stone-400">Optional</span>}
      </label>
      <input
        ref={ref}
        id={fid}
        aria-invalid={!!error}
        aria-describedby={error ? `${fid}-err` : hint ? `${fid}-hint` : undefined}
        className={cn(
          "h-13 w-full rounded-2xl bg-white px-4 text-[16px] text-stone-900 ring-1 ring-stone-200 transition placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-500",
          error && "ring-clay focus:ring-clay",
        )}
        {...props}
      />
      {error ? (
        <p id={`${fid}-err`} className="text-[13px] text-clay">{error}</p>
      ) : hint ? (
        <p id={`${fid}-hint`} className="text-[13px] text-stone-500">{hint}</p>
      ) : null}
    </div>
  );
});
Field.displayName = "Field";

export function Textarea({ label, optional, className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; optional?: boolean }) {
  const id = useId();
  return (
    <div className={cn("space-y-2", className)}>
      {/* Laid out like Field's label (a block), so the gap above the box matches every other field. */}
      <label htmlFor={id} className="flex items-baseline justify-between text-sm font-medium text-stone-800">
        {label}
        {optional && <span className="text-xs font-normal text-stone-400">Optional</span>}
      </label>
      <textarea
        id={id}
        className="min-h-28 w-full resize-none rounded-2xl bg-white p-4 text-[16px] text-stone-900 ring-1 ring-stone-200 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-500"
        {...props}
      />
    </div>
  );
}

export function Checkbox({ checked, onChange, children, className }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("group flex cursor-pointer items-start gap-3 text-sm text-stone-600", className)}>
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span
        aria-hidden
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md ring-1 transition peer-focus-visible:ring-2 peer-focus-visible:ring-forest-500",
          checked ? "bg-forest-700 ring-forest-700" : "bg-white ring-stone-300 group-hover:ring-stone-400",
        )}
      >
        <Check className={cn("size-3.5 text-paper transition", checked ? "scale-100 opacity-100" : "scale-50 opacity-0")} strokeWidth={3} />
      </span>
      <span>{children}</span>
    </label>
  );
}
