import { getContent, isZoneVisible } from "@/lib/content";

// Placeholder until the Home page PR. It proves the shell and the content layer work end to end.
export default async function HomePage() {
  const home = await getContent().getPage("home");

  return (
    <section className="py-[clamp(56px,8vw,112px)]">
      <div className="wrap flex flex-col gap-7">
        {home && isZoneVisible(home.hero) ? (
          <>
            <p className="eyebrow">{home.hero.eyebrow}</p>
            <h1 className="text-h1">{home.hero.heading}</h1>
          </>
        ) : (
          <h1 className="text-h1">Unleashed Potential Psychotherapy</h1>
        )}
      </div>
    </section>
  );
}
