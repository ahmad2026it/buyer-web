export type GuideSection = {
  heading: string;
  paragraphs: string[];
};

export type GuideFaq = {
  question: string;
  answer: string;
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
  /** Optional. Rendered on the page and emitted as FAQPage JSON-LD. */
  faqs?: GuideFaq[];
};

export const MARYLAND_HUB_PATH = "/maryland";

export const MARYLAND_GUIDES: MarylandGuide[] = [
  {
    slug: "offer-services",
    title: "Offer Services in Maryland",
    description:
      "How Providers list cleaning, handyman, lawn care, and car detailing on WhoCan and get booked by Requesters in Maryland.",
    heading: "Offer local services in Maryland",
    lede:
      "WhoCan is where Providers publish a service and Requesters book it. If you already do the work around Maryland, a clear listing is more useful than a vague profile.",
    sections: [
      {
        heading: "What to put in a listing",
        paragraphs: [
          "Name the job in plain language: house cleaning, furniture assembly, lawn mowing, or interior car detailing. Say what is included, what is not, and the area you can actually reach. Requesters compare listings before they book, so a specific description saves a round of messages.",
          "Add the details a Requester cannot guess. For cleaning, say whether you bring supplies. For handyman work, list the repairs you take and the ones you refer out. For lawn care, say if you haul clippings. For detailing, say whether you come to the driveway or need a garage.",
        ],
      },
      {
        heading: "How a booking starts",
        paragraphs: [
          "A Requester searches favors, opens a listing, and requests a time. You see the request with the address, the date, and whatever they wrote about the job. Accept work you can finish, and decline work that is outside your tools, your license, or your travel range.",
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
    title: "House Cleaning in Maryland: Book a Local Cleaner",
    description:
      "Book house cleaning in Maryland: one-time, deep, move-out or recurring. Describe the home, compare offers from local Providers, chat first and pay in the app.",
    heading: "House cleaning in Maryland",
    lede:
      "Need a house cleaner in Maryland? On WhoCan you describe the home and the rooms, compare offers from local cleaning Providers, chat before you book and pay through the app. Payment is held in escrow until the job is done. A useful request names the type of clean and who brings the supplies.",
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
      {
        heading: "Deep cleaning and move-out cleaning",
        paragraphs: [
          "A deep clean covers the places a regular visit skips: inside the oven and fridge, baseboards, cabinet fronts, grout and window tracks. It takes longer, so name the extras in the request instead of adding them on the day.",
          "A move-out clean is usually an empty home cleaned for the next people. If a landlord or property manager has a checklist, attach it to the request so the Provider can price the same list.",
        ],
      },
      {
        heading: "What affects the price of a house cleaning",
        paragraphs: [
          "The price usually depends on the size of the home, the number of bathrooms, how long since the last clean, pets, add-ons such as the oven, the fridge or interior windows, and whether the Provider brings supplies.",
          "Ask for a price for the whole visit and confirm in the chat what is included. WhoCan does not set Provider prices, so compare the offers you receive and read each description.",
        ],
      },
      {
        heading: "House cleaning around Maryland",
        paragraphs: [
          "WhoCan is launching in Maryland, and which Providers you see depends on your area. Requesters in places such as Baltimore, Annapolis, Columbia, Towson and Glen Burnie can post a request and see who responds, but availability varies by town and by week.",
          "If nobody is listed near you yet, post the job anyway with the rooms and the date. Local Providers can respond when they are free, and you can compare before you choose.",
        ],
      },
    ],
    faqs: [
      {
        question: "How do I book a house cleaner in Maryland on WhoCan?",
        answer:
          "Describe the home, the rooms and the type of clean, browse cleaning listings or post a request, compare the offers you get, chat with the Provider, and pay through the app.",
      },
      {
        question: "What is the difference between a regular clean and a deep clean?",
        answer:
          "A regular clean keeps surfaces, floors, kitchen and bathrooms tidy. A deep clean adds the inside of the oven and fridge, baseboards, cabinet fronts and grout, so it takes longer.",
      },
      {
        question: "Do cleaners bring their own supplies?",
        answer:
          "Some do and some expect yours. Check the listing and agree in the chat before the visit, especially if a product should not be used in your home.",
      },
      {
        question: "How much does house cleaning cost in Maryland?",
        answer:
          "It depends on the size of the home, the type of clean and any add-ons. Published local rates vary widely, so compare the offers you receive and what each includes.",
      },
      {
        question: "How does payment work?",
        answer:
          "You pay through the app, and the payment is held in escrow until the job is done.",
      },
    ],
  },
  {
    slug: "handyman",
    title: "Handyman Services in Maryland: Book Local Help",
    description:
      "Book a handyman online in Maryland for assembly, mounting, fixture swaps and small repairs. Describe the job, compare local offers, chat first and pay through the app.",
    heading: "Book a handyman in Maryland",
    lede:
      "Looking for a handyman app in Maryland? On WhoCan you describe the job, compare offers from local Providers, chat before you book and pay through the app. It is built for defined repairs and assembly, not for unlicensed electrical or plumbing.",
    sections: [
      {
        heading: "Jobs that fit a handyman listing",
        paragraphs: [
          "Furniture assembly, TV mounting, curtain rods, shelf installs, door adjustments, caulking, and replacing a similar fixture are the kinds of tasks a Requester can describe in one request. Photos of the item, the wall, and the hardware help the Provider bring the right tools.",
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
    faqs: [
      {
        question: "How do I book a handyman in Maryland on WhoCan?",
        answer:
          "Describe the job with a photo, browse handyman listings or post a request, compare the offers you get, chat with the Provider, and pay through the app.",
      },
      {
        question: "What jobs can a handyman do?",
        answer:
          "Typical jobs are furniture assembly, TV and shelf mounting, door hardware, caulking and swapping a similar fixture. Electrical, plumbing, gas and structural work usually needs a licensed trade.",
      },
      {
        question: "Does my handyman job need a license in Maryland?",
        answer:
          "Some home improvement and trade work in Maryland requires a license. Ask the Provider what they are licensed to do and check the current rules with the Maryland Home Improvement Commission before booking larger work.",
      },
      {
        question: "How do I get a clear price?",
        answer:
          "Ask for a price for the whole job, not only an hourly rate, and confirm what is included and who buys the materials in the chat before the visit.",
      },
      {
        question: "How does payment work?",
        answer:
          "You pay through the app, and the payment is held in escrow until the job is done.",
      },
    ],
  },
  {
    slug: "lawn-care",
    title: "Lawn Care and Leaf Cleanup in Maryland",
    description:
      "Book lawn mowing, edging and fall leaf cleanup in Maryland. Describe the yard, compare offers from local Providers, chat first and pay through the app.",
    heading: "Lawn care in Maryland",
    lede:
      "Need lawn mowing or leaf cleanup in Maryland? On WhoCan you describe the yard, compare offers from local lawn Providers, chat before you book and pay through the app. Payment is held in escrow until the job is done. In fall, say whether leaves should be hauled away, mulched or left at the curb.",
    sections: [
      {
        heading: "Match the job to the season",
        paragraphs: [
          "In most of Maryland, mowing runs from spring through fall. Growth is fastest in late spring and early summer, then slows. A weekly visit in May can be too often in August if the lawn is dry, and too rare in a wet June.",
          "Fall leaf cleanup is a separate job from mowing. If you want leaves hauled away rather than blown into the woods, say that. Winter is usually a pause for mowing. Use it to book spring cleanup, bed edging, or a first cut once the grass is actually growing.",
        ],
      },
      {
        heading: "What Requesters should specify",
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
      {
        heading: "Fall leaf cleanup",
        paragraphs: [
          "Say how big the yard is, whether the leaves are on the lawn, in the beds or both, and what should happen to them: hauled away, mulched into the lawn, or moved to the curb. A yard with many large trees may need a second visit after the last leaves drop.",
          "Counties and towns in Maryland have their own rules for yard waste and leaf collection. Check your local schedule before asking a Provider to leave piles or bags at the curb.",
        ],
      },
      {
        heading: "What affects the price of lawn care",
        paragraphs: [
          "Lot size, grass height, slopes and obstacles, how often the visit repeats, and whether clippings or leaves are hauled away all change the price. A first cut after weeks of growth takes longer than a regular visit.",
          "Ask for a price for the exact job and confirm in the chat what is included. WhoCan does not set Provider prices, so compare the offers you receive.",
        ],
      },
      {
        heading: "Lawn care around Maryland",
        paragraphs: [
          "WhoCan is launching in Maryland, and which Providers you see depends on your area. Requesters in places such as Annapolis, Pasadena, Severn, Columbia and Towson can post a request and see who responds, but availability varies by town and by week.",
          "If nobody is listed near you yet, post the job anyway with a photo of the yard. Local Providers can respond when they are free, and you can compare before you choose.",
        ],
      },
    ],
    faqs: [
      {
        question: "How do I book lawn care in Maryland on WhoCan?",
        answer:
          "Describe the yard with a photo, browse lawn care listings or post a request, compare the offers you get, chat with the Provider, and pay through the app.",
      },
      {
        question: "When should I book fall leaf cleanup in Maryland?",
        answer:
          "Most leaves come down from late October into December, depending on the trees. Book once most have dropped, and ask about a second visit if you have many large trees.",
      },
      {
        question: "Will the Provider haul away clippings and leaves?",
        answer:
          "Only if the listing or the request says so. Ask in the chat whether haul-away is included before you book.",
      },
      {
        question: "How much does lawn mowing cost?",
        answer:
          "It depends on lot size, grass height and how often the visit repeats. Compare the offers you receive and what each includes.",
      },
      {
        question: "How does payment work?",
        answer:
          "You pay through the app, and the payment is held in escrow until the job is done.",
      },
    ],
  },
  {
    slug: "car-detailing",
    title: "Mobile Car Detailing in Maryland: Book at Home",
    description:
      "Book mobile car detailing in Maryland at your home or driveway. Agree the package, compare local offers, chat first and pay through the app.",
    heading: "Mobile car detailing in Maryland",
    lede:
      "Want car detailing at home in Maryland? Agree the package, the vehicle and the place to work, then compare offers from local Providers and pay through the app on WhoCan.",
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
          "List the packages you actually offer and the vehicles you turn down. If you are mobile, say what you bring and what the Requester must provide, such as a hose bib or a covered space in bad weather.",
          "Be specific about add-ons: pet hair, child seats, ceramic spray, and headlight haze. A listing that only says “detail” produces requests you then have to re-quote.",
        ],
      },
    ],
    faqs: [
      {
        question: "Can I get my car detailed at home in Maryland?",
        answer:
          "Many mobile detailers work in a driveway. Check that the listing says the Provider comes to you, and tell them about water access and space in the request.",
      },
      {
        question: "What is the difference between interior, exterior and a full detail?",
        answer:
          "Interior usually means vacuum, surfaces and glass. Exterior usually means a wash and dry. Paint correction, pet hair and stain removal take longer and should be named in the request.",
      },
      {
        question: "How much does mobile car detailing cost?",
        answer:
          "It depends on vehicle size, condition and package. Published local ranges for a standard interior and exterior service vary widely, so compare the offers you receive and what each includes.",
      },
      {
        question: "What should I tell the detailer before booking?",
        answer:
          "Say the vehicle type, the package, any add-ons such as pet hair, and where the car will be parked.",
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
