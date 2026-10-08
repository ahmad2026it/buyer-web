'use client';

import { useState } from 'react';
import type { PublicFaq } from '@/app/buyer/store/buyerFaqTypes';

type FaqAccordionProps = {
  items: PublicFaq[];
};

export default function FaqAccordion({ items }: FaqAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <ul className="faq-list">
      {items.map((item) => {
        const open = openId === item.id;
        const panelId = `faq-panel-${item.id}`;
        const buttonId = `faq-button-${item.id}`;

        return (
          <li key={item.id} className={`faq-item${open ? ' is-open' : ''}`}>
            <h3 className="faq-heading">
              <button
                type="button"
                id={buttonId}
                className="faq-trigger"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenId(open ? null : item.id)}
              >
                <span className="faq-question">{item.question}</span>
                <span className="faq-icon" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7H12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <path className="faq-icon-v" d="M7 2V12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </span>
              </button>
            </h3>
            {/* Answers stay in the DOM when closed so crawlers can read them. */}
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className="faq-panel"
            >
              <div className="faq-panel-inner">
                <p className="faq-answer">{item.answer}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
