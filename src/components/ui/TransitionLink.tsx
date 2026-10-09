"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent, RefObject } from "react";
import { useOptionalPageTransition } from "@/components/providers/TransitionProvider";
import type { ImageAsset } from "@/lib/types";

type TransitionLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
  /** Curtain label for the destination. */
  transitionLabel?: string;
  /** When both are set, the referenced image expands into the destination hero. */
  imageRef?: RefObject<HTMLElement | null>;
  image?: ImageAsset;
};

/** A next/link that routes through the page-transition layer. Modifier clicks behave natively. */
export function TransitionLink({ href, transitionLabel, imageRef, image, onClick, ...props }: TransitionLinkProps) {
  const transition = useOptionalPageTransition();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (!transition) return; // outside the public site: plain navigation
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (props.target && props.target !== "_self") return;
    e.preventDefault();
    transition.navigate(href, { label: transitionLabel, fromImage: imageRef?.current, image });
  };

  return <Link href={href} onClick={handleClick} {...props} />;
}
