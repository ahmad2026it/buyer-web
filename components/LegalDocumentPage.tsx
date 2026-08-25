'use client';
import type { ReactNode } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getAxiosErrorMessage } from '@/lib/axios';
import type { BuyerLegalDocument } from '@/app/buyer/store/buyerLegalTypes';

const BRAND = '#A54AFF';
const GRAD = 'linear-gradient(135deg,#BF75FF 0%,#A54AFF 50%,#8430E0 100%)';
const PILL = '9999px';
const FONT = 'Poppins,sans-serif';

const headingStyle: React.CSSProperties = {
  fontFamily: FONT,
  fontWeight: 700,
  fontSize: '20px',
  color: '#101828',
  lineHeight: 1.35,
  marginTop: '32px',
  marginBottom: '12px',
};

const documentTitleStyle: React.CSSProperties = {
  fontFamily: FONT,
  fontWeight: 800,
  fontSize: '18px',
  color: '#344054',
  letterSpacing: '0.02em',
  lineHeight: 1.4,
  marginBottom: '8px',
};

const paragraphStyle: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: '15px',
  color: '#344054',
  lineHeight: 1.85,
  marginBottom: '16px',
};

function formatLastUpdated(value: string): string {
  if (!value) return '';
  const date = /^\d{4}-\d{2}-\d{2}/.test(value)
    ? new Date(`${value.slice(0, 10)}T00:00:00`)
    : new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function isHeadingBlock(text: string): boolean {
  const line = text.trim();
  if (!line || line.includes('\n') || line.length > 90) return false;
  if (/[.!?]$/.test(line)) return false;
  const letters = line.replace(/[^A-Za-z]/g, '');
  return letters.length >= 3;
}

function isDocumentTitle(text: string): boolean {
  const letters = text.replace(/[^A-Za-z]/g, '');
  if (letters.length < 8) return false;
  const upper = letters.replace(/[^A-Z]/g, '').length;
  return upper / letters.length >= 0.7;
}

const EMAIL_RE = /([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi;

function linkifyText(text: string): ReactNode {
  const parts = text.split(EMAIL_RE);
  if (parts.length === 1) return text;

  return parts.map((part, index) => {
    if (!part.includes('@') || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(part)) {
      return part;
    }
    return (
      <a
        key={`${part}-${index}`}
        href={`mailto:${part}`}
        style={{ color: BRAND, fontWeight: 600, textDecoration: 'none' }}
      >
        {part}
      </a>
    );
  });
}

function LegalContent({ content }: { content: string }) {
  const blocks = content
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <div>
      {blocks.map((block, index) => {
        if (isHeadingBlock(block)) {
          return (
            <h2
              key={`${index}-${block.slice(0, 24)}`}
              style={isDocumentTitle(block) && index === 0 ? documentTitleStyle : headingStyle}
            >
              {block}
            </h2>
          );
        }

        return (
          <p key={`${index}-${block.slice(0, 24)}`} style={paragraphStyle}>
            {block.split('\n').map((line, lineIndex, lines) => (
              <span key={`${index}-${lineIndex}`}>
                {linkifyText(line)}
                {lineIndex < lines.length - 1 ? <br /> : null}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

type LegalDocumentPageProps = {
  fallbackTitle: string;
  loadErrorMessage: string;
  legalDocument?: BuyerLegalDocument;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
};

export default function LegalDocumentPage({
  fallbackTitle,
  loadErrorMessage,
  legalDocument,
  isLoading,
  isError,
  error,
  onRetry,
}: LegalDocumentPageProps) {
  const title = legalDocument?.title || fallbackTitle;

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: '#F9FAFB' }}>
        <div style={{ background: '#fff', borderBottom: '1px solid #EAECF0', paddingTop: '104px', paddingBottom: '32px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
            <a
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: FONT,
                fontSize: '13px',
                fontWeight: 500,
                color: '#667085',
                textDecoration: 'none',
                marginBottom: '16px',
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = BRAND;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = '#667085';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back
            </a>
            <h1 style={{ fontFamily: FONT, fontWeight: 800, fontSize: '28px', color: '#101828' }}>
              {isLoading ? fallbackTitle : title}
            </h1>
            {legalDocument?.lastUpdated ? (
              <p style={{ fontFamily: FONT, fontSize: '14px', color: '#667085', marginTop: '8px' }}>
                Last updated {formatLastUpdated(legalDocument.lastUpdated)}
              </p>
            ) : null}
          </div>
        </div>

        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px 80px' }}>
          {isLoading ? (
            <div
              style={{
                background: '#fff',
                border: '1px solid #EAECF0',
                borderRadius: '20px',
                padding: '32px',
                boxShadow: '0 1px 4px rgba(16,24,40,0.05)',
              }}
            >
              <div style={{ width: '40%', height: 16, borderRadius: 6, background: '#F2F4F7', marginBottom: 20 }} />
              <div style={{ width: '100%', height: 12, borderRadius: 6, background: '#F2F4F7', marginBottom: 10 }} />
              <div style={{ width: '96%', height: 12, borderRadius: 6, background: '#F2F4F7', marginBottom: 10 }} />
              <div style={{ width: '88%', height: 12, borderRadius: 6, background: '#F2F4F7', marginBottom: 28 }} />
              <div style={{ width: '32%', height: 16, borderRadius: 6, background: '#F2F4F7', marginBottom: 20 }} />
              <div style={{ width: '100%', height: 12, borderRadius: 6, background: '#F2F4F7', marginBottom: 10 }} />
              <div style={{ width: '90%', height: 12, borderRadius: 6, background: '#F2F4F7' }} />
            </div>
          ) : isError || !legalDocument?.content ? (
            <div
              style={{
                textAlign: 'center',
                padding: '80px 24px',
                background: '#fff',
                border: '1px solid #EAECF0',
                borderRadius: '20px',
                boxShadow: '0 1px 4px rgba(16,24,40,0.05)',
              }}
            >
              <p style={{ fontFamily: FONT, fontSize: 15, color: '#667085', marginBottom: 20 }}>
                {getAxiosErrorMessage(error) || loadErrorMessage}
              </p>
              <button
                type="button"
                onClick={onRetry}
                style={{
                  fontFamily: FONT,
                  fontWeight: 700,
                  fontSize: 14,
                  color: '#fff',
                  background: GRAD,
                  border: 'none',
                  borderRadius: PILL,
                  padding: '12px 24px',
                  cursor: 'pointer',
                }}
              >
                Retry
              </button>
            </div>
          ) : (
            <div
              style={{
                background: '#fff',
                border: '1px solid #EAECF0',
                borderRadius: '20px',
                padding: '36px 40px',
                boxShadow: '0 1px 4px rgba(16,24,40,0.05)',
              }}
            >
              <LegalContent content={legalDocument.content} />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
