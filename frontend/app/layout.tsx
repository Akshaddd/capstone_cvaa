import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyAccess",
  description: "DSAPT accessibility auditing for Melbourne public transport",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 antialiased">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem("theme");
                  if (saved === "dark") {
                    document.documentElement.classList.add("dark");
                  } else if (saved === "light") {
                    document.documentElement.classList.remove("dark");
                  } else {
                    // No saved preference — use system
                    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
                      document.documentElement.classList.add("dark");
                    }
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}