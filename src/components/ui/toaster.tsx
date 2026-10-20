"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="top-center"
      offset={20}
      toastOptions={{
        classNames: {
          toast:
            "!rounded-2xl !border-0 !bg-forest-900 !text-paper !shadow-[0_20px_40px_-16px_rgb(10_24_17/0.5)] !font-sans !px-4 !py-3.5",
          description: "!text-paper/70",
          actionButton: "!bg-paper !text-forest-900 !rounded-full !font-medium",
          icon: "!text-forest-500",
        },
      }}
    />
  );
}
