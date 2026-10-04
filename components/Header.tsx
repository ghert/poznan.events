import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { PlusIcon } from "lucide-react";
import MobileDrawer from "./MobileDrawer";

export default function Header() {
  return (
    <div className="flex justify-between items-center w-full">
      <div className="flex items-center">
        <MobileDrawer />
        <Link href="/" className="active:opacity-50">
          <h2 className="logo mb-2 font-bold text-4xl">poznan.events</h2>
        </Link>
        <Link
          href="/dodaj-wydarzenie"
          className="ml-6 hover:opacity-60 hidden md:block"
        >
          dodaj wydarzenie
        </Link>
      </div>
      <ThemeToggle />
    </div>
  );
}
