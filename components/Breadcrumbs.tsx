import Link from "next/link";
import { siteUrl } from "@/lib/site";

export interface Crumb {
  label: string;
  /** Leave out for the current page (the last crumb). */
  href?: string;
}

/**
 * The trail at the top of a page below the first level ("Home / Reviews / Share your experience").
 * Home comes first on every page. The last crumb is the current page. Also emits
 * schema.org BreadcrumbList data, so search results can show the path.
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const trail: Crumb[] = [{ label: "Home", href: "/" }, ...items];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.label,
      ...(crumb.href ? { item: new URL(crumb.href, siteUrl).toString() } : {}),
    })),
  };

  return (
    <div className="wrap pt-6">
      <nav aria-label="Breadcrumb">
        <ol className="m-0 flex list-none flex-wrap gap-2 p-0 text-small">
          {trail.map((crumb, i) => {
            const last = i === trail.length - 1;
            return (
              <li key={`${i}-${crumb.label}`} className="flex gap-2">
                {i > 0 && <span aria-hidden="true">/</span>}
                {last || !crumb.href ? <span aria-current={last ? "page" : undefined}>{crumb.label}</span> : <Link href={crumb.href}>{crumb.label}</Link>}
              </li>
            );
          })}
        </ol>
      </nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </div>
  );
}
