import type { Metadata } from "next";
import MarylandGuidePage from "@/components/MarylandGuidePage";
import { buildPageMetadata } from "@/lib/seo";
import { MARYLAND_HUB_PATH } from "@/lib/marylandGuides";

const TITLE = "Local Services in Maryland";
const DESCRIPTION =
  "WhoCan is a local services marketplace connecting Buyers and Providers in Maryland for cleaning, handyman work, lawn care, and car detailing.";

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: MARYLAND_HUB_PATH,
});

export default function MarylandPage() {
  return (
    <MarylandGuidePage
      path={MARYLAND_HUB_PATH}
      crumbLabel="Maryland"
      heading="Local services in Maryland"
      lede="WhoCan connects Buyers with Providers for local services, starting in Maryland. You can book a person for a specific job, or publish a service that people nearby can request."
      sections={[
        {
          heading: "For Buyers",
          paragraphs: [
            "Search favors when you already know the job: a house clean, a piece of furniture to assemble, a lawn that needs a cut, or a car that needs a detail. Open the listing, read what is included, and send a request with the address, the time, and anything the Provider cannot see from the title.",
            "Compare profiles on the work itself. A listing that names the rooms, the yard, or the vehicle is easier to book than one that only says “available.” If the job needs a licensed trade, such as new electrical or plumbing work, hire someone who holds that license rather than treating it as a small favor.",
          ],
        },
        {
          heading: "For Providers",
          paragraphs: [
            "Publish the service you actually do and the area you can reach. Maryland is not one neighborhood. A listing that covers a drive you will not make will collect requests you have to decline.",
            "Separate different jobs when the time and price differ. A maintenance mow, a first cut of tall grass, a move-out clean, and a pet-hair detail are not the same offer. Buyers book faster when those are distinct.",
          ],
        },
        {
          heading: "Services to start with",
          paragraphs: [
            "Cleaning, handyman tasks, lawn care, and car detailing are practical first categories because a Buyer can describe the job in a few sentences and a Provider can say yes or no from that description. Each guide below covers what to agree on before the visit.",
            "WhoCan also has a marketplace for buying and selling goods nearby. Use favors when you need a person to do the work, and the marketplace when you are listing an item.",
          ],
        },
      ]}
      links={[
        { href: "/explore/favors", label: "Browse favors" },
        { href: "/explore/sellers", label: "Find Providers" },
        { href: "/sellers", label: "Create a Provider profile" },
        { href: "/marketplace", label: "Nearby marketplace" },
      ]}
    />
  );
}
