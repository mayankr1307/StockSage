import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "StockSage | Smart Stock Predictions",
  description:
    "Get accurate stock predictions powered by advanced algorithms and real-time market data analysis.",
  authors: [{ name: "Mayank Rajput" }, { name: "Yuvraj Singh" }],
  creator: "Mayank Rajput & Yuvraj Singh",
  keywords: [
    "stock prediction",
    "market analysis",
    "portfolio tracking",
    "financial analytics",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
