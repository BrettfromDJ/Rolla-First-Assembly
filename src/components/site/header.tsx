"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/new", label: "New here" },
  { href: "/visit", label: "Plan a visit" },
  { href: "/explore", label: "Explore" },
  { href: "/home", label: "My Gather" },
];

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const path = usePathname();
  const { profile, hydrated } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => setOpen(false), [path]);

  const light = overlay && !scrolled && !open;
  const onboarded = hydrated && profile.onboardingComplete;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-[background-color,box-shadow,backdrop-filter] duration-300",
        light ? "bg-transparent" : "bg-ink/80 shadow-[0_1px_0_rgb(255_255_255/0.06)] backdrop-blur-xl",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-18 md:px-8">
        <Link href="/new" aria-label="Rolla First home" className="rounded-lg">
          <Logo inverted={light} />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {nav.map((n) => {
            const active = path === n.href || (n.href !== "/new" && path.startsWith(n.href));
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "relative rounded-full px-4 py-2 text-[15px] transition-colors",
                  light ? "text-paper/80 hover:text-paper" : "text-stone-600 hover:text-stone-900",
                  active && (light ? "text-paper" : "text-stone-900"),
                )}
              >
                {n.label}
                {active && (
                  <motion.span
                    layoutId="nav-dot"
                    className={cn("absolute bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full", light ? "bg-paper" : "bg-forest-600")}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {onboarded ? (
            <Link href="/home" className="hidden items-center gap-2 rounded-full py-1 pl-1 pr-4 text-sm font-medium ring-1 ring-stone-900/10 transition hover:ring-stone-900/20 md:flex">
              <Avatar name={profile.firstName || "You"} className="size-8 bg-forest-700 text-ink" />
              <span className={light ? "text-paper" : "text-stone-800"}>{profile.firstName || "My Gather"}</span>
            </Link>
          ) : (
            <Button asChild variant={light ? "light" : "primary"} size="sm" className="hidden md:inline-flex">
              <Link href="/connect">
                Let&apos;s connect <ArrowRight />
              </Link>
            </Button>
          )}
          <button
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className={cn("flex size-10 items-center justify-center rounded-full md:hidden", light ? "text-paper" : "text-stone-800")}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            aria-label="Mobile"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden bg-ink md:hidden"
          >
            <div className="space-y-1 px-5 pb-6 pt-2">
              {[...nav, { href: "/connect", label: "Get connected" }].map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cn(
                    "flex items-center justify-between rounded-2xl px-4 py-3.5 font-display text-2xl text-stone-900",
                    path === n.href && "bg-white",
                  )}
                >
                  {n.label}
                  <ArrowRight className="size-4 text-stone-400" />
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
