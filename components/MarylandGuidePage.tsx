import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { absoluteUrl } from "@/lib/seo";
import {
  MARYLAND_GUIDES,
  MARYLAND_HUB_PATH,
  marylandGuidePath,
  type GuideLink,
  type GuideSection,
} from "@/lib/marylandGuides";

const FONT = "Poppins, sans-serif";

type MarylandGuidePageProps = {
  heading: string;
  lede: string;
  path: string;
  sections: GuideSection[];
  links: GuideLink[];
  crumbLabel: string;
};

export default function MarylandGuidePage({
  heading,
  lede,
  path,
  sections,
  links,
  crumbLabel,
}: MarylandGuidePageProps) {
  const pageUrl = absoluteUrl(path);
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Maryland",
        item: absoluteUrl(MARYLAND_HUB_PATH),
      },
      ...(path === MARYLAND_HUB_PATH
        ? []
        : [
            {
              "@type": "ListItem",
              position: 3,
              name: crumbLabel,
              item: pageUrl,
            },
          ]),
    ],
  };

  const otherGuides = MARYLAND_GUIDES.filter(
    (guide) => marylandGuidePath(guide.slug) !== path,
  );

  return (
    <>
      <JsonLd data={breadcrumbLd} />
      <Navbar />
      <main style={{ minHeight: "100dvh", background: "#FAFAFA" }}>
        <header className="listing-page-hero">
          <div className="listing-page-inner" style={{ maxWidth: 760 }}>
            <p
              style={{
                fontFamily: FONT,
                fontWeight: 600,
                fontSize: 13,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "#A54AFF",
                margin: "0 0 10px",
              }}
            >
              <Link href="/" style={{ color: "#667085", textDecoration: "none" }}>
                Home
              </Link>
              {" / "}
              {path === MARYLAND_HUB_PATH ? (
                "Maryland"
              ) : (
                <Link
                  href={MARYLAND_HUB_PATH}
                  style={{ color: "#667085", textDecoration: "none" }}
                >
                  Maryland
                </Link>
              )}
            </p>
            <h1 className="listing-page-title" style={{ marginBottom: 12 }}>
              {heading}
            </h1>
            <p
              style={{
                fontFamily: FONT,
                fontSize: 17,
                lineHeight: 1.7,
                color: "#475467",
                margin: 0,
              }}
            >
              {lede}
            </p>
          </div>
        </header>
        <article className="listing-page-body" style={{ maxWidth: 760 }}>
          {sections.map((section) => (
            <section key={section.heading} style={{ marginBottom: 36 }}>
              <h2
                style={{
                  fontFamily: FONT,
                  fontWeight: 700,
                  fontSize: 22,
                  color: "#101828",
                  letterSpacing: "-0.02em",
                  margin: "0 0 12px",
                }}
              >
                {section.heading}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  style={{
                    fontFamily: FONT,
                    fontSize: 16,
                    lineHeight: 1.75,
                    color: "#475467",
                    margin: "0 0 14px",
                  }}
                >
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
          <nav aria-label="Related pages" style={{ marginTop: 12 }}>
            <h2
              style={{
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 18,
                color: "#101828",
                margin: "0 0 12px",
              }}
            >
              Continue
            </h2>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 }}>
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    style={{
                      fontFamily: FONT,
                      fontSize: 15,
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
              {otherGuides.map((guide) => (
                <li key={guide.slug}>
                  <Link
                    href={marylandGuidePath(guide.slug)}
                    style={{
                      fontFamily: FONT,
                      fontSize: 15,
                      fontWeight: 600,
                      color: "#6D28D9",
                      textDecoration: "underline",
                      textUnderlineOffset: 3,
                    }}
                  >
                    {guide.heading}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </article>
      </main>
      <Footer />
    </>
  );
}
