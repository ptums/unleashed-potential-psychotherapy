# Open questions

Don't guess these. Leave `TODO(open-question #n)` in code and keep building around them.

1. **Google Workspace + HIPAA BAA.** Booking writes client names, emails and appointment times to Google Calendar. This needs a Google Workspace account with a signed Business Associate Agreement; personal Gmail is not HIPAA-eligible. Workspace with domain-wide delegation is also what lets the integration invite clients and create Meet links. *Owner: Jess. Blocks: Phase 3 going live (build against MockProvider until then).*
2. **Clinician availability.** The `weeklyHours`, buffer, minimum notice and booking window in `content/clinicians/jess-rebelo.json` are placeholders. *Owner: Jess.*
3. **Undesigned pages.** Careers, Contact, Privacy Notice, In Person & Online, Fees & Insurance, FAQs and Who We Work With. Should they launch as simple text pages, be designed first, or be removed from the nav for launch? The Privacy Notice must exist before launch either way.
4. **Tagline.** The header tagline on the Home edit is "turning pain into power". The brief asked for clinical, not motivational, wording. Keep it, change it, or drop it?
5. **Ads tracking.** Confirm the privacy-safe approach in SPEC §7: no tags on `/book`, server-side conversion with `gclid` only, and consent on content pages. Also confirm who owns the Google Ads account.
6. **Confirmation email.** Is Google's calendar invite enough, or does the practice want its own branded confirmation and reminder emails? If so, it needs a HIPAA-eligible email provider.
7. **Real content.**
   - Photos: all images are placeholders.
   - Practice details: fees, license number, insurance status, office address and phone.
   - Clinician details: EMDR training body and practicing-since year.
   - Featured In: dates of the Steve Harper / PBN episodes, and their URLs.
8. **Old site redirects.** Get the list of URLs on the current site (unleashed potential coaching site) so they can be 301-redirected.
9. **Domain and hosting.** Which domain, and where to deploy (e.g. Vercel)? Any HIPAA constraint on hosting applies only if booking data passes through server logs. Keep it out of logs regardless.
