import { LegalPage, legalMetadata } from "@/components/LegalPage";

export function generateMetadata() {
  return legalMetadata("disclaimer");
}

export default function DisclaimerPage() {
  return <LegalPage id="disclaimer" />;
}
