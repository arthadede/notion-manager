import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notion Manager",
  description: "Track your activities and manage transactions with Notion API",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
