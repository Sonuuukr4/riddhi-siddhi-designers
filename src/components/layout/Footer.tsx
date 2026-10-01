import { site } from "@/content/site";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { LogoMark } from "./Logo";

const links = site.nav.filter((n) => n.label !== "Process");

/** Extremely minimal: name, discipline line, place, phone, four links. */
export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer data-theme="dark" data-inert-with-panel className="relative bg-ink text-paper">
      <div className="frame border-t border-paper/15 py-10 md:py-14">
        <div className="grid-12 gap-y-10">
          <div className="col-span-12 md:col-span-5">
            <p className="flex items-center gap-3">
              <LogoMark className="size-5" />
              <span className="text-[0.9375rem] font-semibold uppercase tracking-[0.2em] expanded">{site.name}</span>
            </p>
            <p className="label mt-3 text-paper/60">{site.descriptor}</p>
          </div>

          <div className="label col-span-6 flex flex-col gap-1.5 text-paper/70 md:col-span-3 md:col-start-7">
            <span className="text-paper/60">Studio</span>
            <span>
              {site.city} / {site.country}
            </span>
            <a href={site.phone.href} className="hover:text-paper">
              {site.phone.display}
            </a>
            {site.email ? (
              <a href={`mailto:${site.email}`} className="hover:text-paper">
                {site.email}
              </a>
            ) : (
              <span className="text-paper/60">Email — to be added</span>
            )}
          </div>

          <nav aria-label="Footer" className="col-span-6 md:col-span-2 md:col-start-11">
            <ul className="label flex flex-col gap-1.5 text-paper/70">
              <li className="text-paper/60">Index</li>
              {links.map((l) => (
                <li key={l.href}>
                  <TransitionLink href={l.href} className="hover:text-paper">
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
