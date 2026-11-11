import Link from "next/link";
import type { ReactNode } from "react";
import { hrefForLink, type CmsLink } from "@/lib/links";

export interface CmsImage {
  assetId: string;
  alt: string;
}

// Uploaded images are served by the CMS CloudFront at <base>/uploads/<uuid>.<ext>.
const mediaBase = (process.env.CMS_MEDIA_URL ?? "https://cms.uptherapygroup.com").replace(/\/+$/, "");
const UPLOAD_KEY = /^uploads\/[0-9a-f-]{36}\.(jpg|png|webp)$/;

/** The public URL of an uploaded CMS image, or null for a placeholder asset id (the mock uses "[asset-id]"). */
export function cmsImageUrl(assetId: string): string | null {
  return UPLOAD_KEY.test(assetId) ? `${mediaBase}/${assetId}` : null;
}

/**
 * A CMS image. An uploaded image renders as an img that fills the box. A placeholder asset
 * renders as a labelled cream box, as in the prototype.
 */
export function CmsPicture({
  image,
  className = "",
  eager = false,
}: {
  image: CmsImage;
  className?: string;
  /** true for an image above the fold, such as the hero. */
  eager?: boolean;
}) {
  const src = cmsImageUrl(image.assetId);
  if (src) {
    // A plain img: the Worker has no image optimizer, and CloudFront caches the file.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={image.alt} loading={eager ? "eager" : "lazy"}
        decoding="async" className={`bg-cream object-cover ${className}`} />;
  }
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
