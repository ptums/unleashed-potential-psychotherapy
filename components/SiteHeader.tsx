import Link from "next/link";
import { getNav } from "@/lib/nav";
import { site, type NavGroup, type NavLink } from "@/lib/site";
import { CalendarIcon, ChevronIcon, MenuIcon } from "./icons";
import { NavCloser } from "./NavCloser";

const navItem =
  "flex min-h-11 cursor-pointer items-center gap-1.5 px-3.5 text-small no-underline hover:underline hover:underline-offset-[6px]";

function BookIcon() {
  return (
    <Link
      href={site.bookHref}
      aria-label="Book an appointment"
      title="Book an appointment"
      className="inline-flex size-12 items-center justify-center border-[1.5px] border-forest-dark no-underline transition-colors hover:bg-forest-dark hover:text-linen"
    >
      <CalendarIcon />
    </Link>
  );
}

/** A menu link. A link to another site opens in a new tab and says so to screen readers. */
function MenuLink({ link, className }: { link: NavLink; className: string }) {
  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
        {link.label}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }
  return (
    <Link href={link.href} className={className}>
      {link.label}
    </Link>
  );
}

/**
 * A menu's links. A menu with sections (Clinicians) shows each section under a small, dark,
 * bold title, with space between the sections (Peter, 2026-11-23).
 */
function MenuLinks({ group, linkClass, titleClass }: { group: NavGroup; linkClass: string; titleClass: string }) {
  if (!group.sections) {
    return group.links.map((link) => <MenuLink key={link.href} link={link} className={linkClass} />);
  }
  return group.sections.map((section) => (
    <div key={section.label} role="group" aria-label={section.label} className="flex flex-col [&+&]:mt-4">
      <p className={titleClass}>{section.label}</p>
      {section.links.map((link) => (
        <MenuLink key={link.href} link={link} className={linkClass} />
      ))}
    </div>
  ));
}

const sectionTitle = "text-[13px] font-bold tracking-[0.14em] text-forest-dark uppercase";

export async function SiteHeader() {
  const nav = await getNav();
  return (
    <header className="relative z-30 border-b border-forest bg-linen">
      <NavCloser />
      <div className="wrap flex min-h-21 items-center justify-between gap-6">
        <Link href="/" className="flex flex-col leading-[1.1] no-underline">
          <span className="font-display text-[26px] font-medium">{site.name}</span>
          <span className="mt-1.5 text-xs tracking-[0.18em] text-forest uppercase">{site.tagline}</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 nav:flex">
          {nav.map((group) => (
            <details key={group.label} data-nav className="group relative">
              <summary className={navItem}>
                {group.label} <ChevronIcon />
              </summary>
              {/* The Specialties list is long, so its panel is wider and its links are 2px smaller (15px). */}
              <div
                className={`absolute top-[calc(100%+8px)] left-0 z-40 flex flex-col border border-forest bg-linen py-2 ${
                  group.label === "Specialties" ? "min-w-80 text-[15px]" : "min-w-60"
                }`}
              >
                <MenuLinks
                  group={group}
                  linkClass="flex min-h-11 items-center px-5 no-underline hover:underline"
                  titleClass={`${sectionTitle} px-5 pt-2 pb-1`}
                />
              </div>
            </details>
          ))}
          {site.navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={navItem}>
              {link.label}
            </Link>
          ))}
          <div className="ml-3">
            <BookIcon />
          </div>
        </nav>

        <div className="flex items-center gap-2 nav:hidden">
          <BookIcon />
          <details data-nav className="group">
            <summary
              aria-label="Open menu"
              className="flex size-11 cursor-pointer items-center justify-center border-[1.5px] border-forest-dark"
            >
              <MenuIcon />
            </summary>
            <nav
              aria-label="Main mobile"
              className="absolute inset-x-0 top-full z-40 flex flex-col gap-4 border-b border-forest bg-linen px-5 pt-2 pb-6"
            >
              {nav.map((group) => (
                <div key={group.label}>
                  <p className="eyebrow mt-3">{group.label}</p>
                  <MenuLinks group={group} linkClass="flex min-h-11 items-center no-underline" titleClass={`${sectionTitle} pt-2`} />
                </div>
              ))}
              <div>
                {site.navLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="flex min-h-11 items-center no-underline">
                    {link.label}
                  </Link>
                ))}
              </div>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
