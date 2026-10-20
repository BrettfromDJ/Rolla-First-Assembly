import { Suspense } from "react";
import { ExplorePage } from "@/components/explore/explore-page";

export const metadata = { title: "Explore" };

export default function Page() {
  return (
    <Suspense>
      <ExplorePage />
    </Suspense>
  );
}
