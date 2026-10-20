"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as DM from "@radix-ui/react-dropdown-menu";
import { LayoutDashboard, Layers, RotateCcw, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const visitor = [
  { href: "/", label: "Homepage", hint: "From Figma" },
  { href: "/visit", label: "New here", hint: "Plan a visit" },
  { href: "/connect", label: "Get connected", hint: "Onboarding" },
  { href: "/events", label: "Events", hint: "Groups, events, serving" },
  { href: "/me", label: "My Rolla First", hint: "Personal home" },
];

/** A small, out-of-the-way control for moving between the visitor and staff experiences. */
export function PrototypeSwitcher() {
  const path = usePathname();
  const router = useRouter();
  const { resetAll } = useStore();
  const isAdmin = path.startsWith("/admin");

  return (
    <div className={cn("fixed left-0 top-[68%] z-[45] md:bottom-4 md:top-auto print:hidden", isAdmin ? "md:left-auto md:right-4" : "md:left-4")}>
      <DM.Root modal={false}>
        <DM.Trigger
          className="group flex h-9 items-center gap-2 rounded-r-full bg-stone-900/75 pl-2 pr-2.5 text-xs font-medium text-white shadow-lg backdrop-blur transition hover:bg-stone-900 data-[state=open]:bg-stone-900 md:h-10 md:rounded-full md:bg-stone-900/90 md:pl-3 md:pr-4"
          aria-label="Prototype navigation"
        >
          <Layers className="size-4 text-honey" />
          <span className="hidden md:inline">{isAdmin ? "Staff view" : "Visitor view"}</span>
        </DM.Trigger>
        <DM.Portal>
          <DM.Content
            side="top"
            align={isAdmin ? "end" : "start"}
            collisionPadding={12}
            sideOffset={10}
            className="z-[60] w-72 rounded-2xl bg-white p-2 shadow-[0_24px_60px_-20px_rgb(0_0_0/0.35)] ring-1 ring-stone-200"
          >
            <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-400">Prototype</p>
            <DM.Label className="flex items-center gap-2 px-3 pt-2 text-xs font-medium text-stone-500">
              <Smartphone className="size-3.5" /> Visitor experience
            </DM.Label>
            {visitor.map((v) => (
              <DM.Item key={v.href} asChild>
                <Link
                  href={v.href}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-3 py-2 text-sm outline-none data-[highlighted]:bg-stone-100",
                    path === v.href ? "font-medium text-forest-700" : "text-stone-800",
                  )}
                >
                  {v.label}
                  <span className="text-xs text-stone-400">{v.hint}</span>
                </Link>
              </DM.Item>
            ))}
            <DM.Separator className="my-2 h-px bg-stone-100" />
            <DM.Item asChild>
              <Link
                href="/admin"
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm outline-none data-[highlighted]:bg-stone-100",
                  isAdmin ? "font-medium text-forest-700" : "text-stone-800",
                )}
              >
                <LayoutDashboard className="size-4" /> Welcome Team dashboard
              </Link>
            </DM.Item>
            <DM.Item
              onSelect={() => {
                resetAll();
                toast("Demo reset", { description: "Everything's back to a fresh start." });
                router.push("/");
              }}
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-stone-500 outline-none data-[highlighted]:bg-stone-100"
            >
              <RotateCcw className="size-4" /> Reset demo data
            </DM.Item>
          </DM.Content>
        </DM.Portal>
      </DM.Root>
    </div>
  );
}
