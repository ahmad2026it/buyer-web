# buyer-web — Component Operating Guide

This document governs engineering practices and conventions for the **buyer-web** component.

---

## 1. Technical Stack

- **Framework**: Next.js 15.3.9 (App Router)
- **UI & Runtime**: React 18.3.1, TypeScript 5
- **Styling**: Tailwind CSS v4.3.3 (`@tailwindcss/postcss`), Emotion / Material UI v9 (`@mui/material`, `@mui/icons-material`, `@mui/material-nextjs`)
- **State Management**: Redux Toolkit 2.12.0 (`@reduxjs/toolkit`, `react-redux`, `redux-persist`)
- **HTTP & Realtime**: Axios 1.19.0, Socket.io-client 4.8.3
- **Payment & Forms**: Stripe React (`@stripe/react-stripe-js`, `@stripe/stripe-js`), Formik 2.4.9, Yup 1.7.1, SweetAlert2
- **Notifications**: Firebase 12.17.1 (Cloud Messaging / Service Worker in `public/firebase-messaging-sw.js`)
- **Maps**: `@react-google-maps/api` 2.20.8

---

## 2. Directory Structure & Architecture

```text
buyer-web/
├── app/                        # Next.js App Router routes & layouts
│   ├── (public pages)          # page.tsx, maryland/, explore/, blog/, categories/, sellers/
│   ├── (auth pages)            # auth/login, auth/signup, auth/forgot-password, register/
│   ├── (buyer core)            # bookings/, booking/[favorId], custom-favors/, marketplace/
│   ├── (account & support)     # profile/, billing/, favorites/, disputes/, chat/
│   ├── api/indexnow/sync/      # IndexNow search engine indexing API route
│   ├── layout.tsx              # Root HTML wrapper with Redux/MUI providers
│   ├── robots.ts & sitemap.ts  # Dynamic crawlability and XML sitemap configuration
│   └── globals.css             # Global Tailwind v4 styles and tokens
├── components/                 # Reusable UI sections, cards, modals, and SEO helpers
│   ├── JsonLd.tsx              # Structured Schema.org JSON-LD injector
│   ├── MarylandGuidePage.tsx   # Maryland localized landing page template
│   └── ...
├── design-system/              # Untitled UI PRO v4 tokens and component definitions
├── lib/                        # Client infrastructure
│   ├── axios.ts                # Centralized Axios instance with auth/error interceptors
│   ├── buyerSocket.ts          # Socket.io connection manager
│   ├── fcm.ts                  # Firebase Cloud Messaging token handling
│   ├── marylandGuides.ts       # Local Maryland service content & SEO data
│   ├── seo.ts                  # Metadata generators & OpenGraph configuration
│   └── stripe.ts               # Stripe client loader
├── store/                      # Redux Toolkit store, persisted slices, and typed hooks
└── public/                     # Static media, icons, and service workers
```

---

## 3. Verified Verification Commands

| Command | Action | Verified Baseline Status |
|---|---|---|
| `npx tsc --noEmit` | Static TypeScript validation | **PASSED** (Exit code 0, 0 errors) |
| `npm run build` | Next.js production build | **PASSED** (Exit code 0, 43 static/dynamic routes compiled) |
| `npm run dev` | Local development server | Standard Next.js dev server (port 3000) |
| `npm run lint` | ESLint static analysis | **PASSED** (Configured non-interactive `.eslintrc.json` extending `next/core-web-vitals`; exit code 0) |

---

## 4. Key Engineering Conventions

1. **Client vs Server Components**:
   - Explicitly tag interactive components with `'use client';` at the top of the file.
   - Keep page metadata generation (`generateMetadata`) in Server Components.
2. **SEO & Structured Data**:
   - Inject Schema.org JSON-LD using `<JsonLd schema={...} />`.
   - Dynamic canonical tags and OpenGraph configurations must reference `process.env.NEXT_PUBLIC_SITE_URL`.
   - Maryland geographic landing pages (`app/maryland/[slug]/page.tsx`) must strictly use verified service copy from `lib/marylandGuides.ts`.
3. **API & Realtime Calls**:
   - Make all HTTP calls through `@/lib/axios` (`api` instance). Never instantiate raw `axios` in pages.
   - Bearer authentication is attached automatically from Redux state via `getAuthToken()`.
   - Realtime chats and status changes must respect `buyerSocket.ts` and handle reconnection states cleanly.
4. **Environment Variables**:
   - Required names: `API_URL`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_API_ORIGIN`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, `NEXT_PUBLIC_FIREBASE_*`, `INDEXNOW_SYNC_SECRET`.
   - Never hardcode or print secret values.
5. **Git Operations & Repository Isolation**:
   - Always execute Git commands from the repository root: `/Users/mubeentariq/Documents/whocan/buyer-web`.
   - Remember that `git add` stages changes into the index, while destructive operations (`git restore`, `git reset --hard`, `git checkout --`) discard local edits.
   - Track upstream branch `main` at `https://github.com/ahmad2026it/buyer-web`.
