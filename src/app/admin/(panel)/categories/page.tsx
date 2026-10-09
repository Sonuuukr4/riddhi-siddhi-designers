import type { Metadata } from "next";
import { CategoriesManager } from "@/components/admin/CategoriesManager";
import { PageHeader } from "@/components/admin/ui";
import { getAdminCategories } from "@/lib/cms/admin-queries";

export const metadata: Metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const categories = await getAdminCategories();
  return (
    <>
      <PageHeader
        eyebrow="Content"
        title="Categories"
        description="Categories become the filters on the portfolio page. Only categories with published projects are shown to visitors."
      />
      <CategoriesManager categories={categories} />
    </>
  );
}
