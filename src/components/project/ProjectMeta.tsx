import type { Project } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Facts table — label / value pairs in the drawing-sheet voice. Facts that are not known are left out, never invented. */
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
  const values: Record<string, string | null | undefined> = {
    category: project.category,
    typology: project.typology,
    location: project.location,
    year: project.year,
    status: project.status,
    client: project.client,
    scope: project.scope.join(", "),
  };
  const shown = fields.filter((f) => values[f]?.trim());
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
      {shown.map((f) => (
        <div key={f} className="contents">
          <dt className={tone === "dark" ? "text-paper/60" : "text-concrete"}>{labels[f]}</dt>
          <dd>{values[f]}</dd>
        </div>
      ))}
    </dl>
  );
}
