import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    absolute: "Page gone — WhoCan",
  },
  description: "This page has been permanently removed from WhoCan.",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function GonePage() {
  return (
    <>
      <Navbar />
      <main
        style={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F9FAFB",
          padding: "120px 24px 80px",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 480 }}>
          <p
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 700,
              fontSize: 14,
              color: "#A54AFF",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              margin: "0 0 12px",
            }}
          >
            410
          </p>
          <h1
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 700,
              fontSize: 32,
              color: "#101828",
              margin: "0 0 12px",
              letterSpacing: "-0.02em",
            }}
          >
            This page is gone
          </h1>
          <p
            style={{
              fontFamily: "Poppins, sans-serif",
              fontSize: 16,
              lineHeight: 1.7,
              color: "#475467",
              margin: "0 0 28px",
            }}
          >
            This page was removed and is no longer available. You can continue
            from the WhoCan homepage.
          </p>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "Poppins, sans-serif",
              fontWeight: 600,
              fontSize: 14,
              color: "#fff",
              background:
                "linear-gradient(135deg,#BF75FF 0%,#A54AFF 50%,#8430E0 100%)",
              borderRadius: 9999,
              padding: "12px 28px",
              textDecoration: "none",
            }}
          >
            Back to home
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
