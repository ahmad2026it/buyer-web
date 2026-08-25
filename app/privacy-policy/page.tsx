'use client';
import LegalDocumentPage from '@/components/LegalDocumentPage';
import { useGetBuyerPrivacyPolicyQuery } from '@/app/buyer/store/buyerLegalAPI';

export default function PrivacyPolicyPage() {
  const { data, isLoading, isError, error, refetch } = useGetBuyerPrivacyPolicyQuery();

  return (
    <LegalDocumentPage
      fallbackTitle="Privacy Policy"
      loadErrorMessage="Unable to load the privacy policy. Please try again."
      legalDocument={data?.data}
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={() => {
        void refetch();
      }}
    />
  );
}
