type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

/**
 * Renders JSON-LD for search engines. Use for Organization, WebSite, FAQ, etc.
 * Keep payloads accurate — do not invent ratings, reviews, or unsupported claims.
 */
export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
