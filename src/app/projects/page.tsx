import type { Metadata } from "next";
import { ProjectIndex } from "@/components/project/ProjectIndex";
import { Coordinates } from "@/components/ui/Annotations";
import { FadeIn, RevealLines, Rule } from "@/components/ui/Reveal";
import { projects } from "@/content/projects";
import { site } from "@/content/site";
import { pad } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Index of Work",
  description:
    "Residential, commercial, hospitality, interior, retail and visualization projects by Riddhi Siddhi Designers, New Delhi.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  return (
    <section
      data-theme="light"
      aria-labelledby="index-title"
      className="paper-grid min-h-screen bg-paper pb-28 pt-[calc(var(--header-h)+3rem)] text-ink md:pt-[calc(var(--header-h)+5rem)]"
    >
      <div className="frame">
        <div className="label flex justify-between text-concrete">
          <span>Index — {pad(projects.length)} entries</span>
          <Coordinates />
        </div>
        <Rule className="mt-3" />
        <div className="grid-12 mt-10 items-end gap-y-6 md:mt-14">
          <h1
            id="index-title"
            className="col-span-12 text-mega font-medium uppercase leading-[0.8] condensed md:col-span-9"
          >
            <RevealLines
              lines={[
                "Index",
                <span key="2" className="font-serif font-normal normal-case italic">
                  of work
                </span>,
              ]}
              immediate
            />
          </h1>
          <FadeIn className="col-span-12 text-concrete md:col-span-3">
            {site.descriptor}. Each entry opens a full project record — images, drawings, visualization, materials.
          </FadeIn>
        </div>
      </div>
      <div className="frame mt-16 md:mt-24">
        <ProjectIndex />
      </div>
    </section>
  );
}
