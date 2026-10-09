import type { ReactNode } from "react";
import { Cursor } from "@/components/layout/Cursor";
import { Footer } from "@/components/layout/Footer";
import { GridOverlay } from "@/components/layout/GridOverlay";
import { Header } from "@/components/layout/Header";
import { IndexOverlay } from "@/components/layout/IndexOverlay";
import { MobileActionBar } from "@/components/layout/MobileActionBar";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { SectionRail } from "@/components/layout/SectionRail";
import { MotionProvider } from "@/components/providers/MotionProvider";
import { SiteDataProvider } from "@/components/providers/SiteDataProvider";
import { SmoothScrollProvider } from "@/components/providers/SmoothScroll";
import { TransitionProvider } from "@/components/providers/TransitionProvider";
import { UIProvider } from "@/components/providers/UIProvider";
import { getProjectSummaries } from "@/lib/cms/public";
import { localBusinessJsonLd } from "@/lib/seo";

/** Public website chrome: navigation, project index, smooth scrolling, transitions, cursor. */
export default async function SiteLayout({ children }: Readonly<{ children: ReactNode }>) {
  const projects = await getProjectSummaries();
  return (
    <>
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
              <SiteDataProvider projects={projects}>
                <Header />
                <MobileMenu />
                <IndexOverlay />
                <main id="main" tabIndex={-1} className="outline-none" data-inert-with-panel>
                  {children}
                </main>
                <Footer />
                <MobileActionBar />
                <GridOverlay />
                <SectionRail />
                <Cursor />
              </SiteDataProvider>
            </UIProvider>
          </TransitionProvider>
        </SmoothScrollProvider>
      </MotionProvider>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd()) }} />
    </>
  );
}
