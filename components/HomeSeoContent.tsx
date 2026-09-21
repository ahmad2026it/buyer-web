import Link from "next/link";

const FONT = "Poppins, sans-serif";

const INTERNAL_LINKS = [
  { href: "/explore/favors", label: "Browse favors" },
  { href: "/explore/sellers", label: "Find sellers" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/categories", label: "Service categories" },
  { href: "/blog", label: "WhoCan blog" },
  { href: "/articles/how-it-works", label: "How WhoCan works" },
  { href: "/sellers", label: "Become a seller" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-and-conditions", label: "Terms & Conditions" },
  { href: "/account-deletion", label: "Account deletion" },
] as const;

/**
 * Server-rendered homepage copy and internal links for crawlers and users.
 * Includes the page H1 so it is always present in the initial HTML.
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
        <h1
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
          Find local handymen and home services near you
        </h1>
        <p
          style={{
            fontFamily: FONT,
            fontSize: 16,
            lineHeight: 1.75,
            color: "#475467",
            margin: "0 0 16px",
          }}
        >
          WhoCan helps you find and book local handymen and service providers for
          cleaning, repairs, furniture assembly, electrical work, gardening, and
          more. Browse available favors, compare profiles, and schedule help when
          you need it.
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
          Prefer to buy or sell goods nearby? Use the marketplace. Looking for
          tips before you book? Read guides on the blog, or start with how WhoCan
          works.
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
                    color: "#A54AFF",
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
