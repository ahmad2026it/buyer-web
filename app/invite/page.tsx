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
  // Shown in link previews when people share invites: Requester wording, no price claims.
  const description =
    'Download the WhoCan app on iPhone or Android: post a job, compare offers from local Providers, chat first and pay in the app.';

  return {
    title,
    description,
    // Each invite code is a separate URL; keep them out of search results.
    robots: { index: false, follow: true },
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

