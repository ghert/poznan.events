import Link from "next/link";

export default function Footer() {
  return (
    <footer className="m-auto footer max-w-7xl sm:footer-horizontal text-base-content rounded text-lg pt-8 pb-4 max-md:pt-0">
      <nav className="flex justify-center w-full">
        <Link
          className="hover:opacity-50"
          href="https://instagram.com/poznan.events"
        >
          instagram.com/poznan.events
        </Link>
      </nav>
    </footer>
  );
}
