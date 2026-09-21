import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Account Deletion",
  description:
    "Learn how to request permanent deletion of your WhoCan buyer account and related data.",
  path: "/account-deletion",
});

const FONT = "Poppins, sans-serif";
const CONTACT_EMAIL = "contactus@whocan-app.com";

const steps = [
  "Open the WhoCan buyer app or sign in on the website.",
  "Go to Profile → Security (or Account settings).",
  "Choose Delete account and follow the confirmation steps.",
  "If you cannot access your account, email us from the address linked to your WhoCan account.",
];

export default function AccountDeletionPage() {
  return (
    <>
      <Navbar />
      <main
        style={{
          background: "#F9FAFB",
          minHeight: "100vh",
          paddingTop: 100,
          paddingBottom: 64,
        }}
      >
        <article className="container" style={{ maxWidth: 720 }}>
          <h1
            style={{
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 36,
              lineHeight: 1.2,
              color: "#101828",
              letterSpacing: "-0.02em",
              margin: "0 0 16px",
            }}
          >
            Account deletion
          </h1>
          <p
            style={{
              fontFamily: FONT,
              fontSize: 16,
              lineHeight: 1.75,
              color: "#475467",
              margin: "0 0 28px",
            }}
          >
            You can request permanent deletion of your WhoCan buyer account at
            any time. This page explains how to submit a request and what happens
            next.
          </p>

          <h2
            style={{
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 22,
              color: "#101828",
              margin: "0 0 14px",
            }}
          >
            How to delete your account
          </h2>
          <ol
            style={{
              fontFamily: FONT,
              fontSize: 15,
              lineHeight: 1.8,
              color: "#344054",
              paddingLeft: 22,
              margin: "0 0 28px",
            }}
          >
            {steps.map((step) => (
              <li key={step} style={{ marginBottom: 10 }}>
                {step}
              </li>
            ))}
          </ol>

          <h2
            style={{
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 22,
              color: "#101828",
              margin: "0 0 14px",
            }}
          >
            Request by email
          </h2>
          <p
            style={{
              fontFamily: FONT,
              fontSize: 15,
              lineHeight: 1.8,
              color: "#344054",
              margin: "0 0 12px",
            }}
          >
            Email{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=Account%20deletion%20request`}
              style={{ color: "#A54AFF", fontWeight: 600 }}
            >
              {CONTACT_EMAIL}
            </a>{" "}
            with the subject line &quot;Account deletion request&quot;. Include
            the email or phone number associated with your WhoCan account so we
            can verify ownership.
          </p>

          <h2
            style={{
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 22,
              color: "#101828",
              margin: "28px 0 14px",
            }}
          >
            What we delete
          </h2>
          <p
            style={{
              fontFamily: FONT,
              fontSize: 15,
              lineHeight: 1.8,
              color: "#344054",
              margin: "0 0 12px",
            }}
          >
            After verification, we permanently delete or anonymize account
            profile data associated with your buyer account, subject to legal
            retention requirements (for example, records needed for disputes,
            payments, or regulatory compliance). Marketplace listings, bookings,
            and messages tied to your account are handled according to our{" "}
            <Link
              href="/privacy-policy"
              style={{ color: "#A54AFF", fontWeight: 600 }}
            >
              Privacy Policy
            </Link>
            .
          </p>

          <p
            style={{
              fontFamily: FONT,
              fontSize: 15,
              lineHeight: 1.8,
              color: "#344054",
              margin: "24px 0 0",
            }}
          >
            For full terms of use, see our{" "}
            <Link
              href="/terms-and-conditions"
              style={{ color: "#A54AFF", fontWeight: 600 }}
            >
              Terms &amp; Conditions
            </Link>
            .
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
