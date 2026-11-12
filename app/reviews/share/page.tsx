import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FeedbackForm } from "@/components/FeedbackForm";
import { isZoneVisible, getContent, type ShareYourExperience } from "@/lib/content";
import { seoMetadata } from "@/lib/seo";

// The form (components/FeedbackForm.tsx) posts to /api/submit. It stays inert until the
// Turnstile site key is set at build time.

async function loadPage() {
  return getContent().getPage("share-experience");
}

export async function generateMetadata(): Promise<Metadata> {
  return seoMetadata((await loadPage())?.seo);
}

export default async function ShareExperiencePage() {
  const page = await loadPage();
  if (!page) {
    notFound();
  }

  return (
    <>
      <Breadcrumbs items={[{ label: "Reviews", href: "/reviews" }, { label: page.form.heading }]} />
      <div className="wrap pt-[clamp(32px,5vw,64px)] pb-[clamp(48px,6vw,96px)]">
        <div className="grid items-start gap-8 nav:grid-cols-[minmax(0,1fr)_380px] nav:gap-16">
          {isZoneVisible(page.notePanel) && <NotePanel zone={page.notePanel} />}
          <FeedbackForm form={page.form} thankYou={page.thankYou} />
        </div>
      </div>
    </>
  );
}

function NotePanel({ zone }: { zone: ShareYourExperience["notePanel"] }) {
  return (
    <aside
      aria-labelledby="note-heading"
      className="flex flex-col gap-4 bg-cream-light p-7 nav:col-start-2 nav:row-start-1"
    >
      <h2 id="note-heading" className="eyebrow font-body font-bold text-forest-dark">
        {zone.heading}
      </h2>
      <ul className="m-0 flex list-disc flex-col gap-2.5 pl-5 text-[16px]">
        {zone.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      {zone.crisisText && (
        <p className="border-t border-forest pt-3.5 text-[16px]">
          <CrisisText text={zone.crisisText} />
        </p>
      )}
    </aside>
  );
}

/** The crisis line, with 988 and 911 as phone links. */
function CrisisText({ text }: { text: string }) {
  return text.split(/\b(988|911)\b/).map((part, i) =>
    part === "988" || part === "911" ? (
      <a key={i} href={`tel:${part}`}>
        {part}
      </a>
    ) : (
      part
    ),
  );
}
