import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next"
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "poznan.events",
  description: "Music events in Poznań. Wydarzenia muzyczne w Poznaniu.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script defer src="https://cloud.umami.is/script.js" data-website-id="23f5f38d-c2c3-42f8-b2f3-1c8a4de698c1"></script>
      </head>
      <body className="min-h-full flex flex-col scroll-smooth;">
      <div className="flex flex-col flex-1  bg-zinc-50 font-sans dark:bg-black">
        <main className="flex flex-1 w-full flex-col p-16 max-md:p-4 bg-white dark:bg-black sm:items-start">
          <h2 className="logo mb-8 font-bold text-4xl">poznan.events 🌀</h2>
          <div className="flex flex-row w-full items-start max-md:flex-col-reverse">
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
