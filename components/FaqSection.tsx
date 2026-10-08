import type { PublicFaq } from '@/app/buyer/store/buyerFaqTypes';
import FaqAccordion from '@/components/FaqAccordion';

const FONT = 'Poppins, sans-serif';
const SUPPORT_EMAIL = 'contactus@whocan-app.com';

type FaqSectionProps = {
  items: PublicFaq[];
};

/** Renders nothing when there are no FAQs, so an empty admin list leaves no gap on the page. */
export default function FaqSection({ items }: FaqSectionProps) {
  if (items.length === 0) return null;

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="rs-section"
      style={{ padding: '96px 0', background: '#ffffff', scrollMarginTop: 80 }}
    >
      <div className="container">
        <div className="faq-layout">
          <div className="faq-intro">
            <p
              style={{ fontFamily: FONT, fontWeight: 600, fontSize: 13, color: '#7C3AED', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 8px' }}
            >
              FAQ
            </p>
            <h2
              id="faq-heading"
              style={{ fontFamily: FONT, fontWeight: 700, fontSize: 36, lineHeight: 1.2, color: '#101828', letterSpacing: '-0.01em', margin: 0 }}
            >
              Frequently asked{' '}
              <span style={{ background: 'linear-gradient(135deg, #BF75FF 0%, #A54AFF 50%, #8430E0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                questions
              </span>
            </h2>
            <p
              style={{ fontFamily: FONT, fontSize: 15, lineHeight: 1.7, color: '#475467', margin: '12px 0 0' }}
            >
              Everything you need to know about booking and offering services on WhoCan.
            </p>

            <div className="faq-help">
              <p style={{ fontFamily: FONT, fontWeight: 600, fontSize: 15, color: '#101828', margin: '0 0 4px' }}>
                Still have questions?
              </p>
              <p style={{ fontFamily: FONT, fontSize: 13, lineHeight: 1.6, color: '#667085', margin: '0 0 14px' }}>
                Can&apos;t find the answer you&apos;re looking for? Our team is happy to help.
              </p>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="faq-help-link"
              >
                Contact support
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>

          <div className="faq-body">
            <FaqAccordion items={items} />
          </div>
        </div>
      </div>

      <style>{`
        .faq-layout {
          display: grid;
          grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
          gap: 64px;
          align-items: start;
        }
        .faq-intro { position: sticky; top: 112px; }
        .faq-help {
          margin-top: 32px;
          padding: 20px 22px;
          background: #F8F0FF;
          border: 1.5px solid #EAD9FF;
          border-radius: 20px;
        }
        .faq-help-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: ${FONT};
          font-weight: 600;
          font-size: 14px;
          color: #7C3AED;
          text-decoration: none;
        }
        .faq-help-link:hover { color: #6D28D9; }
        .faq-help-link:focus-visible,
        .faq-trigger:focus-visible { outline: 2px solid #A54AFF; outline-offset: 2px; }

        .faq-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
        .faq-item {
          background: #ffffff;
          border: 1.5px solid #EAECF0;
          border-radius: 16px;
          transition: border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
        }
        .faq-item:hover { border-color: #D6BBFB; }
        .faq-item.is-open {
          background: #FCF8FF;
          border-color: #BF75FF;
          box-shadow: 0 4px 16px rgba(165, 74, 255, 0.08);
        }
        .faq-heading { margin: 0; font: inherit; }
        .faq-trigger {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 20px 22px;
          background: none;
          border: none;
          border-radius: 16px;
          cursor: pointer;
          text-align: left;
        }
        .faq-question {
          font-family: ${FONT};
          font-weight: 600;
          font-size: 16px;
          line-height: 1.5;
          color: #101828;
        }
        .faq-icon {
          flex-shrink: 0;
          width: 32px;
          height: 32px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 9999px;
          background: #F4EBFF;
          color: #A54AFF;
          transition: background-color 0.2s ease, color 0.2s ease;
        }
        .faq-icon-v { transform-origin: center; transition: transform 0.25s ease, opacity 0.25s ease; }
        .faq-item.is-open .faq-icon { background: #A54AFF; color: #ffffff; }
        .faq-item.is-open .faq-icon-v { transform: scaleY(0); opacity: 0; }

        .faq-panel {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.28s ease;
        }
        .faq-item.is-open .faq-panel { grid-template-rows: 1fr; }
        .faq-panel-inner { overflow: hidden; min-height: 0; visibility: hidden; transition: visibility 0.28s; }
        .faq-item.is-open .faq-panel-inner { visibility: visible; }
        .faq-answer {
          margin: 0;
          padding: 0 22px 22px;
          font-family: ${FONT};
          font-size: 15px;
          line-height: 1.75;
          color: #475467;
          white-space: pre-line;
          overflow-wrap: anywhere;
        }

        @media (max-width: 900px) {
          .faq-layout { grid-template-columns: minmax(0, 1fr); gap: 36px; }
          .faq-intro { position: static; }
        }
        @media (max-width: 600px) {
          .faq-trigger { padding: 16px 16px; }
          .faq-answer { padding: 0 16px 18px; font-size: 14px; }
          .faq-question { font-size: 15px; }
          .faq-help { margin-top: 24px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .faq-panel, .faq-item, .faq-icon, .faq-icon-v, .faq-panel-inner { transition: none; }
        }
      `}</style>
    </section>
  );
}
