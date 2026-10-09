"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * The selected portfolio category lives in the URL (?category=slug), so a
 * filtered view can be shared or bookmarked. Reading it through
 * useSyncExternalStore keeps server and first client render identical
 * ("all"), then switches to the URL's value straight after hydration.
 */
const EVENT = "rsd:category";

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

const read = () => new URLSearchParams(window.location.search).get("category");

export function useCategoryParam(): [string | null, (slug: string | null) => void] {
  const value = useSyncExternalStore(subscribe, read, () => null);

  const set = useCallback((slug: string | null) => {
    const url = new URL(window.location.href);
    if (slug) url.searchParams.set("category", slug);
    else url.searchParams.delete("category");
    window.history.replaceState(window.history.state, "", url);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return [value, set];
}
