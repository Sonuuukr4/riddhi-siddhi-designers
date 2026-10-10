import { ContactActions } from "@/components/contact/ContactActions";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { site } from "@/config/site";
import { LogoMark } from "./Logo";

/** Development-only reminders for details the studio has not supplied yet. */
const SHOW_PENDING = process.env.NODE_ENV !== "production";

/** Extremely minimal: name and discipline line, the studio's address, its direct lines, the index of pages. */
export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer data-theme="dark" data-inert-with-panel className="relative bg-ink text-paper">
      <div className="frame border-t border-paper/15 py-10 md:py-14">
        <div className="grid-12 gap-y-10">
          <div className="col-span-12 lg:col-span-4">
            <p className="flex items-center gap-3">
              <LogoMark className="size-5" />
              <span className="text-[0.9375rem] font-semibold uppercase tracking-[0.2em] expanded">{site.name}</span>
            </p>
            <p className="label mt-3 text-paper/60">{site.descriptor}</p>
          </div>

          <div className="label col-span-12 flex flex-col gap-1.5 text-paper/70 sm:col-span-6 md:col-span-4 lg:col-span-3 lg:col-start-6">
            <span className="text-paper/60">Studio</span>
            <address className="not-italic">
              {site.address.short.map((l) => (
                <span key={l} className="block">
                  {l}
                </span>
              ))}
            </address>
            <a
              href={site.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Get directions to the studio (opens Google Maps in a new tab)"
              className="mt-1 self-start py-1.5 opacity-80 transition-opacity hover:opacity-100 focus-visible:opacity-100 lg:py-0"
            >
              Directions ↗
            </a>
          </div>

          <div className="col-span-6 flex flex-col gap-1.5 md:col-span-4 lg:col-span-2 lg:col-start-9">
            <span className="label text-paper/60">Direct lines</span>
            <ContactActions variant="inline" direction="column" className="text-paper/90" />
            {site.email ? (
              <a href={`mailto:${site.email}`} className="label text-paper/70 hover:text-paper">
                {site.email}
              </a>
            ) : (
              SHOW_PENDING && <span className="label text-paper/40">Email — to be added</span>
            )}
          </div>

          <nav aria-label="Footer" className="col-span-6 md:col-span-4 lg:col-span-2 lg:col-start-11">
            <ul className="label flex flex-col gap-1.5 text-paper/70">
              <li className="text-paper/60">Index</li>
              {site.nav.map((l) => (
                <li key={l.href}>
                  <TransitionLink href={l.href} className="inline-block py-1.5 hover:text-paper lg:py-0">
                    {l.label}
                  </TransitionLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="label mt-14 flex flex-wrap justify-between gap-4 text-paper/60">
          <span>
            © {year} {site.name}
          </span>
          <span>
            {site.coordinates.lat} {site.coordinates.lng}
          </span>
        </div>
      </div>
    </footer>
  );
}
