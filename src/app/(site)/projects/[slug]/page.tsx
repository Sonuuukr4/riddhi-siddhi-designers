import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { DrawingPlate } from "@/components/project/DrawingPlate";
import { ProjectGallery } from "@/components/project/ProjectGallery";
import { ProjectHero } from "@/components/project/ProjectHero";
import { ProjectMeta } from "@/components/project/ProjectMeta";
import { ProjectNav } from "@/components/project/ProjectNav";
import { ProjectVideo } from "@/components/project/ProjectVideo";
import { SectionHead } from "@/components/ui/Annotations";
import { HorizontalStrip } from "@/components/ui/HorizontalStrip";
import { ParallaxImage } from "@/components/ui/ParallaxImage";
import { FadeIn, RevealLines } from "@/components/ui/Reveal";
import { site } from "@/config/site";
import { getProjectWithNeighbours, getPublishedProjects } from "@/lib/cms/public";
import { projectJsonLd } from "@/lib/seo";
import { pad } from "@/lib/utils";

type Params = { params: Promise<{ slug: string }> };

/** Published projects are pre-rendered; projects added later in the admin render on first visit. */
export async function generateStaticParams() {
  return (await getPublishedProjects()).map((p) => ({ slug: p.slug }));
}

export const dynamicParams = true;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProjectWithNeighbours(slug);
  if (!data) return {};
  const { project } = data;
  const title = `${project.title} — ${project.typology}`;
  const description =
    project.summary || `${project.title}, a ${project.category.toLowerCase()} project by ${site.name}, New Delhi.`;
  return {
    title,
    description,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      title,
      description,
      url: `/projects/${project.slug}`,
      images: [{ url: project.heroImage.src, alt: project.heroImage.alt }],
    },
    twitter: { card: "summary_large_image", title, description, images: [project.heroImage.src] },
  };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const data = await getProjectWithNeighbours(slug);
  if (!data) notFound();
  const { project, number, total, previous, next, previousNumber, nextNumber } = data;

  const hasApproach = project.approach.length > 0 || (project.approachText?.length ?? 0) > 0;
  const hasDrawings = project.drawings.length > 0;
  const hasVisuals = project.visualizations.length > 0 || project.materials.length > 0;

  // Number only the sections this project actually has, e.g. "02 / 04".
  const sections = [
    project.video && "film",
    hasApproach && "approach",
    hasDrawings && "drawings",
    hasVisuals && "visuals",
    "info",
  ].filter(Boolean) as string[];
  const head = (key: string, label: string, meta?: string): ReactNode => (
    <SectionHead index={sections.indexOf(key) + 1} total={sections.length} label={label} meta={meta} />
  );

  return (
    <article>
      {!project.placeholder && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(projectJsonLd(project)) }}
        />
      )}
      <ProjectHero project={project} number={number} total={total} />

      {project.placeholder && site.showPlaceholderNotices && (
        <div className="frame bg-paper pt-6">
          <p className="label border border-dashed border-ink/30 px-3 py-2 text-concrete">
            [ Placeholder ] This entry demonstrates the project template. Imagery is representative stock photography
            and will be replaced with the studio’s own documentation.
          </p>
        </div>
      )}

      {/* Overview */}
      <section data-theme="light" className="bg-paper pb-24 pt-16 text-ink md:pb-36 md:pt-24">
        <div className="frame grid-12 gap-y-12">
          <FadeIn className="col-span-12 md:col-span-4">
            <ProjectMeta project={project} fields={["category", "location", "year", "status"]} />
          </FadeIn>
          <div className="col-span-12 md:col-span-7 md:col-start-6">
            <p className="label mb-6 text-concrete">Design description</p>
            {project.description.length > 0 ? (
              <>
                <RevealLines as="div" className="font-serif text-title leading-[1.12]" lines={[project.description[0]]} />
                {project.description.slice(1).map((p, i) => (
                  <FadeIn key={i} className="mt-6 max-w-xl text-pretty text-concrete">
                    {p}
                  </FadeIn>
                ))}
              </>
            ) : (
              <p className="font-serif text-title leading-[1.12]">{project.summary}</p>
            )}
          </div>
        </div>
      </section>

      {/* Gallery */}
      {project.gallery.length > 0 && (
        <section data-theme="light" aria-label="Project gallery" className="bg-paper pb-24 text-ink md:pb-36">
          <ProjectGallery items={project.gallery} />
        </section>
      )}

      {/* Film */}
      {project.video && (
        <section data-theme="dark" aria-labelledby="film-heading" className="ink-grid bg-ink py-20 text-paper md:py-32">
          {head("film", "Project film")}
          <div className="frame mt-12 md:mt-16">
            <h2 id="film-heading" className="sr-only">
              Project film
            </h2>
            <ProjectVideo video={project.video} title={project.title} />
          </div>
        </section>
      )}

      {/* Approach */}
      {hasApproach && (
        <section data-theme="light" aria-labelledby="approach-heading" className="bg-bone py-20 text-ink md:py-32">
          {head("approach", "Design approach", project.typology)}
          <div className="frame grid-12 mt-12 gap-y-10 md:mt-16">
            <h2
              id="approach-heading"
              className="col-span-12 text-headline font-medium uppercase condensed md:col-span-4"
            >
              Approach
            </h2>
            {project.approach.length > 0 ? (
              <ol className="col-span-12 grid gap-x-[var(--col-gap)] gap-y-10 md:col-span-8 md:grid-cols-3">
                {project.approach.map((a, i) => (
                  <FadeIn as="li" key={a.title} delay={i * 0.08} className="border-t border-ink/20 pt-4">
                    <span className="label text-concrete">{pad(i + 1)}</span>
                    <h3 className="mt-3 font-serif text-title italic">{a.title}</h3>
                    <p className="mt-3 text-pretty text-concrete">{a.text}</p>
                  </FadeIn>
                ))}
              </ol>
            ) : (
              <div className="col-span-12 md:col-span-7 md:col-start-6">
                {project.approachText!.map((p, i) => (
                  <FadeIn
                    key={i}
                    className={i === 0 ? "font-serif text-lede text-pretty" : "mt-6 max-w-xl text-pretty text-concrete"}
                  >
                    {p}
                  </FadeIn>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Drawings */}
      {hasDrawings && (
        <section data-theme="light" aria-labelledby="drawings-heading" className="bg-paper-deep py-20 text-ink md:py-32">
          {head("drawings", "Architectural drawings", `${pad(project.drawings.length)} sheets`)}
          <div className="frame mt-12 flex items-end justify-between gap-6 md:mt-16">
            <h2 id="drawings-heading" className="text-headline font-medium uppercase condensed">
              Drawings
            </h2>
            <p className="label hidden text-concrete md:block">Drag to browse →</p>
          </div>
          <HorizontalStrip label="Drawing sheets" className="mt-10">
            {project.drawings.map((d) => (
              <DrawingPlate
                key={d.sheet}
                drawing={d}
                projectTitle={project.title}
                className="w-[82vw] shrink-0 snap-start md:w-[40vw] lg:w-[32vw]"
              />
            ))}
          </HorizontalStrip>
        </section>
      )}

      {/* Visualization + materials */}
      {hasVisuals && (
        <section data-theme="light" aria-labelledby="vis-heading" className="bg-paper py-20 text-ink md:py-32">
          {head("visuals", project.materials.length ? "3D visualization & materials" : "3D visualization")}
          <div className="frame grid-12 mt-12 gap-y-14 md:mt-16">
            {project.visualizations.length > 0 && (
              <div className={project.materials.length ? "col-span-12 md:col-span-7" : "col-span-12"}>
                <h2 id="vis-heading" className="text-headline font-medium uppercase condensed">
                  Visualization
                </h2>
                <div className="mt-8 grid gap-[var(--col-gap)] sm:grid-cols-2">
                  {project.visualizations.map((v, i) => (
                    <figure
                      key={`${v.src}-${i}`}
                      className={project.visualizations.length === 1 ? "sm:col-span-2" : ""}
                    >
                      <ParallaxImage
                        asset={v}
                        sizes="(min-width: 768px) 55vw, 100vw"
                        className="aspect-[4/3]"
                        strength={0.05}
                      />
                      <figcaption className="label mt-3 text-concrete">View {pad(i + 1)}</figcaption>
                    </figure>
                  ))}
                </div>
              </div>
            )}

            {project.materials.length > 0 && (
              <div className="col-span-12 md:col-span-4 md:col-start-9">
                <h2 className="text-headline font-medium uppercase condensed">Materials</h2>
                <ul className="mt-8 border-t border-ink/15">
                  {project.materials.map((m) => (
                    <FadeIn as="li" key={m.name} className="flex items-center gap-4 border-b border-ink/15 py-4">
                      <span
                        aria-hidden
                        className="size-12 shrink-0 border border-ink/10"
                        style={{ background: m.tone }}
                      />
                      <span className="flex-1">
                        <span className="block font-serif text-lede">{m.name}</span>
                        {m.note && <span className="label text-concrete">{m.note}</span>}
                      </span>
                    </FadeIn>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Project information */}
      <section data-theme="light" aria-labelledby="info-heading" className="bg-paper py-20 text-ink md:py-32">
        {head("info", "Project information")}
        <div className="frame grid-12 mt-12 gap-y-8 md:mt-16">
          <h2 id="info-heading" className="col-span-12 font-serif text-title italic md:col-span-4">
            {project.title}
          </h2>
          <FadeIn className="col-span-12 md:col-span-6 md:col-start-6">
            <ProjectMeta
              project={project}
              fields={
                project.scope.length
                  ? ["category", "typology", "location", "year", "status", "client", "scope"]
                  : ["category", "location", "year", "status", "client"]
              }
              className="grid-cols-[7.5rem_1fr] gap-y-4"
            />
          </FadeIn>
        </div>
      </section>

      {total > 1 && (
        <ProjectNav previous={previous} next={next} previousNumber={previousNumber} nextNumber={nextNumber} />
      )}
    </article>
  );
}
