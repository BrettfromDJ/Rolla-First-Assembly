import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { Toaster } from "@/components/ui/toaster";
import { PrototypeSwitcher } from "@/components/site/prototype-switcher";

export const metadata: Metadata = {
  title: { default: "Rolla First — Where faith feels like family", template: "%s · Rolla First" },
  description: "Rolla First Assembly in Rolla, MO. Sundays at 9:00 & 10:30 AM, Wednesdays at 6:30 PM. Belong. Believe. Become.",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = { themeColor: "#0e0e0e", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh font-sans">
        <StoreProvider>
          {children}
          <div className="grain-wrap" aria-hidden><div className="grain" /></div>
          <PrototypeSwitcher />
          <Toaster />
        </StoreProvider>
      </body>
    </html>
  );
}
