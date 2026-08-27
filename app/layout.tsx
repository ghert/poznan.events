import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next"
import "./globals.css";
import Script from "next/script";

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
      <body className="min-h-full flex flex-col scroll-smooth;">{children}</body>
      <Analytics />
    </html>
  );
}
