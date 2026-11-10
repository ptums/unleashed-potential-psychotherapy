import Link from "next/link";

export default function NotFound() {
  return (
    <section className="py-[clamp(56px,8vw,112px)]">
      <div className="wrap flex flex-col items-start gap-6">
        <p className="eyebrow">Page not found</p>
        <h1 className="text-h2">We could not find that page.</h1>
        <p>The link may be old, or the page may have moved.</p>
        <Link href="/" className="btn">
          Go to the home page
        </Link>
      </div>
    </section>
  );
}
