import { LegalPage, legalMetadata } from "@/components/LegalPage";

export function generateMetadata() {
  return legalMetadata("privacy-policy");
}

export default function PrivacyPolicyPage() {
  return <LegalPage id="privacy-policy" />;
}
