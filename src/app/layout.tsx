import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Archivo, IBM_Plex_Mono, Instrument_Serif } from "next/font/google";
import { Cursor } from "@/components/layout/Cursor";
import { Footer } from "@/components/layout/Footer";
import { GridOverlay } from "@/components/layout/GridOverlay";
import { Header } from "@/components/layout/Header";
import { IndexOverlay } from "@/components/layout/IndexOverlay";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { SectionRail } from "@/components/layout/SectionRail";
import { MotionProvider } from "@/components/providers/MotionProvider";
import { SmoothScrollProvider } from "@/components/providers/SmoothScroll";
import { TransitionProvider } from "@/components/providers/TransitionProvider";
import { UIProvider } from "@/components/providers/UIProvider";
import { site } from "@/content/site";
import { localBusinessJsonLd } from "@/lib/seo";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.seo.title,
    template: `%s — ${site.name}`,
  },
  description: site.seo.description,
  applicationName: site.name,
  keywords: [
    "architect in Delhi",
    "architecture studio New Delhi",
    "interior designer Patel Nagar",
    "interior design Delhi",
    "3D visualization Delhi",
    "residential architecture",
    "commercial interiors",
    "retail design",
    "hospitality design",
    "MCD work",
    "Vastu design",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: site.name,
    title: site.seo.title,
    description: site.seo.description,
  },
  twitter: {
    card: "summary_large_image",
    title: site.seo.title,
    description: site.seo.description,
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: true },
};

export const viewport: Viewport = {
  themeColor: "#0f0f0e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en-IN" className={`${archivo.variable} ${serif.variable} ${mono.variable}`}>
      <body>
        <a
          href="#main"
          className="caps fixed left-4 top-4 z-[100] -translate-y-24 bg-ink px-4 py-3 text-paper transition-transform focus:translate-y-0"
        >
          Skip to content
        </a>
        <MotionProvider>
          <SmoothScrollProvider>
            <TransitionProvider>
              <UIProvider>
                <Header />
                <MobileMenu />
                <IndexOverlay />
                <main id="main" tabIndex={-1} className="outline-none" data-inert-with-panel>
                  {children}
                </main>
                <Footer />
                <GridOverlay />
                <SectionRail />
                <Cursor />
              </UIProvider>
            </TransitionProvider>
          </SmoothScrollProvider>
        </MotionProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd()) }}
        />
      </body>
    </html>
  );
}
