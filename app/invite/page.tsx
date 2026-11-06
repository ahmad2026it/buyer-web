import type { Metadata } from 'next';
import InviteClient from './InviteClient';

interface InvitePageProps {
  searchParams: Promise<{
    ref?: string;
    referral_code?: string;
    code?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: InvitePageProps): Promise<Metadata> {
  const params = await searchParams;
  const rawCode = (params.ref || params.referral_code || params.code || '').trim();

  const title = rawCode
    ? `You're Invited to WhoCan (Code: ${rawCode.toUpperCase()})`
    : "You're Invited to Join WhoCan";
  const description =
    'Download the WhoCan Buyer app on iPhone or Android to get local tasks and favors done at fixed prices.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function InvitePage({ searchParams }: InvitePageProps) {
  const params = await searchParams;
  const referralCode = (
    params.ref ||
    params.referral_code ||
    params.code ||
    ''
  ).trim();

  return <InviteClient referralCode={referralCode} />;
}

