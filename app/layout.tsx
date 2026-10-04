import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import Filters from "@/components/Filters";
import Link from "next/link";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";
import { getVenues } from "@/lib/getVenues";
import Header from "@/components/Header";

const GeistSans = Geist();

export const metadata: Metadata = {
  title: "poznan.events - wydarzenia i koncerty w Poznaniu",
  description:
    "Imprezy, DJ sety, jam session i muzyka na żywo w jednym miejscu. Blue note, schron, tama, farby, ślina.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const venues = await getVenues();
  return (
    <html
      lang="en"
      className={`h-full antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <link rel="apple-touch-icon" href="/icon.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const stored = localStorage.getItem('theme');
                const theme = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.setAttribute('data-theme', theme);
                document.documentElement.classList.toggle('dark', theme === 'dark');
              })();
            `,
          }}
        />
        <script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="23f5f38d-c2c3-42f8-b2f3-1c8a4de698c1"
        ></script>
      </head>
      <body
        className={`min-h-full flex flex-col scroll-smooth bg-background ${GeistSans.className} px-8 max-sm:px-4`}
      >
        <div className="flex flex-col flex-1 font-sans w-full max-w-7xl m-auto py-8 max-md:pt-4">
          <main className="m-auto flex flex-1 w-full flex-col">
            <Header />
            <Filters venues={venues} />
            <div className="flex flex-row w-full items-start max-md:flex-col-reverse gap-4">
              {children}
            </div>
          </main>
        </div>
        <Footer />
      </body>
      <Analytics />
    </html>
  );
}
