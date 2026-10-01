"use client";

import NextImage, { type ImageLoader, type ImageProps } from "next/image";
import type { ImageAsset } from "@/lib/types";

/**
 * Unsplash's CDN resizes on the fly, so placeholder images are requested at
 * exactly the width next/image asks for. Local images (/images/...) fall back
 * to Next's built-in optimizer automatically.
 */
const unsplashLoader: ImageLoader = ({ src, width, quality }) =>
  `${src}?auto=format&fit=max&w=${width}&q=${quality ?? 72}`;

const isUnsplash = (src: string) => src.startsWith("https://images.unsplash.com/");

type ImgProps = Omit<ImageProps, "src" | "alt" | "loader"> & {
  asset: ImageAsset;
  /** Override the asset's alt text (use "" for purely decorative duplicates). */
  alt?: string;
};

export function Img({ asset, alt, style, ...props }: ImgProps) {
  return (
    <NextImage
      src={asset.src}
      alt={alt ?? asset.alt}
      loader={isUnsplash(asset.src) ? unsplashLoader : undefined}
      style={{ objectPosition: asset.position, ...style }}
      {...props}
    />
  );
}
