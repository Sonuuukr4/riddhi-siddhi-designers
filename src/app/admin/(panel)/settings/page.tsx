import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PasswordForm } from "@/components/admin/PasswordForm";
import { Badge, Card, CardHeader, Notice, PageHeader, buttonClass } from "@/components/admin/ui";
import { site } from "@/config/site";
import { requireAdminPage } from "@/lib/auth/session";
import { signOutAction } from "@/lib/cms/actions";
import { MEDIA_BUCKET } from "@/lib/cms/env";
import { IMAGE_MAX_EDGE, MAX_GALLERY_ITEMS, VIDEO_MAX_BYTES, formatBytes } from "@/lib/cms/limits";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await requireAdminPage();
  const local = session.mode === "local";

  return (
    <>
      <PageHeader eyebrow="Studio" title="Settings" />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Account" />
          <div className="flex flex-col gap-5 p-5">
            <dl className="grid grid-cols-[8rem_1fr] gap-y-2 text-sm">
              <dt className="text-ink/55">Signed in as</dt>
              <dd className="truncate font-medium">{local ? "Local preview admin" : session.email}</dd>
              <dt className="text-ink/55">Sign-in method</dt>
              <dd>{local ? "Password from .env.local" : "Supabase Auth (email & password)"}</dd>
            </dl>
            {local ? (
              <Notice>
                In local preview mode the password is set by <code className="font-mono text-[0.75rem]">LOCAL_ADMIN_PASSWORD</code>{" "}
                in <code className="font-mono text-[0.75rem]">.env.local</code>.
              </Notice>
            ) : (
              <div className="border-t border-ink/10 pt-5">
                <h3 className="mb-4 text-sm font-semibold">Change password</h3>
                <PasswordForm />
              </div>
            )}
            <form action={signOutAction} className="border-t border-ink/10 pt-5">
              <button type="submit" className={buttonClass("secondary")}>
                Sign out
              </button>
            </form>
          </div>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Content & media" />
            <dl className="grid grid-cols-[9rem_1fr] gap-y-2.5 p-5 text-sm">
              <dt className="text-ink/55">Database</dt>
              <dd>
                {local ? (
                  <Badge tone="demo">Local preview</Badge>
                ) : (
                  <Badge tone="published">Supabase connected</Badge>
                )}
              </dd>
              <dt className="text-ink/55">Media storage</dt>
              <dd>{local ? ".data/uploads on this computer" : `Supabase Storage · ${MEDIA_BUCKET}`}</dd>
              <dt className="text-ink/55">Images</dt>
              <dd>Resized to {IMAGE_MAX_EDGE} px, saved as WebP · up to {MAX_GALLERY_ITEMS} per project</dd>
              <dt className="text-ink/55">Videos</dt>
              <dd>MP4, WebM or MOV up to {formatBytes(VIDEO_MAX_BYTES)}, or a YouTube / Vimeo link</dd>
              <dt className="text-ink/55">Publishing</dt>
              <dd>Changes appear on the website immediately after saving.</dd>
            </dl>
          </Card>

          <Card>
            <CardHeader
              title="Contact & social links"
              description="Used by the call, WhatsApp and social buttons across the website."
            />
            <dl className="grid grid-cols-[7rem_1fr] gap-y-2.5 p-5 text-sm">
              <ContactRow label="Phone" value={site.phone.display} href={site.phone.href} />
              <ContactRow label="WhatsApp" value={`+${site.whatsapp.number}`} href={site.whatsapp.href} />
              <ContactRow label="Instagram" value={site.social.instagram} href={site.social.instagram} />
              <ContactRow label="Facebook" value={site.social.facebook} href={site.social.facebook} />
              <ContactRow label="Email" value={site.email} href={site.email ? `mailto:${site.email}` : null} />
            </dl>
            <p className="border-t border-ink/10 px-5 py-4 text-[0.8125rem] leading-relaxed text-ink/55">
              These details are kept in the website&apos;s configuration file (
              <code className="font-mono text-[0.75rem]">src/config/site.ts</code>) so they cannot be changed by
              accident. Send new profile links to your developer. Links that are not set yet stay hidden on the site.
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}

function ContactRow({ label, value, href }: { label: string; value: string | null; href: string | null }) {
  let content: ReactNode = <span className="text-ink/45">Not set yet</span>;
  if (value && href)
    content = (
      <a href={href} target="_blank" rel="noreferrer" className="truncate underline-offset-4 hover:underline">
        {value}
      </a>
    );
  return (
    <>
      <dt className="text-ink/55">{label}</dt>
      <dd className="min-w-0 truncate">{content}</dd>
    </>
  );
}
