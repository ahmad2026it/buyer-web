import LegalDocumentPage from '@/components/LegalDocumentPage';
import { fetchPublicPrivacyPolicy } from '@/lib/fetchPublicLegal';

export default async function PrivacyPolicyPage() {
  const initialDocument = await fetchPublicPrivacyPolicy();

  return (
    <LegalDocumentPage
      fallbackTitle="Privacy Policy"
      loadErrorMessage="Unable to load the privacy policy. Please try again."
      initialDocument={initialDocument}
      kind="privacy"
    />
  );
}
