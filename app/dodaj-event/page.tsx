import type { Metadata } from "next";
import AddEventForm from "@/components/AddEventForm";

export const metadata: Metadata = {
  title: "Dodaj wydarzenie - poznan.events",
  description: "Zgłoś wydarzenie w Poznaniu do poznan.events.",
};

export default function AddEventPage() {
  return <AddEventForm />;
}
