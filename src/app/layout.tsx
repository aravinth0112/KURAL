import type { Metadata } from "next";
import { DM_Sans, Noto_Sans_Tamil } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm",
  subsets: ["latin"],
  display: "swap",
  fallback: [
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "Helvetica Neue",
    "Arial",
    "sans-serif",
  ],
});

const notoTamil = Noto_Sans_Tamil({
  variable: "--font-noto-tamil",
  subsets: ["tamil"],
  weight: ["400", "600", "700"],
  display: "swap",
  fallback: [
    "Latha",
    "Tamil Sangam MN",
    "sans-serif",
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lputamizhans.com"), // Update with real domain later
  title: {
    default: "LPU Tamizhans | Tamil Student Community at Lovely Professional University",
    template: "%s | LPU Tamizhans",
  },
  description: "LPU Tamizhans is a Tamil student community at Lovely Professional University, connecting Tamil students through culture, events, activities, and community initiatives.",
  keywords: [
    "LPU Tamizhans", "LPU Tamilans", "Tamil Students in LPU", "Tamil Community in LPU", "Kural LPU", 
    "Tamil Student Organization", "Tamil Cultural Events LPU", "Tamil Students Association LPU",
    "Lovely Professional University", "LPU", "LPU Punjab", "LPU Phagwara", "LPU students",
    "LPU student community", "LPU student organizations", "LPU student clubs", "LPU events",
    "LPU campus events", "LPU student activities", "Tamil students at LPU"
  ],
  authors: [{ name: "Kural" }],
  creator: "Kural",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://lputamizhans.com",
    title: "LPU Tamizhans | Tamil Student Community at Lovely Professional University",
    description: "LPU Tamizhans is a Tamil student community at Lovely Professional University, connecting Tamil students through culture, events, activities, and community initiatives.",
    siteName: "LPU Tamizhans",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LPU Tamizhans | Tamil Student Community at Lovely Professional University",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LPU Tamizhans | Tamil Student Community at Lovely Professional University",
    description: "LPU Tamizhans is a Tamil student community at Lovely Professional University, connecting Tamil students through culture, events, activities, and community initiatives.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
      { url: "/favicon.png", type: "image/png", sizes: "192x192" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileFloatingCTA } from "@/components/layout/MobileFloatingCTA";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${notoTamil.variable} font-sans scroll-smooth`}
      suppressHydrationWarning
    >
      <body className="antialiased min-h-screen flex flex-col selection:bg-primary/20 selection:text-foreground overflow-x-hidden w-full max-w-full">
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-4 focus:left-4 bg-primary text-white font-bold py-2 px-4 rounded-xl shadow-lg outline-none ring-2 ring-primary ring-offset-2 transition-all"
        >
          Skip to main content
        </a>
        <Navbar />
        <main id="main-content" className="flex-1 focus:outline-none w-full max-w-full" tabIndex={-1}>
          {children}
        </main>
        <Footer />
        <MobileFloatingCTA />
      </body>
    </html>
  );
}
