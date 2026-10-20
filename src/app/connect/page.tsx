import { Suspense } from "react";
import { ConnectFlow } from "@/components/connect/connect-flow";

export const metadata = { title: "Let's get connected" };

export default function Page() {
  return (
    <Suspense>
      <ConnectFlow />
    </Suspense>
  );
}
