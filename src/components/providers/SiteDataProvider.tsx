"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { ProjectSummary } from "@/lib/cms/public";

/**
 * Published-project list for site-wide chrome (the INDEX overlay and its
 * count in the header). Loaded once on the server by the site layout.
 */
const SiteDataContext = createContext<{ projects: ProjectSummary[] }>({ projects: [] });

export function SiteDataProvider({ projects, children }: { projects: ProjectSummary[]; children: ReactNode }) {
  return <SiteDataContext.Provider value={{ projects }}>{children}</SiteDataContext.Provider>;
}

export const useSiteProjects = () => useContext(SiteDataContext).projects;
