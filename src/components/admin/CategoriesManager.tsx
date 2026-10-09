"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteCategoryAction, saveCategoryAction } from "@/lib/cms/actions";
import type { CmsCategory } from "@/lib/cms/types";
import { categoryInputSchema, fieldErrors as toFieldErrors, slugify } from "@/lib/cms/validation";
import { cn } from "@/lib/utils";
import { ConfirmDialog, useToast } from "./feedback";
import { Button, Field, inputClass } from "./ui";

export function CategoriesManager({ categories }: { categories: CmsCategory[] }) {
  const router = useRouter();
  const toast = useToast();
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [deleting, setDeleting] = useState<CmsCategory | null>(null);
  const [reassignTo, setReassignTo] = useState("");
  const [isDeleting, startDeleting] = useTransition();

  const others = deleting ? categories.filter((c) => c.id !== deleting.id) : [];
  const needsReassign = Boolean(deleting && deleting.projectCount > 0);

  const confirmDelete = () => {
    const target = deleting;
    if (!target) return;
    startDeleting(async () => {
      const res = await deleteCategoryAction(target.id, needsReassign ? reassignTo : null);
      if (!res.ok) return toast(res.error, "error");
      setDeleting(null);
      toast(`Deleted “${target.name}”.`);
      router.refresh();
    });
  };

  return (
    <>
      <div className="mb-4 flex justify-end">
        {editing !== "new" && (
          <Button tone="primary" onClick={() => setEditing("new")}>
            <Plus className="size-4" aria-hidden />
            New category
          </Button>
        )}
      </div>

      {editing === "new" && (
        <div className="mb-4 rounded-[4px] border border-ink/20 bg-white p-5">
          <h2 className="mb-4 text-[0.9375rem] font-semibold">New category</h2>
          <CategoryEditor
            category={null}
            nextOrder={(categories.at(-1)?.sortOrder ?? 0) + 10}
            onCancel={() => setEditing(null)}
            onSaved={(c) => {
              setEditing(null);
              toast(`Added “${c.name}”.`);
              router.refresh();
            }}
          />
        </div>
      )}

      <ul className="overflow-hidden rounded-[4px] border border-ink/10 bg-white">
        {categories.length === 0 && (
          <li className="px-5 py-12 text-center text-sm text-ink/55">No categories yet.</li>
        )}
        {categories.map((c) => (
          <li key={c.id} className="border-b border-ink/8 last:border-b-0">
            {editing === c.id ? (
              <div className="bg-bone/60 p-5">
                <CategoryEditor
                  category={c}
                  nextOrder={c.sortOrder}
                  onCancel={() => setEditing(null)}
                  onSaved={(saved) => {
                    setEditing(null);
                    toast(`Saved “${saved.name}”.`);
                    router.refresh();
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center gap-4 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{c.name}</p>
                  <p className="truncate text-[0.8125rem] text-ink/55">
                    <span className="font-mono text-[0.75rem]">/portfolio?category={c.slug}</span>
                    {c.description && <> · {c.description}</>}
                  </p>
                </div>
                <p className="hidden w-24 text-right text-[0.8125rem] tabular-nums text-ink/55 sm:block">
                  {c.projectCount} {c.projectCount === 1 ? "project" : "projects"}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setEditing(c.id)}
                    className="flex size-10 items-center justify-center rounded-[3px] text-ink/55 hover:bg-ink/5 hover:text-ink"
                    aria-label={`Edit ${c.name}`}
                    title="Edit"
                  >
                    <Pencil className="size-[18px]" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReassignTo("");
                      setDeleting(c);
                    }}
                    className="flex size-10 items-center justify-center rounded-[3px] text-ink/55 hover:bg-ink/5 hover:text-terra"
                    aria-label={`Delete ${c.name}`}
                    title="Delete"
                  >
                    <Trash2 className="size-[18px]" aria-hidden />
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={Boolean(deleting)}
        title={`Delete “${deleting?.name ?? ""}”?`}
        confirmLabel={needsReassign ? "Move projects & delete" : "Delete category"}
        busy={isDeleting}
        confirmDisabled={needsReassign && !reassignTo}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      >
        {!needsReassign ? (
          <p>No projects use this category. It will be removed from the portfolio filters.</p>
        ) : others.length === 0 ? (
          <p>
            {deleting?.projectCount} project{deleting?.projectCount === 1 ? " uses" : "s use"} this category, and there is
            no other category to move {deleting?.projectCount === 1 ? "it" : "them"} to. Create another category first.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            <p>
              {deleting?.projectCount} project{deleting?.projectCount === 1 ? " uses" : "s use"} this category. Choose where
              to move {deleting?.projectCount === 1 ? "it" : "them"} — no project will be deleted.
            </p>
            <label className="sr-only" htmlFor="reassign">
              Move projects to
            </label>
            <select id="reassign" value={reassignTo} onChange={(e) => setReassignTo(e.target.value)} className={inputClass}>
              <option value="">Move projects to…</option>
              {others.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </ConfirmDialog>
    </>
  );
}

function CategoryEditor({
  category,
  nextOrder,
  onCancel,
  onSaved,
}: {
  category: CmsCategory | null;
  nextOrder: number;
  onCancel: () => void;
  onSaved: (c: CmsCategory) => void;
}) {
  const toast = useToast();
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [slugAuto, setSlugAuto] = useState(!category);
  const [description, setDescription] = useState(category?.description ?? "");
  const [sortOrder, setSortOrder] = useState(String(category?.sortOrder ?? nextOrder));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, startSaving] = useTransition();
  const idp = category?.id ?? "new";

  const submit = () => {
    const input = { name, slug, description, sortOrder: Number.parseInt(sortOrder, 10) || 0 };
    const parsed = categoryInputSchema.safeParse(input);
    if (!parsed.success) return setErrors(toFieldErrors(parsed.error));
    startSaving(async () => {
      const res = await saveCategoryAction(input, category?.id ?? null);
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        toast(res.error, "error");
        return;
      }
      onSaved(res.data);
    });
  };

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_7rem]"
    >
      <Field label="Name" htmlFor={`c-name-${idp}`} required error={errors.name}>
        <input
          id={`c-name-${idp}`}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (slugAuto) setSlug(slugify(e.target.value));
          }}
          maxLength={60}
          autoFocus
          aria-invalid={Boolean(errors.name)}
          className={inputClass}
        />
      </Field>
      <Field
        label="Web address"
        htmlFor={`c-slug-${idp}`}
        required
        error={errors.slug}
        hint={category ? "Changing it updates the portfolio filter link." : "Filled in from the name."}
      >
        <input
          id={`c-slug-${idp}`}
          value={slug}
          onChange={(e) => {
            setSlugAuto(false);
            setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
          }}
          maxLength={80}
          spellCheck={false}
          aria-invalid={Boolean(errors.slug)}
          className={cn(inputClass, "font-mono text-[0.8125rem]")}
        />
      </Field>
      <Field label="Order" htmlFor={`c-order-${idp}`} error={errors.sortOrder}>
        <input
          id={`c-order-${idp}`}
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          step={1}
          className={inputClass}
        />
      </Field>
      <Field
        label="Description"
        htmlFor={`c-desc-${idp}`}
        error={errors.description}
        hint="Optional, for your reference."
        className="sm:col-span-3"
      >
        <input
          id={`c-desc-${idp}`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={300}
          className={inputClass}
        />
      </Field>
      <div className="flex gap-2 sm:col-span-3">
        <Button type="submit" tone="primary" disabled={isSaving}>
          {isSaving ? "Saving…" : category ? "Save category" : "Add category"}
        </Button>
        <Button tone="ghost" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
