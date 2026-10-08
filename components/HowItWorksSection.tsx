const FONT = 'Poppins, sans-serif';

type Step = {
  title: string;
  description: string;
  icon: 'search' | 'shield' | 'check';
};

const STEPS: Step[] = [
  {
    title: 'Find the right favor',
    description:
      'Search by category or location, compare what is included, and check provider ratings and reviews.',
    icon: 'search',
  },
  {
    title: 'Book and pay securely',
    description:
      'Pick a date and time, then pay in the app. Your payment stays in escrow while the work is done.',
    icon: 'shield',
  },
  {
    title: 'Get it done',
    description:
      'Chat with your provider and track your booking. Once the favor is completed, escrow releases the payment.',
    icon: 'check',
  },
];

const TRUST_POINTS = [
  'Escrow-protected payments',
  'In-app messaging',
  'Ratings & reviews',
  'Live booking tracking',
];

function StepIcon({ name }: { name: Step['icon'] }) {
  const common = {
    width: 26,
    height: 26,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  if (name === 'search') {
    return (
      <svg {...common}>
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </svg>
    );
  }
  if (name === 'shield') {
    return (
      <svg {...common}>
        <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.7 2.7L16 9.8" />
    </svg>
  );
}

/** Static server component: no client JS, no images, so it adds nothing to load cost. */
export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="rs-section"
      style={{ padding: '96px 0', background: '#FAF5FF', scrollMarginTop: 80 }}
    >
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto 56px' }}>
          <p style={{ fontFamily: FONT, fontWeight: 600, fontSize: 13, color: '#7C3AED', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 8px' }}>
            How it works
          </p>
          <h2
            id="how-it-works-heading"
            className="rs-h2"
            style={{ fontFamily: FONT, fontWeight: 700, fontSize: 40, lineHeight: 1.2, color: '#101828', letterSpacing: '-0.02em', margin: '0 0 12px' }}
          >
            Get things done in{' '}
            <span style={{ background: 'linear-gradient(135deg, #BF75FF 0%, #A54AFF 50%, #8430E0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              three simple steps
            </span>
          </h2>
          <p style={{ fontFamily: FONT, fontSize: 16, lineHeight: 1.7, color: '#475467', margin: 0 }}>
            From finding a local provider to paying safely, WhoCan keeps every step in one place.
          </p>
        </div>

        <ol className="hiw-steps">
          {STEPS.map((step, index) => (
            <li key={step.title} className="hiw-step">
              <div className="hiw-badge">
                <span className="hiw-icon">
                  <StepIcon name={step.icon} />
                </span>
                <span className="hiw-number" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
              <h3 className="hiw-title">{step.title}</h3>
              <p className="hiw-text">{step.description}</p>
            </li>
          ))}
        </ol>

        <ul className="hiw-trust" aria-label="Why people trust WhoCan">
          {TRUST_POINTS.map((point) => (
            <li key={point} className="hiw-trust-item">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="8" fill="#A54AFF" />
                <path d="M4.8 8.3l2 2 4.3-4.4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {point}
            </li>
          ))}
        </ul>
      </div>

      <style>{`
        .hiw-steps {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 24px;
          counter-reset: none;
        }
        .hiw-step {
          position: relative;
          background: #ffffff;
          border: 1.5px solid #EAD9FF;
          border-radius: 24px;
          padding: 32px 28px 30px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
        }
        .hiw-step:hover {
          border-color: #BF75FF;
          box-shadow: 0 12px 32px rgba(165, 74, 255, 0.12);
          transform: translateY(-3px);
        }
        .hiw-badge { position: relative; width: 64px; height: 64px; margin-bottom: 22px; }
        .hiw-icon {
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 20px;
          color: #ffffff;
          background: linear-gradient(135deg, #BF75FF 0%, #A54AFF 50%, #8430E0 100%);
          box-shadow: 0 8px 20px rgba(165, 74, 255, 0.28);
        }
        .hiw-number {
          position: absolute;
          top: -8px;
          right: -12px;
          min-width: 28px;
          height: 28px;
          padding: 0 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9999px;
          background: #FEC84B;
          color: #1D2939;
          font-family: ${FONT};
          font-weight: 700;
          font-size: 12px;
        }
        .hiw-title {
          font-family: ${FONT};
          font-weight: 700;
          font-size: 20px;
          line-height: 1.3;
          color: #101828;
          margin: 0 0 10px;
        }
        .hiw-text {
          font-family: ${FONT};
          font-size: 15px;
          line-height: 1.7;
          color: #475467;
          margin: 0;
        }
        .hiw-trust {
          list-style: none;
          margin: 48px 0 0;
          padding: 0;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 12px;
        }
        .hiw-trust-item {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: ${FONT};
          font-weight: 500;
          font-size: 14px;
          color: #344054;
          background: #ffffff;
          border: 1.5px solid #EAD9FF;
          border-radius: 9999px;
          padding: 9px 16px;
        }
        @media (max-width: 900px) {
          .hiw-steps { grid-template-columns: minmax(0, 1fr); gap: 20px; }
          .hiw-step { padding: 26px 22px; }
          .hiw-trust { margin-top: 36px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hiw-step { transition: none; }
          .hiw-step:hover { transform: none; }
        }
      `}</style>
    </section>
  );
}
