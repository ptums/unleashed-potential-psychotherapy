import Link from "next/link";
import type { ReactNode } from "react";
import { hrefForLink, type CmsLink } from "@/lib/links";

export interface CmsImage {
  assetId: string;
  alt: string;
}

/**
 * A CMS image. Until real photos exist (handoff open question 7), assets are placeholders and
 * render as a labelled cream box, as in the prototype.
 * TODO(TWS-117): render real assets once the CMS media URL is known.
 */
export function CmsPicture({ image, className = "" }: { image: CmsImage; className?: string }) {
  return (
    <div role="img" aria-label={image.alt} className={`flex items-end bg-cream ${className}`}>
      <span aria-hidden="true" className="m-4 bg-linen px-2.5 py-1 text-label leading-snug text-forest-dark">
        Photo: {image.alt}
      </span>
    </div>
  );
}

/** A link from CMS content. Renders nothing when the target page does not exist yet. */
export function CmsLinkTo({
  link,
  className,
  children,
}: {
  link: CmsLink | undefined;
  className?: string;
  children?: ReactNode;
}) {
  const href = hrefForLink(link);
  if (!link || !href) {
    return null;
  }
  return (
    <Link href={href} className={className}>
      {children ?? link.label}
    </Link>
  );
}

export function SectionIntro({
  eyebrow,
  heading,
  intro,
  id,
}: {
  eyebrow?: string;
  heading: string;
  intro?: string;
  id?: string;
}) {
  return (
    <div className="flex max-w-[640px] flex-col gap-4">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 id={id} className="text-h2">
        {heading}
      </h2>
      {intro && <p>{intro}</p>}
    </div>
  );
}
