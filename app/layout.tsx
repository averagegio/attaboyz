import type { Metadata } from "next";
import { Orbitron, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ATTABOY | Secure a new world of ai",
  description:
    "ATTABOY Website Building Inc. — custom sites, AI agents, and secure infrastructure.",
  icons: {
    icon: "/attaboyinc1-transparent.png",
    apple: "/attaboyinc1-transparent.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#030712] text-white">{children}</body>
    </html>
  );
}
