export type GuideSection = {
  heading: string;
  paragraphs: string[];
};

export type GuideLink = {
  href: string;
  label: string;
};

export type MarylandGuide = {
  slug: string;
  title: string;
  description: string;
  heading: string;
  lede: string;
  sections: GuideSection[];
};

export const MARYLAND_HUB_PATH = "/maryland";

export const MARYLAND_GUIDES: MarylandGuide[] = [
  {
    slug: "offer-services",
    title: "Offer Services in Maryland",
    description:
      "How Providers list cleaning, handyman, lawn care, and car detailing on WhoCan and get booked by Buyers in Maryland.",
    heading: "Offer local services in Maryland",
    lede:
      "WhoCan is where Providers publish a service and Buyers book it. If you already do the work around Maryland, a clear listing is more useful than a vague profile.",
    sections: [
      {
        heading: "What to put in a listing",
        paragraphs: [
          "Name the job in plain language: house cleaning, furniture assembly, lawn mowing, or interior car detailing. Say what is included, what is not, and the area you can actually reach. Buyers compare listings before they book, so a specific description saves a round of messages.",
          "Add the details a Buyer cannot guess. For cleaning, say whether you bring supplies. For handyman work, list the repairs you take and the ones you refer out. For lawn care, say if you haul clippings. For detailing, say whether you come to the driveway or need a garage.",
        ],
      },
      {
        heading: "How a booking starts",
        paragraphs: [
          "A Buyer searches favors, opens a listing, and requests a time. You see the request with the address, the date, and whatever they wrote about the job. Accept work you can finish, and decline work that is outside your tools, your license, or your travel range.",
          "Keep the service area honest. Maryland includes dense neighborhoods and long drives between towns. A listing that says you cover the whole state will collect requests you cannot reach on time.",
        ],
      },
      {
        heading: "Work that needs a license",
        paragraphs: [
          "Small assembly and routine cleaning are different from electrical, plumbing, structural, and larger home-improvement jobs. Some of that work in Maryland requires a licensed contractor. If a job needs a license, say so on the listing or pass on the request.",
          "WhoCan is the place to publish the service and manage the booking. It does not replace a trade license, insurance, or a written scope when the job calls for one.",
        ],
      },
    ],
  },
  {
    slug: "cleaning",
    title: "House Cleaning in Maryland",
    description:
      "How to book house cleaning on WhoCan in Maryland, and what Buyers and Providers should agree on before the visit.",
    heading: "House cleaning in Maryland",
    lede:
      "A useful cleaning booking names the home, the rooms, and who brings the supplies. WhoCan connects Buyers with cleaning Providers, starting in Maryland.",
    sections: [
      {
        heading: "What to tell a cleaner before you book",
        paragraphs: [
          "Say whether you want a one-time clean, a move-in or move-out, or a repeat visit. List the rooms, the number of bathrooms, and anything that takes longer than a standard wipe-down: ovens, inside the fridge, baseboards, or laundry.",
          "Mention pets, parking, and how the Provider gets in. A locked building with no code, or a home with a dog that needs to be crated, changes the visit. Write that in the request so the time you pick is realistic.",
        ],
      },
      {
        heading: "Supplies, scope, and a walkthrough",
        paragraphs: [
          "Agree on supplies before the day. Some Providers bring their own products. Others expect yours, especially if someone in the home is sensitive to fragrance. If a product should not be used, say so.",
          "Walk the rooms at the start if you are home, or leave a short note if you are not. A cleaner can only finish what was in the request. Adding the garage, the patio, or interior windows on arrival is a different job.",
        ],
      },
      {
        heading: "What cleaning Providers should publish",
        paragraphs: [
          "State the homes you take, the supplies you bring, and the jobs you do not do. Move-out cleans and recurring maintenance cleans are different listings if the time and price are different.",
          "Maryland summers are humid, and mildew in bathrooms is a common reason people book a deeper clean. If you treat mildew, say which rooms that covers. If you do not, say that too.",
        ],
      },
    ],
  },
  {
    slug: "handyman",
    title: "Handyman Services in Maryland",
    description:
      "How to book a handyman on WhoCan in Maryland for assembly, fixture swaps, and small repairs, and which jobs need a licensed trade.",
    heading: "Handyman services in Maryland",
    lede:
      "Handyman work on WhoCan is for defined repairs and assembly: mounting, furniture, door hardware, and similar jobs. It is not a catch-all for unlicensed electrical or plumbing.",
    sections: [
      {
        heading: "Jobs that fit a handyman listing",
        paragraphs: [
          "Furniture assembly, TV mounting, curtain rods, shelf installs, door adjustments, caulking, and replacing a similar fixture are the kinds of tasks a Buyer can describe in one request. Photos of the item, the wall, and the hardware help the Provider bring the right tools.",
          "Say what you already own. If the shelf, the bracket, or the new faucet is on site, the visit is labor. If the Provider is expected to buy parts, that has to be in the request, including who pays for the materials.",
        ],
      },
      {
        heading: "Jobs to send to a licensed trade",
        paragraphs: [
          "New circuits, panel work, gas lines, sewer repairs, and structural changes are not small handyman tasks. In Maryland, home-improvement and trade work above a modest scope often requires a license. Ask before you book, and hire a licensed contractor when the job needs one.",
          "A Provider should say no when the request is outside their skill or their license. Declining is better than a visit that stops halfway because the wall is not what the photo showed.",
        ],
      },
      {
        heading: "How to write the request",
        paragraphs: [
          "Include the address, the room, and a photo. For assembly, the product name is enough if the box is unopened. For a repair, describe what failed: a door that rubs, a loose towel bar, a leak under a sink that you want inspected before anyone opens the wall.",
          "Pick a time when someone can be there if the job needs a decision, such as where a shelf should sit. If you will not be home, say where the items are and how the Provider should leave the space.",
        ],
      },
    ],
  },
  {
    slug: "lawn-care",
    title: "Lawn Care in Maryland",
    description:
      "What to agree on before booking lawn mowing, edging, or leaf cleanup with a WhoCan Provider in Maryland.",
    heading: "Lawn care in Maryland",
    lede:
      "Lawn care bookings work when the yard, the schedule, and the cleanup are specific. WhoCan connects Buyers with lawn Providers, starting in Maryland.",
    sections: [
      {
        heading: "Match the job to the season",
        paragraphs: [
          "In most of Maryland, mowing runs from spring through fall. Growth is fastest in late spring and early summer, then slows. A weekly visit in May can be too often in August if the lawn is dry, and too rare in a wet June.",
          "Fall leaf cleanup is a separate job from mowing. If you want leaves hauled away rather than blown into the woods, say that. Winter is usually a pause for mowing. Use it to book spring cleanup, bed edging, or a first cut once the grass is actually growing.",
        ],
      },
      {
        heading: "What Buyers should specify",
        paragraphs: [
          "Describe the yard: front only, back only, or both, and whether there are gates, slopes, or a fenced dog. Say if clippings should be bagged, left on the lawn, or taken away. Mention irrigation heads, invisible fencing, and toys that should not be mowed over.",
          "If this is a one-time catch-up after weeks of growth, say so. Tall grass takes longer and can need a different mower setting than a maintained lawn. A Provider can price that only if the request is honest.",
        ],
      },
      {
        heading: "What lawn Providers should publish",
        paragraphs: [
          "List mowing, edging, trimming, and haul-away as separate items if you charge them separately. State whether you bring the mower and whether you service small town yards, larger lots, or both.",
          "Skip chemical treatments on a mowing listing unless you are set up for them and the product use is legal for that property. Fertilizer and weed control are a different conversation from a cut.",
        ],
      },
    ],
  },
  {
    slug: "car-detailing",
    title: "Car Detailing in Maryland",
    description:
      "How to book mobile car detailing on WhoCan in Maryland, including what to agree on for interior, exterior, and winter road film.",
    heading: "Car detailing in Maryland",
    lede:
      "Detailing goes better when the package, the vehicle, and the place to work are agreed before the Provider arrives. WhoCan connects Buyers with detailing Providers, starting in Maryland.",
    sections: [
      {
        heading: "Pick a package, not a vague “full detail”",
        paragraphs: [
          "Interior, exterior, or both should be named. Interior usually means vacuum, surfaces, and glass. Exterior usually means a wash and dry. Paint correction, engine bays, pet hair, and stain removal take longer and belong in the request if you need them.",
          "Tell the Provider the vehicle type. A compact car, a three-row SUV, and a work truck are not the same job. If there is more than one vehicle, book each one or say how many are included.",
        ],
      },
      {
        heading: "Where the car will be",
        paragraphs: [
          "Many detailers work in a driveway. They need water access or they bring their own, and they need enough space to open doors. An apartment garage with a time limit, or a street with no hose, should be in the request.",
          "Winter road film and salt are common on Maryland cars after cold months. A maintenance wash and a full decontamination are different. If the paint feels rough or the lower panels are coated, say that so the Provider brings the right wash process.",
        ],
      },
      {
        heading: "What detailing Providers should publish",
        paragraphs: [
          "List the packages you actually offer and the vehicles you turn down. If you are mobile, say what you bring and what the Buyer must provide, such as a hose bib or a covered space in bad weather.",
          "Be specific about add-ons: pet hair, child seats, ceramic spray, and headlight haze. A listing that only says “detail” produces requests you then have to re-quote.",
        ],
      },
    ],
  },
];

export function marylandGuidePath(slug: string): string {
  return `${MARYLAND_HUB_PATH}/${slug}`;
}

export function getMarylandGuide(slug: string): MarylandGuide | undefined {
  return MARYLAND_GUIDES.find((guide) => guide.slug === slug);
}
