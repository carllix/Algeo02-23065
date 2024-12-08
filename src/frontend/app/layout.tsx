import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import InteractiveLayout from "./interactiveLayout";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Audio Searcher",
  description: "Search and play your audio files easily.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <InteractiveLayout>{children}</InteractiveLayout>
      </body>
    </html>
  );
}
