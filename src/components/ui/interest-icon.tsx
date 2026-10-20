import { Compass, HandHeart, House, Sprout, Users } from "lucide-react";
import type { InterestId } from "@/lib/types";
import { cn } from "@/lib/utils";

const icons = { people: Users, home: House, faith: Compass, family: Sprout, serve: HandHeart };

export const interestTone: Record<InterestId, string> = {
  people: "bg-honey-soft text-honey",
  home: "bg-forest-100 text-forest-700",
  faith: "bg-sky-soft text-sky",
  family: "bg-clay-soft text-clay",
  serve: "bg-sage-soft text-forest-600",
};

export function InterestIcon({ id, className }: { id: InterestId; className?: string }) {
  const I = icons[id];
  return <I className={cn("size-5", className)} strokeWidth={1.75} />;
}

export function InterestChip({ id, label, className }: { id: InterestId; label: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", interestTone[id], className)}>
      <InterestIcon id={id} className="size-3.5" />
      {label}
    </span>
  );
}
