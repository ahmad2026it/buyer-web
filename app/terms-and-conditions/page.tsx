import LegalDocumentPage from '@/components/LegalDocumentPage';
import { fetchPublicTermsAndConditions } from '@/lib/fetchPublicLegal';

export default async function TermsAndConditionsPage() {
  const initialDocument = await fetchPublicTermsAndConditions();

  return (
    <LegalDocumentPage
      fallbackTitle="Terms and Conditions"
      loadErrorMessage="Unable to load the terms and conditions. Please try again."
      initialDocument={initialDocument}
      kind="terms"
    />
  );
}
