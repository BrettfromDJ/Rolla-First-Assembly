import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { Toaster } from "@/components/ui/toaster";
import { PrototypeSwitcher } from "@/components/site/prototype-switcher";

export const metadata: Metadata = {
  title: { default: "Gather Church — New here? You're in the right place.", template: "%s · Gather Church" },
  description: "Whether you're exploring faith, looking for community, or just checking things out, we're glad you're here.",
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
