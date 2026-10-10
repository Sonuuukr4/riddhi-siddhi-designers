import type { ComponentType } from "react";
import {
  FacebookGlyph,
  InstagramGlyph,
  PhoneGlyph,
  WhatsAppGlyph,
  type GlyphProps,
} from "@/components/ui/SocialGlyphs";
import { site } from "@/config/site";
import { cn, pad } from "@/lib/utils";

export type ContactActionKey = "call" | "whatsapp" | "instagram" | "facebook";

export type ContactAction = {
  key: ContactActionKey;
  label: string;
  /** What the action reaches: the number, a prompt or the profile handle. */
  value: string;
  /** `null` only for a social profile not yet configured (shown in development). */
  href: string | null;
  external: boolean;
  /** Full accessible name, e.g. "Call Riddhi Siddhi Designers on 098117 63839". */
  ariaLabel: string;
  Glyph: ComponentType<GlyphProps>;
};

const ALL: ContactActionKey[] = ["call", "whatsapp", "instagram", "facebook"];

/**
 * An unconfigured social profile is never published as a link: production
 * omits it, development shows a quiet "link pending" note so it is not forgotten.
 */
const SHOW_PENDING = process.env.NODE_ENV !== "production";

/** "@handle" for Instagram, the page name for Facebook — read from the configured URL. */
function profileName(url: string, key: "instagram" | "facebook") {
  try {
    const first = new URL(url).pathname.split("/").filter(Boolean)[0];
    if (first && !first.includes(".")) return key === "instagram" ? `@${first}` : first;
  } catch {
    // Fall through to the generic label.
  }
  return "View profile";
}

function socialAction(
  key: "instagram" | "facebook",
  label: string,
  Glyph: ComponentType<GlyphProps>,
): ContactAction | null {
  const href = site.social[key];
  if (!href && !SHOW_PENDING) return null;
  return {
    key,
    label,
    value: href ? profileName(href, key) : "Link pending",
    href,
    external: true,
    ariaLabel: `Follow ${site.name} on ${label} (opens in a new tab)`,
    Glyph,
  };
}

/**
 * The studio's direct channels, read from src/config/site.ts.
 * `whatsappMessage` opens the chat with a polite, editable first line.
 */
export function getContactActions(include: ContactActionKey[] = ALL, { whatsappMessage = true } = {}) {
  const actions: Record<ContactActionKey, ContactAction | null> = {
    call: {
      key: "call",
      label: "Call",
      value: site.phone.display,
      href: site.phone.href,
      external: false,
      ariaLabel: `Call ${site.name} on ${site.phone.display}`,
      Glyph: PhoneGlyph,
    },
    whatsapp: {
      key: "whatsapp",
      label: "WhatsApp",
      value: "Send a message",
      href: whatsappMessage ? site.whatsapp.hrefWithMessage : site.whatsapp.href,
      external: true,
      ariaLabel: `Chat with ${site.name} on WhatsApp (opens in a new tab)`,
      Glyph: WhatsAppGlyph,
    },
    instagram: socialAction("instagram", "Instagram", InstagramGlyph),
    facebook: socialAction("facebook", "Facebook", FacebookGlyph),
  };
  return include.map((key) => actions[key]).filter((a): a is ContactAction => a !== null);
}

/** Anchor attributes for an action: tel: stays in the tab, everything else opens a new one. */
function linkProps(action: ContactAction & { href: string }) {
  return {
    href: action.href,
    "aria-label": action.ariaLabel,
    ...(action.external ? { target: "_blank", rel: "noopener noreferrer" } : {}),
  };
}

const isLive = (a: ContactAction): a is ContactAction & { href: string } => a.href !== null;
const arrowFor = (a: ContactAction) => (a.external ? "↗" : "→");

