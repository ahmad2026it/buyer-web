'use client';
import LegalDocumentPage from '@/components/LegalDocumentPage';
import { useGetBuyerTermsAndConditionsQuery } from '@/app/buyer/store/buyerLegalAPI';

export default function TermsAndConditionsPage() {
  const { data, isLoading, isError, error, refetch } = useGetBuyerTermsAndConditionsQuery();

  return (
    <LegalDocumentPage
      fallbackTitle="Terms and Conditions"
      loadErrorMessage="Unable to load the terms and conditions. Please try again."
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
