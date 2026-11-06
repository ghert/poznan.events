import type { Metadata } from "next";
import { NewsletterCard } from "@/components/NewsletterForm";

export const metadata: Metadata = {
  title: "Newsletter - poznan.events",
  description:
    "Co poniedziałek lista wydarzeń w Poznaniu na cały tydzień, prosto na e-mail.",
};

export default function NewsletterPage() {
  return (
    <div className="w-full max-w-2xl">
      <h1 className="text-2xl mb-4">Newsletter</h1>
      <NewsletterCard />
    </div>
  );
}
