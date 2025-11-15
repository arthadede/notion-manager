import "./globals.css";
import Navigation from "./Navigation";

export const metadata = {
  title: "Activity Tracker",
  description: "Track your activities with Notion API",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
