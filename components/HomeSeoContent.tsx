import Link from "next/link";
import { MARYLAND_GUIDES, MARYLAND_HUB_PATH, marylandGuidePath } from "@/lib/marylandGuides";

const FONT = "Poppins, sans-serif";

type InternalLink = { href: string; label: string };

const LINK_GROUPS: { title: string; links: InternalLink[] }[] = [
  {
    title: "Explore WhoCan",
    links: [
      { href: "/explore/favors", label: "Browse favors" },
      { href: "/explore/sellers", label: "Find Providers" },
      { href: "/categories", label: "Service categories" },
      { href: "/marketplace", label: "Marketplace" },
      { href: "/sellers", label: "Offer your services" },
      { href: "/blog", label: "WhoCan blog" },
    ],
  },
  {
    title: "Services in Maryland",
    links: [
      { href: MARYLAND_HUB_PATH, label: "Local services in Maryland" },
      ...MARYLAND_GUIDES.map((guide) => ({
        href: marylandGuidePath(guide.slug),
        label: guide.heading,
      })),
    ],
  },
  {
    title: "Legal & account",
    links: [
      { href: "/privacy-policy", label: "Privacy Policy" },
      { href: "/terms-and-conditions", label: "Terms & Conditions" },
      { href: "/account-deletion", label: "Account deletion" },
    ],
  },
];

/**
 * Server-rendered homepage copy and internal links for crawlers and users.
 * The visible H1 is the hero headline above this section.
 */
export default function HomeSeoContent() {
  return (
    <section
      aria-labelledby="home-seo-heading"
      style={{ background: "#ffffff", padding: "96px 0" }}
    >
      <div className="container">
        <div className="home-seo-layout">
          <div className="home-seo-copy">
            <p
              style={{
                fontFamily: FONT,
                fontWeight: 600,
                fontSize: 13,
                color: "#7C3AED",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                margin: "0 0 8px",
              }}
            >
              About WhoCan
            </p>
            <h2
              id="home-seo-heading"
              style={{
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 36,
                lineHeight: 1.2,
                color: "#101828",
                letterSpacing: "-0.01em",
                margin: "0 0 20px",
              }}
            >
              A local services marketplace,{" "}
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #BF75FF 0%, #A54AFF 50%, #8430E0 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                starting in Maryland
              </span>
            </h2>
            <p
              style={{
                fontFamily: FONT,
                fontSize: 15,
                lineHeight: 1.75,
                color: "#475467",
                margin: "0 0 14px",
              }}
            >
              WhoCan connects Buyers with Providers for local services. Buyers
              search favors, compare what is included, and request a time.
              Providers publish the work they do and the area they cover,
              starting in Maryland.
            </p>
            <p
              style={{
                fontFamily: FONT,
                fontSize: 15,
                lineHeight: 1.75,
                color: "#475467",
                margin: 0,
              }}
            >
              Start with cleaning, handyman tasks, lawn care, or car detailing.
              If you are selling an item rather than booking a person, use the
              marketplace.
            </p>
          </div>

          <nav aria-label="Important pages" className="home-seo-links">
            {LINK_GROUPS.map((group) => (
              <div key={group.title} className="home-seo-group">
                <h3 className="home-seo-group-title">{group.title}</h3>
                <ul className="home-seo-chips">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="home-seo-chip">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </div>

      <style>{`
        .home-seo-layout {
          display: grid;
          grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
          gap: 64px;
          align-items: start;
        }
        .home-seo-links {
          display: flex;
          flex-direction: column;
          gap: 24px;
          padding: 28px;
          background: #FAF5FF;
          border: 1.5px solid #EAD9FF;
          border-radius: 24px;
        }
        .home-seo-group-title {
          font-family: ${FONT};
          font-weight: 600;
          font-size: 12px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #667085;
          margin: 0 0 12px;
        }
        .home-seo-chips {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .home-seo-chip {
          display: inline-block;
          font-family: ${FONT};
          font-weight: 500;
          font-size: 13px;
          line-height: 1.4;
          color: #6D28D9;
          background: #ffffff;
          border: 1.5px solid #EAD9FF;
          border-radius: 9999px;
          padding: 7px 14px;
          text-decoration: none;
          transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
        }
        .home-seo-chip:hover {
          background: #A54AFF;
          border-color: #A54AFF;
          color: #ffffff;
        }
        .home-seo-chip:focus-visible { outline: 2px solid #A54AFF; outline-offset: 2px; }

        @media (max-width: 900px) {
          .home-seo-layout { grid-template-columns: minmax(0, 1fr); gap: 36px; }
        }
        @media (max-width: 600px) {
          .home-seo-links { padding: 20px 16px; border-radius: 20px; }
        }
      `}</style>
    </section>
  );
}
