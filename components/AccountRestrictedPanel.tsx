'use client';

const FONT = 'Poppins, sans-serif';
const GRAD = 'linear-gradient(135deg,#BF75FF 0%,#A54AFF 50%,#8430E0 100%)';
const PILL = '9999px';
const EMAIL_PATTERN = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;

function MessageWithSupportEmail({ message }: { message: string }) {
  const match = message.match(EMAIL_PATTERN);
  if (!match || match.index === undefined) return <>{message}</>;

  const email = match[1];
  const start = match.index;
  const end = start + email.length;

  return (
    <>
      {message.slice(0, start)}
      <a
        href={`mailto:${email}`}
        style={{ color: '#A54AFF', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 2 }}
      >
        {email}
      </a>
      {message.slice(end)}
    </>
  );
}

export default function AccountRestrictedPanel({
  message,
  onBack,
}: {
  message: string;
  onBack: () => void;
}) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 24,
        padding: '48px 40px',
        maxWidth: 480,
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 20px 48px rgba(16,24,40,0.1)',
        margin: 24,
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: '#FEF3F2',
          border: '2px solid #FECDCA',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
        }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
            stroke="#D92D20"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M12 9v4M12 17h.01" stroke="#D92D20" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <h2
        style={{
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 24,
          color: '#101828',
          marginBottom: 10,
        }}
      >
        Account inactive
      </h2>
      <p
        style={{
          fontFamily: FONT,
          fontSize: 15,
          color: '#667085',
          lineHeight: 1.7,
          marginBottom: 32,
        }}
      >
        <MessageWithSupportEmail message={message} />
      </p>
      <button
        type="button"
        onClick={onBack}
        style={{
          width: '100%',
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 15,
          color: '#fff',
          background: GRAD,
          border: 'none',
          borderRadius: PILL,
          padding: 14,
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(165,74,255,0.3)',
        }}
      >
        Go back
      </button>
    </div>
  );
}
