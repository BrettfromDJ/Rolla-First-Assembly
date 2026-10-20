"use client";

import { useState } from "react";
import { cn, initials } from "@/lib/utils";

const palette = ["bg-forest-100 text-forest-800", "bg-honey-soft text-[#7a5a17]", "bg-clay-soft text-[#7b3d22]", "bg-sage-soft text-forest-700", "bg-sky-soft text-[#2f4a55]"];

export function Avatar({ name, src, className }: { name: string; src?: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  const color = palette[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % palette.length];
  return (
    <span className={cn("relative inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-semibold", color, className)}>
      {initials(name) || "?"}
      {src && !failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" onError={() => setFailed(true)} className="absolute inset-0 h-full w-full object-cover" />
      )}
    </span>
  );
}

export function AvatarStack({ people, className }: { people: { name: string; photo?: string }[]; className?: string }) {
  return (
    <span className={cn("flex -space-x-2", className)}>
      {people.map((p) => (
        <Avatar key={p.name} name={p.name} src={p.photo} className="ring-2 ring-white" />
      ))}
    </span>
  );
}