/** Development-only stand-in for a profile that has no URL yet. Never a link. */
function Pending({ action, className }: { action: ContactAction; className?: string }) {
  return (
    <span
      className={cn("inline-flex items-center gap-2 opacity-45", className)}
      title={`Add the ${action.label} URL to SOCIAL_LINKS in src/config/site.ts — hidden in production until then.`}
    >
      <action.Glyph className="size-3.5" />
      <span>{action.label} — link pending</span>
    </span>
  );
}

type Variant = "inline" | "compact" | "stacked" | "tiles" | "bar";

type ContactActionsProps = {
  /**
   * - `inline`  — small mono text links (footer, captions)
   * - `compact` — glyph buttons for the header bar; labels join them from 1360px
   * - `stacked` — large numbered rows, the "direct lines" of the contact section
   * - `tiles`   — call and WhatsApp as two large tiles, social links beneath (mobile menu)
   * - `bar`     — equal-width cells for the fixed mobile action bar
   */
  variant?: Variant;
  /** Which channels to show, in order. Defaults to all four. */
  include?: ContactActionKey[];
  /** `inline` only: lay links out in a row (default) or a column. */
  direction?: "row" | "column";
  /** Use the WhatsApp link with a prefilled first message (default true). */
  whatsappMessage?: boolean;
  className?: string;
};

/**
 * Call, WhatsApp, Instagram and Facebook — rendered from one source in the
 * register each context needs. Colour is inherited, so every variant works
 * on ink and on paper.
 */
