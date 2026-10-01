"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useSmoothScroll } from "./SmoothScroll";

type Panel = "menu" | "index" | null;

type UIContextValue = {
  panel: Panel;
  open: (panel: Exclude<Panel, null>) => void;
  close: () => void;
};

const UIContext = createContext<UIContextValue | null>(null);

/** Owns the full-screen panels (mobile menu, project index) so only one is open at a time. */
export function UIProvider({ children }: { children: ReactNode }) {
  const [panel, setPanel] = useState<Panel>(null);
  const { lock, unlock } = useSmoothScroll();
  const pathname = usePathname();

  const open = useCallback((p: Exclude<Panel, null>) => setPanel(p), []);
  const close = useCallback(() => setPanel(null), []);

  useEffect(() => {
    if (!panel) return;
    lock();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPanel(null);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      unlock();
    };
  }, [panel, lock, unlock]);

  // While any panel is open, the page behind it is inert; focus returns to the trigger on close.
  const isOpen = panel !== null;
  useEffect(() => {
    if (!isOpen) return;
    const trigger = document.activeElement as HTMLElement | null;
    const background = document.querySelectorAll<HTMLElement>("[data-inert-with-panel]");
    background.forEach((el) => el.setAttribute("inert", ""));
    return () => {
      background.forEach((el) => el.removeAttribute("inert"));
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, [isOpen]);

  // Any route change closes open panels.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setPanel(null);
  }

  const value = useMemo(() => ({ panel, open, close }), [panel, open, close]);
  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used inside UIProvider");
  return ctx;
}
