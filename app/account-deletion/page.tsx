import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { APP_STORE_LINKS } from "@/lib/appStores";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Account Deletion",
  description:
    "Request permanent deletion of your WhoCan Buyer or WhoCan Seller account and related data.",
  path: "/account-deletion",
});

const FONT = "Poppins, sans-serif";
const CONTACT_EMAIL = "contactus@whocan-app.com";

const buyerSteps = [
  "Open the WhoCan Buyer app, or sign in on this website.",
  "Go to Profile → Security (or Account settings).",
  "Choose Delete account and follow the confirmation steps.",
];

const sellerSteps = [
  "Open the WhoCan Seller app.",
  "Go to Profile → Settings.",
  "Choose Delete account and follow the confirmation steps.",
];

const headingStyle = {
  fontFamily: FONT,
  fontWeight: 700,
  fontSize: 22,
  color: "#101828",
  margin: "28px 0 14px",
} as const;

const bodyStyle = {
  fontFamily: FONT,
  fontSize: 15,
  lineHeight: 1.8,
  color: "#344054",
  margin: "0 0 12px",
} as const;

function StepList({ steps }: { steps: string[] }) {
  return (
    <ol
      style={{
        fontFamily: FONT,
        fontSize: 15,
        lineHeight: 1.8,
        color: "#344054",
        paddingLeft: 22,
        margin: "0 0 8px",
      }}
    >
      {steps.map((step) => (
        <li key={step} style={{ marginBottom: 10 }}>
          {step}
        </li>
      ))}
    </ol>
  );
}

function StoreLinks({
  apple,
  play,
  appleLabel,
  playLabel,
}: {
  apple: string;
  play: string;
  appleLabel: string;
  playLabel: string;
}) {
  const linkStyle = { color: "#A54AFF", fontWeight: 600 as const };
  return (
    <p style={bodyStyle}>
      <a href={apple} style={linkStyle}>
        {appleLabel}
      </a>
      {" · "}
      <a href={play} style={linkStyle}>
        {playLabel}
      </a>
    </p>
  );
}

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
              margin: "0 0 12px",
            }}
          >
            You can request permanent deletion of a WhoCan Buyer account or a
            WhoCan Seller account. Buyer and Seller are separate apps. If you
            use both, delete each account or say so in your email.
          </p>

          <h2 style={headingStyle}>WhoCan Buyer app</h2>
          <p style={bodyStyle}>
            Use these steps in the Buyer app, which people use to find services,
            post favors, and shop the marketplace.
          </p>
          <StepList steps={buyerSteps} />
          <StoreLinks
            apple={APP_STORE_LINKS.buyer.apple}
            play={APP_STORE_LINKS.buyer.play}
            appleLabel="Buyer app on the App Store"
            playLabel="Buyer app on Google Play"
          />

          <h2 style={headingStyle}>WhoCan Seller app</h2>
          <p style={bodyStyle}>
            Use these steps in the Seller app, which people use to offer
            services and manage jobs.
          </p>
          <StepList steps={sellerSteps} />
          <StoreLinks
            apple={APP_STORE_LINKS.seller.apple}
            play={APP_STORE_LINKS.seller.play}
            appleLabel="Seller app on the App Store"
            playLabel="Seller app on Google Play"
          />

          <h2 style={headingStyle}>Request by email</h2>
          <p style={bodyStyle}>
            If you cannot open the app, email{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=Account%20deletion%20request`}
              style={{ color: "#A54AFF", fontWeight: 600 }}
            >
              {CONTACT_EMAIL}
            </a>{" "}
            with the subject line &quot;Account deletion request&quot;. Include
            the email or phone number on the account, and say whether the
            request is for the Buyer app, the Seller app, or both.
          </p>

          <h2 style={headingStyle}>What we delete</h2>
          <p style={bodyStyle}>
            After we confirm the request is yours, we permanently delete or
            anonymize the profile data for that account. For a Buyer account
            that includes your buyer profile. For a Seller account that
            includes your seller profile and the services you listed. Some
            records may be kept when the law requires it, including records
            needed for disputes, payments, or regulatory compliance.
          </p>
          <p style={bodyStyle}>
            Bookings, marketplace listings, and messages tied to the account
            are handled according to our{" "}
            <Link
              href="/privacy-policy"
              style={{ color: "#A54AFF", fontWeight: 600 }}
            >
              Privacy Policy
            </Link>
            .
          </p>

          <p style={{ ...bodyStyle, marginTop: 24 }}>
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