export function ContactActions({
  variant = "inline",
  include,
  direction = "row",
  whatsappMessage = true,
  className,
}: ContactActionsProps) {
  const actions = getContactActions(include, { whatsappMessage });
  if (!actions.length) return null;

  switch (variant) {
    case "compact":
      return (
        <ul aria-label="Contact the studio" className={cn("flex items-center", className)}>
          {actions.map((a, i) => (
            <li key={a.key} className="flex items-center">
              {i > 0 && <span aria-hidden className="mx-1 h-3.5 w-px bg-current opacity-25 min-[1360px]:mx-3" />}
              {isLive(a) ? (
                <a
                  {...linkProps(a)}
                  className="group relative flex h-9 min-w-9 items-center justify-center gap-2 min-[1360px]:min-w-0"
                >
                  <a.Glyph className="size-4" />
                  <span className="caps hidden min-[1360px]:inline">{a.label}</span>
                  {/* Glyph-only below 1360px: the label surfaces as an annotation on hover and focus. */}
                  <span
                    aria-hidden
                    className="label pointer-events-none absolute left-1/2 top-full -translate-x-1/2 whitespace-nowrap text-[0.5625rem] opacity-0 transition-opacity duration-300 group-hover:opacity-70 group-focus-visible:opacity-70 min-[1360px]:hidden"
                  >
                    {a.label}
                  </span>
                </a>
              ) : (
                <Pending action={a} className="label text-[0.5625rem]" />
              )}
            </li>
          ))}
        </ul>
      );

    case "stacked":
      return (
        <ul className={cn("@container border-t border-current/15", className)}>
          {actions.map((a, i) => {
            const row =
              "grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-3 py-5 @2xl:grid-cols-[3rem_minmax(0,11rem)_minmax(0,1fr)_auto] @2xl:gap-x-6 @2xl:py-7";
            const index = <span className="label self-center opacity-50">{pad(i + 1)}</span>;
            const name = (
              <span className="caps flex items-center gap-3">
                <a.Glyph className="size-5" />
                {a.label}
              </span>
            );
            // Long values (an Instagram handle) step down a size in narrow columns so they never overflow a phone screen.
            const valueClass = cn(
              "col-span-2 col-start-2 row-start-2 min-w-0 font-light tabular-nums [overflow-wrap:anywhere] @2xl:col-span-1 @2xl:col-start-3 @2xl:row-start-1",
              a.value.length > 16 ? "text-lede @md:text-title" : "text-title",
            );
            return (
              <li key={a.key} className="border-b border-current/15">
                {isLive(a) ? (
                  <a {...linkProps(a)} className={cn("group", row)}>
                    {index}
                    {name}
                    <span
                      className={cn(
                        valueClass,
                        "block transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:translate-x-2",
                      )}
                    >
                      {a.value}
                    </span>
                    <span
                      aria-hidden
                      className="col-start-3 row-start-1 grid size-11 place-items-center rounded-full border border-current/30 text-lg transition-[border-color,translate] duration-500 group-hover:translate-x-1 group-hover:border-current @2xl:col-start-4 @2xl:size-14 @2xl:text-xl"
                    >
                      {arrowFor(a)}
                    </span>
                  </a>
                ) : (
                  <div className={cn(row, "opacity-45")}>
                    {index}
                    {name}
                    <span className={valueClass}>{a.value}</span>
                    <span className="label col-start-3 row-start-1 @2xl:col-start-4">Hidden in production</span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      );

    case "tiles": {
      const primary = actions.filter((a) => a.key === "call" || a.key === "whatsapp");
      const secondary = actions.filter((a) => a.key !== "call" && a.key !== "whatsapp");
      return (
        <div className={cn("flex flex-col gap-5", className)}>
          {primary.length > 0 && (
            <ul aria-label="Contact the studio" className="grid auto-cols-fr grid-flow-col gap-2">
              {primary.filter(isLive).map((a) => (
                <li key={a.key}>
                  <a
                    {...linkProps(a)}
                    className="group flex h-full min-h-[5.75rem] flex-col justify-between gap-4 border border-current/25 p-4 transition-colors duration-500 hover:border-current active:bg-current/10"
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="label flex items-center gap-2">
                        <a.Glyph className="size-[1.125rem]" />
                        {a.label}
                      </span>
                      <span aria-hidden className="opacity-70">
                        {arrowFor(a)}
                      </span>
                    </span>
                    <span className="text-[1.125rem] font-light leading-tight tabular-nums text-balance">
                      {a.value}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
          {secondary.length > 0 && (
            <ul aria-label="Social" className="flex flex-wrap gap-x-6 gap-y-2">
              {secondary.map((a) => (
                <li key={a.key}>
                  {isLive(a) ? (
                    <a {...linkProps(a)} className="caps flex items-center gap-2 py-2">
                      <a.Glyph className="size-4" />
                      {a.label}
                      <span aria-hidden className="opacity-60">
                        ↗
                      </span>
                    </a>
                  ) : (
                    <Pending action={a} className="label py-2" />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    }

    case "bar":
      return (
        <ul className={cn("grid auto-cols-fr grid-flow-col", className)}>
          {actions.filter(isLive).map((a, i) => (
            <li key={a.key} className={cn(i > 0 && "border-l border-current/15")}>
              <a
                {...linkProps(a)}
                className="label flex min-h-14 items-center justify-center gap-2.5 text-[0.75rem] transition-colors focus-visible:outline-offset-[-6px] active:bg-current/10"
              >
                <a.Glyph className="size-[1.125rem]" />
                {a.label}
                {a.external && (
                  <span aria-hidden className="opacity-50">
                    ↗
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>
      );

    default:
      return (
        <ul
          className={cn(
            "label flex",
            direction === "column" ? "flex-col items-start gap-1.5" : "flex-wrap items-center gap-x-6 gap-y-2",
            className,
          )}
        >
          {actions.map((a) => (
            <li key={a.key}>
              {isLive(a) ? (
                <a
                  {...linkProps(a)}
                  className="group inline-flex items-center gap-2 py-1.5 opacity-80 transition-opacity hover:opacity-100 focus-visible:opacity-100 lg:py-0"
                >
                  <a.Glyph className="size-3.5" />
                  <span className="tabular-nums">{a.key === "call" ? a.value : a.label}</span>
                  {a.external && (
                    <span
                      aria-hidden
                      className="transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    >
                      ↗
                    </span>
                  )}
                </a>
              ) : (
                <Pending action={a} />
              )}
            </li>
          ))}
        </ul>
      );
  }
}
