import Link from "next/link";
import { MARYLAND_GUIDES, MARYLAND_HUB_PATH, marylandGuidePath } from "@/lib/marylandGuides";

const FONT = "Poppins, sans-serif";

const INTERNAL_LINKS = [
  { href: MARYLAND_HUB_PATH, label: "Local services in Maryland" },
  { href: "/explore/favors", label: "Browse favors" },
  { href: "/explore/sellers", label: "Find Providers" },
  { href: "/sellers", label: "Offer your services" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/categories", label: "Service categories" },
  { href: "/blog", label: "WhoCan blog" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-and-conditions", label: "Terms & Conditions" },
  { href: "/account-deletion", label: "Account deletion" },
  ...MARYLAND_GUIDES.map((guide) => ({
    href: marylandGuidePath(guide.slug),
    label: guide.heading,
  })),
] as const;

/**
 * Server-rendered homepage copy and internal links for crawlers and users.
 * The visible H1 is the hero headline above this section.
 */
export default function HomeSeoContent() {
  return (
    <section
      aria-labelledby="home-seo-heading"
      style={{
        background: "#FFFFFF",
        borderTop: "1px solid #EAECF0",
        borderBottom: "1px solid #EAECF0",
        padding: "56px 0",
      }}
    >
      <div className="container" style={{ maxWidth: 720 }}>
        <h2
          id="home-seo-heading"
          style={{
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 28,
            lineHeight: 1.25,
            color: "#101828",
            margin: "0 0 16px",
            letterSpacing: "-0.02em",
          }}
        >
          A local services marketplace, starting in Maryland
        </h2>
        <p
          style={{
            fontFamily: FONT,
            fontSize: 16,
            lineHeight: 1.75,
            color: "#475467",
            margin: "0 0 16px",
          }}
        >
          WhoCan connects Buyers with Providers for local services. Buyers
          search favors, compare what is included, and request a time.
          Providers publish the work they do and the area they cover, starting
          in Maryland.
        </p>
        <p
          style={{
            fontFamily: FONT,
            fontSize: 16,
            lineHeight: 1.75,
            color: "#475467",
            margin: "0 0 28px",
          }}
        >
          Start with cleaning, handyman tasks, lawn care, or car detailing.
          If you are selling an item rather than booking a person, use the
          marketplace.
        </p>
        <nav aria-label="Important pages">
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "flex",
              flexWrap: "wrap",
              gap: "10px 20px",
            }}
          >
            {INTERNAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  style={{
                    fontFamily: FONT,
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#6D28D9",
                    textDecoration: "underline",
                    textUnderlineOffset: 3,
                  }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
