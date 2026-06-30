import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

import "./globals.css";
import { SessionProvider } from "next-auth/react";

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://diplomarbeit-ideen.vercel.app");
const seoTitle = "Diplomarbeit Ideen";
const seoDescription =
  "KI-gestützte Diplomarbeitensuche für HTL-Softwareprojekte mit Archivbelegen, Qdrant Hybrid Retrieval und Gemini Embeddings.";
const logoImage = "/images/htl-donaustadt-logo.png";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: seoTitle,
  title: {
    default: `${seoTitle} | HTL Donaustadt`,
    template: `%s | ${seoTitle}`,
  },
  description: seoDescription,
  keywords: [
    "Diplomarbeit Ideen",
    "HTL Donaustadt",
    "Diplomarbeit Software Engineering",
    "KI Themenfindung",
    "Qdrant Hybrid Retrieval",
    "Gemini Embeddings",
    "RAG Diplomarbeit",
  ],
  authors: [{ name: "HTL Donaustadt" }],
  creator: "HTL Donaustadt",
  publisher: "HTL Donaustadt",
  category: "education",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "de_AT",
    url: "/",
    siteName: seoTitle,
    title: `${seoTitle} | Archivgestützte Themenfindung`,
    description: seoDescription,
    images: [
      {
        url: logoImage,
        width: 801,
        height: 801,
        alt: "HTL Donaustadt Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: `${seoTitle} | Archivgestützte Themenfindung`,
    description: seoDescription,
    images: [logoImage],
  },
  icons: {
    icon: [
      { url: "/icon.png", sizes: "801x801", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "801x801", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
};

export const viewport = {
  maximumScale: 1,
};

const LIGHT_THEME_COLOR = "hsl(0 0% 100%)";
const DARK_THEME_COLOR = "hsl(240deg 10% 3.92%)";
const THEME_COLOR_SCRIPT = `\
(function() {
  var html = document.documentElement;
  var meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }
  function updateThemeColor() {
    var isDark = html.classList.contains('dark');
    meta.setAttribute('content', isDark ? '${DARK_THEME_COLOR}' : '${LIGHT_THEME_COLOR}');
  }
  var observer = new MutationObserver(updateThemeColor);
  observer.observe(html, { attributes: true, attributeFilter: ['class'] });
  updateThemeColor();
})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: "Required"
          dangerouslySetInnerHTML={{
            __html: THEME_COLOR_SCRIPT,
          }}
        />
      </head>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          <SessionProvider
            basePath={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/auth`}
          >
            <TooltipProvider>{children}</TooltipProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
