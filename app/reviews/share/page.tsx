import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isZoneVisible, getContent, type ShareYourExperience } from "@/lib/content";
import { seoMetadata } from "@/lib/seo";

// The form does not send anything yet. Sending (the API route, spam checks and storage)
// comes with the forms integration phase, so the submit button does nothing for now,
// and the thank-you and error copy in the CMS is not shown yet.

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
    <div className="wrap pt-[clamp(32px,5vw,64px)] pb-[clamp(48px,6vw,96px)]">
      <div className="grid items-start gap-8 nav:grid-cols-[minmax(0,1fr)_380px] nav:gap-16">
        {isZoneVisible(page.notePanel) && <NotePanel zone={page.notePanel} />}
        <FeedbackForm zone={page.form} />
      </div>
    </div>
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

const field = "flex flex-col gap-1.5";
const label = "text-[16px] font-bold";
const input = "min-h-13 w-full border-[1.5px] border-forest bg-linen px-3.5 py-2.5 text-[17px] text-forest-dark";
const textarea = `${input} min-h-30 resize-y leading-[1.6]`;
const option =
  "flex min-h-14 cursor-pointer items-center gap-3 border-[1.5px] border-forest px-4 py-2.5 leading-[1.3] has-checked:border-2 has-checked:border-forest-dark has-checked:bg-cream-light has-focus-visible:outline-3 has-focus-visible:outline-offset-3 has-focus-visible:outline-forest-dark";
const control = "size-5 flex-none accent-forest-dark focus-visible:outline-none";

function FeedbackForm({ zone }: { zone: ShareYourExperience["form"] }) {
  const { labels } = zone;
  const required = <span className="font-normal text-forest">{labels.requiredMark}</span>;
  return (
    <section aria-labelledby="feedback-heading" className="flex max-w-[640px] flex-col gap-7 nav:col-start-1 nav:row-start-1">
      <div className="flex flex-col gap-2">
        <p className="eyebrow">{zone.eyebrow}</p>
        <h1 id="feedback-heading" className="text-h2">
          {zone.heading}
        </h1>
        {zone.intro && <p>{zone.intro}</p>}
      </div>
      <form className="flex flex-col gap-7" noValidate>
        <div className={field}>
          <label htmlFor="fb-name" className={label}>
            {labels.name} {required}
          </label>
          <input id="fb-name" name="name" type="text" autoComplete="name" required className={input} />
        </div>
        <div className={field}>
          <label htmlFor="fb-email" className={label}>
            {labels.email} {required}
          </label>
          <input id="fb-email" name="email" type="email" autoComplete="email" required className={input} />
        </div>
        <div className={field}>
          <label htmlFor="fb-phone" className={label}>
            {labels.phone}
          </label>
          <input id="fb-phone" name="phone" type="tel" autoComplete="tel" className={input} />
        </div>
        <RadioGroup
          legend={labels.ratingLegend}
          name="rating"
          options={[
            ["excellent", labels.ratingOptions.excellent],
            ["good", labels.ratingOptions.good],
            ["disappointing", labels.ratingOptions.disappointing],
          ]}
        />
        <div className={field}>
          <label htmlFor="fb-best" className={label}>
            {labels.likedBest}
          </label>
          <textarea id="fb-best" name="likedBest" className={textarea} />
        </div>
        <div className={field}>
          <label htmlFor="fb-improve" className={label}>
            {labels.improve}
          </label>
          <textarea id="fb-improve" name="improve" className={textarea} />
        </div>
        <RadioGroup
          legend={labels.recommendLegend}
          name="recommend"
          options={[
            ["yes", labels.recommendOptions.yes],
            ["no", labels.recommendOptions.no],
          ]}
        />
        <div className={field}>
          <label htmlFor="fb-more" className={label}>
            {labels.anythingElse}
          </label>
          <textarea id="fb-more" name="anythingElse" className={textarea} />
        </div>
        <label className="flex cursor-pointer items-start gap-3">
          <input type="checkbox" name="publishConsent" className="mt-0.5 size-[22px] flex-none accent-forest-dark" />
          <span>{labels.publishConsent}</span>
        </label>
        <div className="flex flex-wrap items-center gap-6">
          {/* Does nothing until the forms integration phase. */}
          <button type="button" className="btn min-h-13 px-8">
            {zone.submitLabel}
          </button>
          <Link href="/reviews" className="text-[16px]">
            {zone.cancelLabel}
          </Link>
        </div>
      </form>
    </section>
  );
}

function RadioGroup({ legend, name, options }: { legend: string; name: string; options: [string, string][] }) {
  return (
    <fieldset className="m-0 flex flex-col border-0 p-0">
      <legend className="mb-3.5 p-0 font-bold">{legend}</legend>
      <div className="flex flex-wrap gap-2.5">
        {options.map(([value, text]) => (
          <label key={value} className={option}>
            <input type="radio" name={name} value={value} className={control} />
            <span>{text}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
