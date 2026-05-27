import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyAccess",
  description: "DSAPT accessibility auditing for Melbourne public transport",
};

const themeScript = `
(function() {
  try {
    var saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
    } else if (saved === "light") {
      document.documentElement.classList.remove("dark");
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.classList.add("dark");
    }
  } catch(e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}