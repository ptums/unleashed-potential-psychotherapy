import { LegalPage, legalMetadata } from "@/components/LegalPage";

export function generateMetadata() {
  return legalMetadata("notice-of-privacy-practices");
}

export default function NoticeOfPrivacyPracticesPage() {
  return <LegalPage id="notice-of-privacy-practices" />;
}
