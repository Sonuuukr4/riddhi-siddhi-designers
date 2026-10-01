"use client";

import { AnimatePresence, motion } from "motion/react";
import { useId, useState, type FormEvent, type ReactNode } from "react";
import { contact } from "@/content/studio";
import { site } from "@/content/site";
import { validateEnquiry, type EnquiryErrors } from "@/lib/enquiry";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Status = "idle" | "sending" | "sent" | "unavailable" | "failed";

/** Minimal enquiry form: underlined fields, a row of project-type chips, one clear action. */
export function EnquiryForm({ id }: { id?: string }) {
  const uid = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [projectType, setProjectType] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const raw = Object.fromEntries(new FormData(form).entries());
    const { errors: found } = validateEnquiry({ ...raw, projectType });
    setErrors(found);
    if (Object.keys(found).length) {
      const first = Object.keys(found)[0];
      form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...raw, projectType }),
      });
      if (res.ok) {
        setStatus("sent");
        form.reset();
        setProjectType("");
      } else {
        setStatus(res.status === 503 ? "unavailable" : "failed");
      }
    } catch {
      setStatus("failed");
    }
  }

  const field = (name: "name" | "phone" | "email" | "location", label: string, props: Record<string, unknown> = {}) => (
    <Field id={`${uid}-${name}`} label={label} error={errors[name]}>
      <input
        id={`${uid}-${name}`}
        name={name}
        aria-invalid={!!errors[name]}
        aria-describedby={errors[name] ? `${uid}-${name}-error` : undefined}
        className="w-full border-0 border-b border-paper/25 bg-transparent py-3 text-lede text-paper outline-none transition-colors placeholder:text-paper/45 focus:border-paper"
        {...props}
      />
    </Field>
  );

  return (
    <form id={id} onSubmit={onSubmit} noValidate className="relative">
      <div className="grid gap-x-[var(--col-gap)] gap-y-8 md:grid-cols-2">
        {field("name", "Name", { autoComplete: "name", required: true })}
        {field("phone", "Phone", { type: "tel", autoComplete: "tel", inputMode: "tel", required: true })}
        {field("email", "Email (optional)", { type: "email", autoComplete: "email" })}
        {field("location", "Project location", { autoComplete: "off", placeholder: "e.g. West Delhi" })}
      </div>

      <fieldset className="mt-10">
        <legend className="label mb-4 text-paper/60">Project type</legend>
        <div className="flex flex-wrap gap-2">
          {contact.projectTypes.map((t) => {
            const checked = projectType === t;
            return (
              <label
                key={t}
                className={cn(
                  "label cursor-pointer border px-3 py-2.5 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-1 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-paper",
                  checked ? "border-paper bg-paper text-ink" : "border-paper/25 text-paper/75 hover:border-paper/60",
                )}
              >
                <input
                  type="radio"
                  name="projectType"
                  value={t}
                  checked={checked}
                  onChange={() => setProjectType(t)}
                  className="sr-only"
                />
                {t}
              </label>
            );
          })}
        </div>
      </fieldset>

      <Field id={`${uid}-message`} label="Message" className="mt-10">
        <textarea
          id={`${uid}-message`}
          name="message"
          rows={3}
          className="w-full resize-none border-0 border-b border-paper/25 bg-transparent py-3 text-lede text-paper outline-none transition-colors placeholder:text-paper/45 focus:border-paper"
          placeholder="A few lines about the site, the brief, the timeline…"
        />
      </Field>

      {/* Honeypot */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Company
          <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-6">
        <button
          type="submit"
          disabled={status === "sending"}
          className="group flex items-center gap-4 bg-paper px-6 py-4 text-ink transition-colors hover:bg-sand disabled:opacity-60"
        >
          <span className="caps">{status === "sending" ? "Sending…" : "Send enquiry"}</span>
          <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-1">
            →
          </span>
        </button>
        <p className="label text-paper/60">Or call {site.phone.display}</p>
      </div>

      <div aria-live="polite" className="mt-6 min-h-[3rem]">
        <AnimatePresence mode="wait">
          {status !== "idle" && status !== "sending" && (
            <motion.p
              key={status}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: ease.out }}
              className={cn("max-w-lg text-pretty", status === "sent" ? "text-paper" : "text-sand")}
            >
              {status === "sent" && "Thank you — your enquiry has reached the studio. We will be in touch."}
              {status === "unavailable" && (
                <>
                  Online enquiries are not connected yet. Please call the studio on{" "}
                  <a href={site.phone.href} className="underline underline-offset-4">
                    {site.phone.display}
                  </a>
                  .
                </>
              )}
              {status === "failed" && (
                <>
                  Something went wrong sending your enquiry. Please try again, or call{" "}
                  <a href={site.phone.href} className="underline underline-offset-4">
                    {site.phone.display}
                  </a>
                  .
                </>
              )}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  className,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="label block text-paper/60">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="label mt-2 text-sand">
          {error}
        </p>
      )}
    </div>
  );
}
