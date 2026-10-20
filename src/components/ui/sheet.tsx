"use client";

import * as D from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A responsive dialog: a bottom sheet on phones, a centered card on larger
 * screens, or a right-side panel (`side="right"`) for the staff dashboard.
 */
export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  hideTitle,
  side = "center",
  className,
  children,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description?: string;
  hideTitle?: boolean;
  side?: "center" | "right";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <D.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <D.Portal forceMount>
            <D.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-50 bg-forest-950/40 backdrop-blur-[2px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </D.Overlay>
            <D.Content asChild forceMount aria-describedby={description ? undefined : undefined}>
              {side === "right" ? (
                <motion.div
                  className={cn(
                    "fixed inset-y-0 right-0 z-50 flex w-full max-w-[560px] flex-col bg-white shadow-2xl focus:outline-none",
                    className,
                  )}
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 34, stiffness: 340 }}
                >
                  <Header title={title} description={description} hideTitle={hideTitle} />
                  {children}
                </motion.div>
              ) : (
                <motion.div
                  className={cn(
                    "fixed inset-x-0 bottom-0 z-50 max-h-[92dvh] overflow-y-auto rounded-t-[28px] bg-paper shadow-2xl focus:outline-none",
                    "sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-[min(560px,calc(100vw-48px))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[28px]",
                    className,
                  )}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 40 }}
                  transition={{ type: "spring", damping: 32, stiffness: 380 }}
                >
                  <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-stone-300 sm:hidden" aria-hidden />
                  <Header title={title} description={description} hideTitle={hideTitle} floating />
                  {children}
                </motion.div>
              )}
            </D.Content>
          </D.Portal>
        )}
      </AnimatePresence>
    </D.Root>
  );
}

function Header({ title, description, hideTitle, floating }: { title: string; description?: string; hideTitle?: boolean; floating?: boolean }) {
  return (
    <>
      <D.Title className={hideTitle ? "sr-only" : "px-6 pt-6 pr-16 text-lg font-semibold text-stone-900"}>{title}</D.Title>
      {description ? (
        <D.Description className={hideTitle ? "sr-only" : "px-6 pt-1 text-sm text-stone-500"}>{description}</D.Description>
      ) : (
        <D.Description className="sr-only">{title}</D.Description>
      )}
      <D.Close
        className={cn(
          "absolute right-4 top-4 z-10 flex size-9 items-center justify-center rounded-full text-stone-600 transition hover:bg-stone-900/5",
          floating && "bg-white/80 shadow-sm backdrop-blur",
        )}
        aria-label="Close"
      >
        <X className="size-4" />
      </D.Close>
    </>
  );
}
