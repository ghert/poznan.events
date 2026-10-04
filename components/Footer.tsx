import Link from "next/link";
import { Fragment } from "react";
import { NAV_LINKS } from "./navLinks";

export default function Footer() {
  return (
    <footer className="m-auto footer max-w-7xl sm:footer-horizontal text-base-content rounded text-lg pt-8 pb-4 max-md:pt-0">
      <nav className="flex justify-center w-full flex-wrap">
        {NAV_LINKS.map(({ href, label }, i) => (
          <Fragment key={href}>
            {i > 0 ? " · " : null}
            <Link className="hover:opacity-50 text-nowrap" href={href}>
              {label}
            </Link>
          </Fragment>
        ))}
      </nav>
    </footer>
  );
}
