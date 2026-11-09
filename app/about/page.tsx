import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { APP_STORE_LINKS } from "@/lib/appStores";
import {
  ORGANIZATION_PROFILES,
  SITE_NAME,
  absoluteUrl,
  buildPageMetadata,
} from "@/lib/seo";

const FONT = "Poppins, sans-serif";
const CONTACT_EMAIL = "contactus@whocan-app.com";

export const metadata: Metadata = buildPageMetadata({
  title: "About Us: Local Services App Starting in Maryland",
  description:
    "WhoCan is a local services marketplace starting in Maryland, operated by WhoCan App LLC. How it works, where it is available, and how to reach us.",
  path: "/about",
});

// Facts only: no user counts, ratings, fees or verification claims (none are confirmed).
const SECTIONS: { heading: string; paragraphs: string[] }[] = [
  {
    heading: "What WhoCan is",
    paragraphs: [
      "WhoCan is a local services marketplace, starting in Maryland. Requesters post a job or browse local Providers for cleaning, handyman work, lawn care and car detailing, compare offers, chat before booking and pay through the app.",
      "Providers list their service, set their own price and accept the requests they want. WhoCan also has a Marketplace where people across the United States can buy and sell items near them.",
    ],
  },
  {
    heading: "How payment works",
    paragraphs: [
      "The Requester pays through the app. The payment is held in escrow while the job is done and released after the Requester approves the job.",
    ],
  },
  {
    heading: "What WhoCan is not",
    paragraphs: [
      "WhoCan does not employ Providers and does not set their prices. Providers work for themselves and are responsible for any license or insurance their work requires. Some home improvement and trade work in Maryland needs a licensed contractor.",
    ],
  },
  {
    heading: "Where it is available",
    paragraphs: [
      "Hiring local Providers: Maryland, USA, where WhoCan is launching first. Which Providers you see depends on your area and changes as more Providers join.",
      "The Marketplace for buying and selling items is open to people across the United States.",
    ],
  },
  {
    heading: "Company",
    paragraphs: [
      "WhoCan is operated by WhoCan App LLC. For questions, partnerships or press, email contactus@whocan-app.com.",
    ],
  },
];

const APPS = [
  {
    name: "WhoCan",
    who: "For Requesters",
    links: APP_STORE_LINKS.buyer,
  },
  {
    name: "WhoCan Provider",
    who: "For Providers",
    links: APP_STORE_LINKS.seller,
  },
];

const PROFILES = [
  { label: "Instagram", href: ORGANIZATION_PROFILES.instagram },
  { label: "Facebook", href: ORGANIZATION_PROFILES.facebook },
  { label: "Threads", href: ORGANIZATION_PROFILES.threads },
  { label: "YouTube", href: ORGANIZATION_PROFILES.youtube },
];

const linkStyle = {
  color: "#8430E0",
  fontWeight: 600,
  textDecoration: "underline",
} as const;

export default function AboutPage() {
  const aboutLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About WhoCan",
    url: absoluteUrl("/about"),
    mainEntity: {
      "@type": "Organization",
      name: SITE_NAME,
      legalName: "WhoCan App LLC",
      url: absoluteUrl("/"),
      email: CONTACT_EMAIL,
      areaServed: { "@type": "State", name: "Maryland" },
    },
  };

  return (
    <>
      <JsonLd data={aboutLd} />
      <Navbar />
      <main style={{ background: "#FAFAFA", minHeight: "100vh" }}>
        <div
          className="container"
          style={{ maxWidth: 760, padding: "120px 20px 80px", fontFamily: FONT }}
        >
          <h1
            style={{
              fontWeight: 800,
              fontSize: 40,
              lineHeight: 1.15,
              color: "#101828",
              marginBottom: 16,
            }}
          >
            About WhoCan
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.7, color: "#475467", marginBottom: 40 }}>
            A local services marketplace, starting in Maryland. Requesters post a
            job, local Providers send offers, and payment is held in escrow until
            the Requester approves the job.
          </p>

          {SECTIONS.map((section) => (
            <section key={section.heading} style={{ marginBottom: 32 }}>
              <h2 style={{ fontWeight: 700, fontSize: 24, color: "#101828", marginBottom: 12 }}>
                {section.heading}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  style={{ fontSize: 16, lineHeight: 1.75, color: "#344054", marginBottom: 12 }}
                >
                  {paragraph}
                </p>
              ))}
            </section>
          ))}

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontWeight: 700, fontSize: 24, color: "#101828", marginBottom: 12 }}>
              Get the apps
            </h2>
            <ul style={{ paddingLeft: 20, lineHeight: 2, color: "#344054" }}>
              {APPS.map((app) => (
                <li key={app.name}>
                  <strong>{app.name}</strong> ({app.who}):{" "}
                  <a href={app.links.apple} style={linkStyle}>
                    iPhone
                  </a>{" "}
                  ·{" "}
                  <a href={app.links.play} style={linkStyle}>
                    Android
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 style={{ fontWeight: 700, fontSize: 24, color: "#101828", marginBottom: 12 }}>
              More
            </h2>
            <ul style={{ paddingLeft: 20, lineHeight: 2, color: "#344054" }}>
              <li>
                <Link href="/sellers" style={linkStyle}>
                  List your service as a Provider
                </Link>
              </li>
              <li>
                <Link href="/maryland" style={linkStyle}>
                  Local services in Maryland
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" style={linkStyle}>
                  Privacy policy
                </Link>{" "}
                ·{" "}
                <Link href="/terms-and-conditions" style={linkStyle}>
                  Terms and conditions
                </Link>
              </li>
              <li>
                Follow WhoCan:{" "}
                {PROFILES.map((profile, index) => (
                  <span key={profile.label}>
                    {index > 0 ? " · " : ""}
                    <a href={profile.href} style={linkStyle} rel="noopener noreferrer">
                      {profile.label}
                    </a>
                  </span>
                ))}
              </li>
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
