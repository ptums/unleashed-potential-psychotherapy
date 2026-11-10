import Link from "next/link";
import { site } from "@/lib/site";
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

export function SiteHeader() {
  return (
    <header className="relative z-30 border-b border-forest bg-linen">
      <NavCloser />
      <div className="wrap flex min-h-21 items-center justify-between gap-6">
        <Link href="/" className="flex flex-col leading-[1.1] no-underline">
          <span className="font-display text-[26px] font-medium">{site.name}</span>
          <span className="mt-1.5 text-xs tracking-[0.18em] text-forest uppercase">{site.tagline}</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 nav:flex">
          {site.nav.map((group) => (
            <details key={group.label} data-nav className="group relative">
              <summary className={navItem}>
                {group.label} <ChevronIcon />
              </summary>
              <div className="absolute top-[calc(100%+8px)] left-0 z-40 flex min-w-60 flex-col border border-forest bg-linen py-2">
                {group.links.map((link) => (
                  <Link key={link.href} href={link.href} className="flex min-h-11 items-center px-5 no-underline hover:underline">
                    {link.label}
                  </Link>
                ))}
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
              {site.nav.map((group) => (
                <div key={group.label}>
                  <p className="eyebrow mt-3">{group.label}</p>
                  {group.links.map((link) => (
                    <Link key={link.href} href={link.href} className="flex min-h-11 items-center no-underline">
                      {link.label}
                    </Link>
                  ))}
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
