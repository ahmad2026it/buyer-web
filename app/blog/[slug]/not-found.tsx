'use client';

import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const BRAND = '#A54AFF';
const FONT = 'Poppins, sans-serif';

export default function BlogNotFound() {
  const router = useRouter();

  return (
    <>
      <Navbar />
      <main
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: 24,
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 28, color: '#101828' }}>
          Article not found
        </h1>
        <p style={{ fontFamily: FONT, fontSize: 15, color: '#667085', maxWidth: 420 }}>
          This post may be unpublished or the link is incorrect.
        </p>
        <button
          type="button"
          onClick={() => router.push('/blog')}
          style={{
            fontFamily: FONT,
            fontWeight: 600,
            fontSize: 14,
            color: '#fff',
            background: BRAND,
            border: 'none',
            borderRadius: 9999,
            padding: '12px 28px',
            cursor: 'pointer',
          }}
        >
          Back to Blog
        </button>
      </main>
      <Footer />
    </>
  );
}
