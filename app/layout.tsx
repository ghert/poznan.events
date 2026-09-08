import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next"
import "./globals.css";
import { CirclePlus} from "lucide-react";
import Filters from "@/components/Filters";
import Link from "next/link";

const GeistSans = Geist();

export const metadata: Metadata = {
  title: "poznan.events",
  description: "Koncerty i imprezy w Poznaniu w jednym miejscu. Tama, Blue Note, Schron i inne — aktualizowane codziennie.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <head>
        <script defer src="https://cloud.umami.is/script.js" data-website-id="23f5f38d-c2c3-42f8-b2f3-1c8a4de698c1"></script>
      </head>
      <body className={`min-h-full flex flex-col scroll-smooth ${GeistSans.className}`}>

      <div className="flex flex-col flex-1  bg-zinc-50 font-sans dark:bg-black">
          <main className="flex flex-1 w-full flex-col px-16 py-8 max-md:p-4 bg-white dark:bg-black sm:items-start">
            <Link href="/"><h2 className="logo mb-8 font-bold text-4xl">poznan.events</h2></Link>
            <Filters />
          <div className="flex flex-row w-full items-start max-md:flex-col-reverse gap-4">
            {children}
          </div>
          </main>
        </div>
        <footer className="footer sm:footer-horizontal footer-center p-4">
          <aside>
            <p><a className="hover:underline" href="https://filipprzydryga.xyz">filipprzydryga.xyz ✉️</a></p>
          </aside>
        </footer>
      </body>
      <Analytics />
    </html>
  );
}
