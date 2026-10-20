import { Suspense } from "react";
import { EventsPage } from "@/components/events/events-page";

export const metadata = { title: "Explore" };

export default function Page() {
  return (
    <Suspense>
      <EventsPage />
    </Suspense>
  );
}
