import Link from "next/link";

export default function Footer() {
  return (
    <footer className="m-auto footer max-w-7xl sm:footer-horizontal text-base-content rounded text-lg py-12 pb-4">
      <nav className="flex justify-center w-full">
        <Link className="hover:opacity-50" href="https://instagram.com/poznan.events">
          instagram.com/poznan.events
        </Link>
       </nav>
    </footer>
  )
}
