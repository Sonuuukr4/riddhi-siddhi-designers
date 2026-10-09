"use client";

import { useState } from "react";
import { Img } from "@/components/ui/Img";
import type { ProjectVideo as Video } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Project film. Nothing heavy loads until the visitor presses play: uploaded
 * files use preload="none" behind a poster, and YouTube / Vimeo players are
 * only embedded after the click (privacy-friendly domains, no autoplay on load).
 */
export function ProjectVideo({ video, title, className }: { video: Video; title: string; className?: string }) {
  const [playing, setPlaying] = useState(false);
  const label = `Play film: ${title}`;

  return (
    <div className={cn("relative aspect-video w-full overflow-hidden bg-ink", className)}>
      {playing ? (
        video.kind === "file" ? (
          <video
            className="absolute inset-0 h-full w-full bg-ink object-contain"
            src={video.url}
            poster={video.poster}
            controls
            autoPlay
            playsInline
            preload="metadata"
          >
            <track kind="captions" />
          </video>
        ) : (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`${video.embedUrl}${video.embedUrl?.includes("?") ? "&" : "?"}autoplay=1`}
            title={`${title} — film`}
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            loading="lazy"
          />
        )
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={label}
          data-cursor="project"
          data-cursor-label="Play"
          className="group absolute inset-0 block h-full w-full text-left"
        >
          {video.poster ? (
            <Img
              asset={{ src: video.poster, alt: "" }}
              fill
              sizes="(min-width: 1024px) 80vw, 100vw"
              className="tone object-cover transition-transform duration-[1.6s] ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
            />
          ) : (
            <span className="ink-grid absolute inset-0" />
          )}
          <span className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-ink/20" />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="grid size-20 place-items-center rounded-full border border-paper/70 bg-ink/40 text-paper backdrop-blur-sm transition-transform duration-500 group-hover:scale-110 md:size-24">
              <svg aria-hidden viewBox="0 0 24 24" className="ml-1 size-7" fill="currentColor">
                <path d="M8 5.5v13l11-6.5z" />
              </svg>
            </span>
          </span>
          <span className="label absolute bottom-4 left-4 text-paper/85 md:bottom-6 md:left-6">
            Film — {video.kind === "file" ? "Play" : video.kind === "youtube" ? "YouTube" : "Vimeo"}
          </span>
        </button>
      )}
    </div>
  );
}
