import Link from "next/link";
import { buttonClass } from "@/components/admin/ui";

export default function AdminNotFound() {
  return (
    <div className="mx-auto flex min-h-[60dvh] max-w-md flex-col items-start justify-center gap-4 px-5">
      <p className="label text-ink/50">Not found</p>
      <h1 className="text-[1.75rem] font-semibold leading-tight">This item no longer exists.</h1>
      <p className="text-[0.9375rem] text-ink/60">It may have been deleted, or the link is out of date.</p>
      <Link href="/admin/projects" className={buttonClass("primary")}>
        Back to projects
      </Link>
    </div>
  );
}
