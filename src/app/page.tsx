import { Hero } from "@/components/hero";
import { PollForm } from "@/components/poll-form";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <PollForm />
    </div>
  );
}
