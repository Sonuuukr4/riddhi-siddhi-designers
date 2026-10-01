import type { Project } from "@/lib/types";
import { cn, orDash } from "@/lib/utils";

/** Facts table — label / value pairs in the drawing-sheet voice. Missing facts render as "—". */
export function ProjectMeta({
  project,
  className,
  fields = ["category", "location", "status"],
  tone = "light",
}: {
  project: Project;
  className?: string;
  fields?: Array<"category" | "typology" | "location" | "year" | "status" | "client" | "scope">;
  tone?: "light" | "dark";
}) {
  const values: Record<string, string> = {
    category: project.category,
    typology: project.typology,
    location: orDash(project.location),
    year: orDash(project.year),
    status: project.placeholder ? "Placeholder entry" : orDash(project.status),
    client: orDash(project.client),
    scope: project.scope.join(", "),
  };
  const labels: Record<string, string> = {
    category: "Category",
    typology: "Typology",
    location: "Location",
    year: "Year",
    status: "Status",
    client: "Client",
    scope: "Scope",
  };

  return (
    <dl className={cn("label grid grid-cols-[6.5rem_1fr] gap-y-2", className)}>
      {fields.map((f) => (
        <div key={f} className="contents">
          <dt className={tone === "dark" ? "text-paper/60" : "text-concrete"}>{labels[f]}</dt>
          <dd>{values[f]}</dd>
        </div>
      ))}
    </dl>
  );
}
