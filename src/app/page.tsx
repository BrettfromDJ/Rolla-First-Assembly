import { ChurchHome } from "@/components/church/church-home";

export const metadata = {
  title: { absolute: "Rolla First — Where faith feels like family" },
  description: "Belong. Believe. Become. Join us Sundays at 9:00 & 10:30 AM and Wednesdays at 6:30 PM.",
};

export default function Page() {
  return <ChurchHome />;
}
