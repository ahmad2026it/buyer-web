'use client';

import { useEffect } from 'react';

/**
 * Progressive enhancement for the provider landing page. The page content is
 * server-rendered; this only adds the header scroll state, the rotating word,
 * reveal-on-scroll, the guide table of contents, the FAQ accordion and the
 * mobile menu. Nothing here is required to read the page.
 */
export default function ProviderEffects() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('.pv');
    if (!root) return;
    const cleanups: Array<() => void> = [];
    const on = <K extends keyof WindowEventMap>(t: K, fn: (e: WindowEventMap[K]) => void) => {
      window.addEventListener(t, fn as EventListener, { passive: true });
      cleanups.push(() => window.removeEventListener(t, fn as EventListener));
    };

    root.classList.add('pv-js');

    // Header + reading progress
    const hd = root.querySelector<HTMLElement>('#pv-hd');
    const prog = root.querySelector<HTMLElement>('#pv-prog');
    const onScroll = () => {
      const y = window.scrollY;
      if (hd) {
        hd.classList.toggle('scrolled', y > 40);
        hd.style.top = Math.max(14, 56 - y) + 'px';
      }
      if (prog) {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        prog.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
      }
    };
    on('scroll', onScroll);
    onScroll();

    // Rotating service word
    const rot = root.querySelector<HTMLElement>('.rot');
    if (rot && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const words = Array.from(rot.children).slice(0, 4) as HTMLElement[];
      let wi = 0;
      const setW = () => {
        rot.style.width = words[wi].getBoundingClientRect().width + 'px';
        words.forEach((w) => (w.style.transform = `translateY(${-wi * 100}%)`));
      };
      let timer: number | undefined;
      const start = () => {
        setW();
        timer = window.setInterval(() => {
          wi = (wi + 1) % words.length;
          setW();
        }, 2600);
      };
      document.fonts.ready.then(start);
      cleanups.push(() => window.clearInterval(timer));
    }

    // Mobile menu
    const bg = root.querySelector<HTMLElement>('#pv-bg');
    const mm = root.querySelector<HTMLElement>('#pv-mm');
    if (bg && mm) {
      const toggle = () => {
        const open = !mm.classList.contains('open');
        mm.classList.toggle('open', open);
        bg.classList.toggle('open', open);
        bg.setAttribute('aria-expanded', String(open));
      };
      const close = () => {
        mm.classList.remove('open');
        bg.classList.remove('open');
        bg.setAttribute('aria-expanded', 'false');
      };
      bg.addEventListener('click', toggle);
      const links = Array.from(mm.querySelectorAll('a'));
      links.forEach((a) => a.addEventListener('click', close));
      cleanups.push(() => {
        bg.removeEventListener('click', toggle);
        links.forEach((a) => a.removeEventListener('click', close));
      });
    }

    // Active nav link + guide TOC + reveal
    const observers: IntersectionObserver[] = [];
    const navLinks = Array.from(root.querySelectorAll<HTMLAnchorElement>('.menu a'));
    const sections = ['what', 'guide', 'expect', 'faq']
      .map((id) => root.querySelector<HTMLElement>('#' + id))
      .filter(Boolean) as HTMLElement[];
    const navObs = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            navLinks.forEach((a) => a.classList.toggle('act', a.getAttribute('href') === '#' + e.target.id));
          }
        }),
      { rootMargin: '-45% 0px -50% 0px' },
    );
    sections.forEach((s) => navObs.observe(s));
    observers.push(navObs);

    const tocLinks = Array.from(root.querySelectorAll<HTMLAnchorElement>('#pv-toc a'));
    const tocObs = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            tocLinks.forEach((l) => l.classList.toggle('on', l.getAttribute('href') === '#' + e.target.id));
          }
        }),
      { rootMargin: '-35% 0px -55% 0px' },
    );
    root.querySelectorAll('.gs').forEach((g) => tocObs.observe(g));
    observers.push(tocObs);

    const revealObs = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            revealObs.unobserve(e.target);
          }
        }),
      { threshold: 0.12 },
    );
    root.querySelectorAll('.rv').forEach((el) => revealObs.observe(el));
    observers.push(revealObs);

    // FAQ accordion (answers stay in the DOM for crawlers; CSS collapses them)
    const faqBtns = Array.from(root.querySelectorAll<HTMLButtonElement>('.q button'));
    const onFaq = (ev: Event) => {
      const b = ev.currentTarget as HTMLButtonElement;
      const q = b.parentElement as HTMLElement;
      const wasOpen = q.classList.contains('open');
      root.querySelectorAll('.q').forEach((x) => {
        x.classList.remove('open');
        x.querySelector('button')?.setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        q.classList.add('open');
        b.setAttribute('aria-expanded', 'true');
      }
    };
    faqBtns.forEach((b) => b.addEventListener('click', onFaq));
    cleanups.push(() => faqBtns.forEach((b) => b.removeEventListener('click', onFaq)));

    return () => {
      observers.forEach((o) => o.disconnect());
      cleanups.forEach((fn) => fn());
      root.classList.remove('pv-js');
    };
  }, []);

  return null;
}
