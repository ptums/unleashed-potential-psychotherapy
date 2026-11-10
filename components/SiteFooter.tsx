import Link from "next/link";
import { site } from "@/lib/site";

export function CrisisLine() {
  return (
    <div role="note" aria-label="Crisis support" className="flex flex-wrap items-center gap-x-6 gap-y-2 border border-linen px-6 py-5">
      <p className="font-bold">In crisis or in danger?</p>
      <p>
        Call or text <a href="tel:988">988</a> (Suicide &amp; Crisis Lifeline) or call <a href="tel:911">911</a>. We are
        not an emergency service.
      </p>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="dark border-t border-forest">
      <div className="wrap flex flex-col gap-12 pt-14 pb-10">
        <CrisisLine />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-10">
          <div className="flex flex-col gap-2">
            <p className="font-display text-2xl">{site.name}</p>
            <p className="text-small">
              {site.address.map((line, i) => (
                <span key={line}>
                  {i > 0 && <br />}
                  {line}
                </span>
              ))}
            </p>
          </div>
          <nav aria-label="Footer" className="flex flex-col gap-1">
            {site.footerLinks.map((link) => (
              <Link key={link.href} href={link.href} className="flex min-h-11 items-center">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="border-t border-linen pt-6 text-[15px]">
          © {new Date().getFullYear()} {site.name}
        </p>
      </div>
    </footer>
  );
}
