import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { PlusIcon } from "lucide-react";
import MobileDrawer from "./MobileDrawer";
import TagsMenu from "./TagsMenu";
import { getTags } from "@/lib/getTags";

export default async function Header() {
  const tags = await getTags();
  return (
    <div className="flex justify-between items-center w-full">
      <div className="flex items-center">
        <MobileDrawer tags={tags} />
        <Link href="/" className="active:opacity-50">
          <h2 className="logo mb-2 font-bold text-4xl">poznan.events</h2>
        </Link>
      </div>
      <div className="flex items-center gap-2 min-w-0 ml-6">
        <TagsMenu tags={tags} />
        <Link
          href="/dodaj-wydarzenie"
          className="group border-surface-300 hover:bg-base-content hover:text-base-100 border-1 rounded-3xl px-4 py-1 whitespace-nowrap mr-2 hidden md:block"
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
