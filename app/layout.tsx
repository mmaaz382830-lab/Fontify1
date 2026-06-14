import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Fontify — Typography Toolkit for Modern Teams",
    template: "%s — Fontify",
  },
  description:
    "Generate fluid type scales, pair fonts with confidence, and inspect typography in seconds.",
  keywords: [
    "fontify",
    "typography",
    "type scale",
    "font pairing",
    "fluid typography",
    "design system",
  ],
  applicationName: "Fontify",
  // Add an Open Graph image URL here later (e.g. /og.png).
  openGraph: {
    title: "Fontify — Typography Toolkit for Modern Teams",
    description:
      "Generate fluid type scales, pair fonts with confidence, and inspect typography in seconds.",
    siteName: "Fontify",
    type: "website",
  },
};

// Runs before paint to set the theme class, preventing a light/dark flash.
const themeScript = `
(function () {
  try {
    var t = localStorage.getItem('theme');
    if (!t) t = 'dark'; // default to dark
    if (t === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  } catch (e) {
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
