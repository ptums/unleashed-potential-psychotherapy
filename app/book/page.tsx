import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BookingFlow } from "@/components/booking/BookingFlow";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getContent } from "@/lib/content";
import { seoMetadata } from "@/lib/seo";

// /book?clinician={slug}: request a free consultation (design-handoff/docs/BOOKING.md).
// Not linked yet: the profile's Book button stays inert until the request step works.

export async function generateMetadata(): Promise<Metadata> {
  return seoMetadata((await getContent().getPage("booking"))?.seo);
}

export default async function BookPage({ searchParams }: PageProps<"/book">) {
  const { clinician: slug } = await searchParams;
  const content = getContent();
  const [page, profile] = await Promise.all([
    content.getPage("booking"),
    typeof slug === "string" && slug ? content.getEntry("clinicians", slug) : null,
  ]);
  // No clinician, an unknown one, or one not taking bookings: back to the clinician list.
  if (!page || !profile || profile.booking.hidden || !profile.booking.acceptingNewClients) {
    redirect("/#clinicians");
  }

  const h = profile.profileHeader;
  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Our Clinicians", href: "/#clinicians" },
          { label: h.displayName, href: `/clinicians/${slug}` },
          { label: "Book a consultation" },
        ]}
      />
      <div className="wrap pt-[clamp(32px,5vw,64px)] pb-[clamp(48px,6vw,96px)]">
        <BookingFlow
          page={page}
          clinician={{
            slug: slug as string,
            firstName: h.firstName,
            displayName: h.displayName,
            roleLine: h.roleLine,
            portrait: h.portrait,
          }}
        />
      </div>
    </>
  );
}
