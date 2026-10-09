import { TransitionLink } from "@/components/ui/TransitionLink";

export default function NotFound() {
  return (
    <section data-theme="dark" className="ink-grid flex min-h-[100svh] flex-col justify-end bg-ink pb-16 text-paper">
      <div className="frame">
        <p className="label text-paper/60">Error 404 — Sheet not found</p>
        <h1 className="mt-4 text-mega font-medium uppercase leading-[0.8] condensed">
          No space
          <span className="block font-serif font-normal normal-case italic text-paper/80">here — yet.</span>
        </h1>
        <div className="mt-12 flex flex-wrap gap-8 border-t border-paper/20 pt-6">
          <TransitionLink href="/" className="caps border-b border-paper pb-1">
            Return to the studio →
          </TransitionLink>
          <TransitionLink href="/portfolio" className="caps border-b border-paper/40 pb-1 text-paper/70">
            Index of work →
          </TransitionLink>
        </div>
      </div>
    </section>
  );
}
