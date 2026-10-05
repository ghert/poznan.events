import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { PlusCircle, PlusIcon } from "lucide-react";
import MobileDrawer from "./MobileDrawer";

export default function Header() {
  return (
    <div className="flex justify-between items-center w-full">
      <div className="flex items-center">
        <MobileDrawer />
        <Link href="/" className="active:opacity-50">
          <h2 className="logo mb-2 font-bold text-4xl">poznan.events</h2>
        </Link>
      </div>
      <div className="flex items-center ">
        <Link
          href="/dodaj-wydarzenie"
          className="ml-6 mr-2 group hidden md:block border-surface-300 hover:bg-base-content hover:text-base-100 border-1 rounded-3xl px-4 py-1"
        >
          dodaj wydarzenie{" "}
          <PlusIcon
            width="16"
            height="16"
            className="inline-flex group-hover:rotate-90 transition-transform"
          />
        </Link>
        <ThemeToggle />
      </div>
    </div>
  );
}
