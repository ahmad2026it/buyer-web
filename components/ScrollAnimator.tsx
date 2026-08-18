'use client';

import { useEffect } from 'react';

export default function ScrollAnimator() {
  useEffect(() => {
    // firstPassDone: tracks whether IntersectionObserver has delivered
    // its initial batch of entries. We only remove 'in-view' after that
    // first pass so that elements already in the viewport at load time
    // are never hidden. 'animate-ready' on <body> activates the CSS
    // hidden state — added after the first pass so nothing flashes blank.
    let firstPassDone = false;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          } else if (firstPassDone) {
            entry.target.classList.remove('in-view');
          }
        });

        if (!firstPassDone) {
          firstPassDone = true;
          requestAnimationFrame(() => {
            document.body.classList.add('animate-ready');
          });
        }
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    const observe = () =>
      document.querySelectorAll('[data-animate]').forEach((el) =>
        observer.observe(el)
      );

    observe();

    const mutationObserver = new MutationObserver(observe);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
      document.body.classList.remove('animate-ready');
    };
  }, []);

  return null;
}
