import JsonLd from "@/components/JsonLd";

const FONT = "Poppins, sans-serif";

export const MARKETPLACE_FAQS = [
  {
    question: "What can I sell on the WhoCan Marketplace?",
    answer:
      "Everyday second-hand and new items you no longer need, such as furniture, electronics, tools, sports gear, home goods, and baby items. Add clear photos, an honest condition, and a price. Prohibited and unsafe items are not allowed.",
  },
  {
    question: "How do I post an ad?",
    answer:
      "Open the WhoCan app or sign in on the website, choose Post Ad, add photos, a title, a category, the condition and a price, then pin the pickup location so people nearby can find your item.",
  },
  {
    question: "How do I contact a Seller?",
    answer:
      "Open the listing and use the in-app chat. Ask about condition, pickup time, and whether the price is negotiable before you plan to meet.",
  },
  {
    question: "Where is the Marketplace available?",
    answer:
      "The WhoCan Marketplace is for people across the United States. Items are matched to nearby people using the location the Seller pins on the listing. WhoCan services for hiring local Providers are launching first in Maryland.",
  },
  {
    question: "How can I stay safe when I meet someone?",
    answer:
      "Meet in a public, well-lit place, bring a friend if you can, check the item before you pay, and keep the conversation in the app. If something feels wrong, walk away.",
  },
] as const;

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: MARKETPLACE_FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

export default function MarketplaceSeoContent() {
  return (
    <section
      aria-labelledby="marketplace-about"
      style={{ maxWidth: 860, margin: "0 auto", padding: "56px 20px 72px" }}
    >
      <JsonLd data={faqLd} />
      <h2
        id="marketplace-about"
        style={{
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 26,
          color: "#101828",
          letterSpacing: "-0.02em",
          margin: "0 0 12px",
        }}
      >
        Buy and sell items near you on WhoCan
      </h2>
      <p
        style={{
          fontFamily: FONT,
          fontSize: 16,
          lineHeight: 1.75,
          color: "#475467",
          margin: "0 0 28px",
        }}
      >
        The WhoCan Marketplace is where people across the United States list
        items they no longer need and find things from people nearby. A Seller
        adds photos, a price and a pickup location. A Buyer searches by
        category, condition and price, then chats with the Seller in the app to
        agree on the details.
      </p>
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
        Frequently asked questions
      </h2>
      {MARKETPLACE_FAQS.map((faq) => (
        <div key={faq.question} style={{ marginBottom: 18 }}>
          <h3
            style={{
              fontFamily: FONT,
              fontWeight: 600,
              fontSize: 17,
              color: "#101828",
              margin: "0 0 6px",
            }}
          >
            {faq.question}
          </h3>
          <p
            style={{
              fontFamily: FONT,
              fontSize: 16,
              lineHeight: 1.75,
              color: "#475467",
              margin: 0,
            }}
          >
            {faq.answer}
          </p>
        </div>
      ))}
    </section>
  );
}
