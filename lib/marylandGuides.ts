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
  // Provider-side guides (searches like "how to get cleaning clients", "apps for handyman to find work",
  // "does a handyman need a license in maryland", "side hustles maryland"). No income or demand claims.
  {
    slug: "get-clients",
    title: "Get Cleaning, Lawn and Handyman Clients in Maryland",
    description:
      "Where to post your cleaning, lawn care, handyman or detailing service in Maryland, how to write a listing that gets requests, and how to turn first jobs into repeat clients.",
    heading: "How to get clients for your local service in Maryland",
    lede:
      "Starting out in Maryland? Most small Providers find their first clients in four places: people they already know, local Facebook groups and Nextdoor, a free Google Business Profile, and apps where Requesters post jobs, such as WhoCan Provider. A clear listing and fast replies matter more than any one platform.",
    sections: [
      {
        heading: "Where to post your service",
        paragraphs: [
          "Start with people who already trust you: neighbors, friends, church or community groups, and past employers. Ask each happy client to tell two people. Word of mouth is one of the most common ways small cleaners, lawn crews and handymen find work.",
          "Local Facebook groups and Nextdoor are where Maryland neighbors ask for recommendations. Read each group's rules, answer questions helpfully, and post your service only where promotion is allowed. On Nextdoor, business posts must come from a Business Page, not a personal account.",
          "A Google Business Profile is free for businesses that serve customers in person, including service-area businesses that travel to clients. It helps you show up when someone nearby searches for your service.",
          "Apps where Requesters post jobs, such as WhoCan Provider, let you list what you do, set your own price and accept the requests that fit. WhoCan is launching in Maryland, so which requests you see depends on your area.",
        ],
      },
      {
        heading: "Write a listing that gets requests",
        paragraphs: [
          "Name the job, what is included and who it is for: 'I will deep clean 2-bed apartments, supplies included' says more than 'I will clean'. Add real photos of your own work, your service area and the jobs you do not take.",
          "Price the whole job when you can, and say what changes the price, such as home size, yard size or vehicle condition. Requesters compare offers, and a clear price saves a round of messages.",
        ],
      },
      {
        heading: "Turn first jobs into repeat clients",
        paragraphs: [
          "Reply fast, confirm the time and the scope in writing, and show up when you said. After the job, ask if the client wants a repeat visit: a monthly clean, a weekly mow or a seasonal cleanup.",
          "Keep a simple list of clients and the date of their last job. A short message before the next season, such as leaf cleanup in fall, can bring the next booking.",
        ],
      },
    ],
    faqs: [
      {
        question: "Where can I post my cleaning services for free in Maryland?",
        answer:
          "Local Facebook groups that allow service posts, a Nextdoor Business Page and a Google Business Profile do not charge to set up. Check each platform's current rules and fees before you rely on it.",
      },
      {
        question: "How do I get my first cleaning or lawn care clients fast?",
        answer:
          "Tell everyone you know, answer recommendation requests in local groups, and list your service where Requesters post jobs. Reply quickly and ask every happy client for a referral.",
      },
      {
        question: "Is there an app for handymen and cleaners to find work in Maryland?",
        answer:
          "Yes. WhoCan Provider lets you list your service in Maryland, set your own price and accept the requests you want. Payment is held in escrow and released after the Requester approves the job.",
      },
      {
        question: "Do I need a website to get clients?",
        answer:
          "No. A clear listing, photos of your work and fast replies are enough to start. A website can come later.",
      },
    ],
  },
  {
    slug: "handyman-license",
    title: "Do You Need a License to Be a Handyman in Maryland?",
    description:
      "Maryland has no separate handyman license, but most paid home improvement work needs an MHIC license. What the state says needs a license, what does not, and where to check.",
    heading: "Do you need a license to be a handyman in Maryland?",
    lede:
      "Maryland does not have a separate handyman license. Paid home improvement work on a residence is licensed by the Maryland Home Improvement Commission (MHIC), and the state's own FAQ lists some jobs that are not home improvement, such as mounting a TV or hanging blinds. Check your exact scope with the MHIC before you take paid work.",
    sections: [
      {
        heading: "What the MHIC licenses",
        paragraphs: [
          "The Maryland Home Improvement Commission, part of the Maryland Department of Labor, licenses home improvement contractors. The state says home improvement covers work on the residence and improvements to the land next to it.",
          "The MHIC FAQ lists examples that count as home improvement and need a licensed contractor, including interior and exterior house painting, patios and retaining walls, gravel driveways, and tile, wood or other flooring. It also says landscape contractors are licensed by the MHIC.",
        ],
      },
      {
        heading: "Jobs the state says are not home improvement",
        paragraphs: [
          "According to the MHIC FAQ, mounting a TV on the wall, installing curtains or blinds, carpet installation, carpet cleaning, chimney cleaning, and demolition or clean-up on its own are not home improvement, so an MHIC license is not required for them.",
          "The line can be narrow. Cleaning a chimney does not need a license, but building or capping one does. Installing carpet does not, but installing tile or wood flooring does. When a job mixes both, ask the MHIC.",
        ],
      },
      {
        heading: "Trade work needs its own license",
        paragraphs: [
          "Electrical work needs a licensed electrician, for example to connect solar panels to a home's electric system. Plumbing, gas and HVAC work also have their own licensing in Maryland. A handyman listing should say clearly which of these jobs you do not take.",
          "Tree work on trees 20 feet or taller is licensed by the Maryland Department of Natural Resources, not the MHIC.",
        ],
      },
      {
        heading: "How to check and what to put on your listing",
        paragraphs: [
          "The MHIC has a public license search on the Maryland Department of Labor website, and Requesters can use it to check a contractor. If you hold an MHIC license, put the number on your listing.",
          "If you do not, list only work that does not need one, such as furniture assembly or TV mounting, and decline requests outside that scope. On WhoCan Provider you choose which requests to accept.",
        ],
      },
    ],
    faqs: [
      {
        question: "Does a handyman need a license in Maryland?",
        answer:
          "There is no separate handyman license. Paid home improvement work on a residence needs an MHIC license, while jobs the state lists as not home improvement, such as TV mounting or hanging blinds, do not. Confirm your exact work with the Maryland Home Improvement Commission.",
      },
      {
        question: "Can I mount TVs and assemble furniture without a license in Maryland?",
        answer:
          "The MHIC FAQ says mounting a TV on the wall is not home improvement, so an MHIC license is not required. Furniture assembly is not listed on that page, so check with the MHIC if you are unsure.",
      },
      {
        question: "Do I need a license to paint houses in Maryland?",
        answer:
          "Yes. The MHIC FAQ says house painting, interior and exterior, is home improvement and needs a licensed contractor.",
      },
      {
        question: "How do I look up an MHIC license?",
        answer:
          "Use the License Search on the Maryland Department of Labor website and choose the Home Improvement Commission.",
      },
    ],
  },
  {
    slug: "side-hustles",
    title: "Side Hustles in Maryland Using Your Own Skills",
    description:
      "Local side hustles in Maryland: house cleaning, lawn mowing and leaf cleanup, car detailing, furniture assembly and TV mounting. What each needs to start and where to find clients.",
    heading: "Side hustles in Maryland you can start with your own skills",
    lede:
      "Looking for weekend or evening work in Maryland without a boss? Local services you already know how to do, such as cleaning, lawn care, car detailing, furniture assembly or TV mounting, can start with the tools you have. What you earn depends on your prices, your area and how many requests you accept.",
    sections: [
      {
        heading: "House cleaning",
        paragraphs: [
          "Start with regular and move-out cleans, and decide whether you bring supplies. State the homes you take and the extras you charge for, such as ovens, fridges or interior windows.",
        ],
      },
      {
        heading: "Lawn mowing and leaf cleanup",
        paragraphs: [
          "Mowing runs from spring to fall in most of Maryland, and leaf cleanup is the fall job. Say whether you bring the mower and whether you haul clippings and leaves away. Landscape contracting is licensed by the MHIC, so check before you take on landscaping projects.",
        ],
      },
      {
        heading: "Mobile car detailing",
        paragraphs: [
          "Offer clear packages: interior, exterior or both. Say whether you need the Requester's water or power and where you can work, such as a driveway.",
        ],
      },
      {
        heading: "Furniture assembly and TV mounting",
        paragraphs: [
          "The Maryland Home Improvement Commission's FAQ says mounting a TV on the wall is not home improvement, so it does not need an MHIC license. Most other home improvement work does. Read our guide on handyman licensing in Maryland before you list repairs.",
        ],
      },
      {
        heading: "How to start this week",
        paragraphs: [
          "Pick one service, write a clear listing with photos of your own work, and tell people you know. Then list it where Requesters post jobs, such as WhoCan Provider, which is launching in Maryland. You set your own price and accept the requests that fit your schedule.",
          "A side hustle is not a job with a set wage. You are working for yourself, so count supplies, travel time and taxes when you set your price.",
        ],
      },
    ],
    faqs: [
      {
        question: "What are good side hustles in Maryland?",
        answer:
          "Local services you can do with your own tools: house cleaning, lawn mowing and leaf cleanup, mobile car detailing, furniture assembly and TV mounting. Check whether the work needs a license before you start.",
      },
      {
        question: "Is there an app for local side jobs in Maryland?",
        answer:
          "WhoCan Provider lets you list a local service in Maryland, set your own price and accept the requests you want. It is not a job: you work for yourself and choose your own schedule.",
      },
      {
        question: "Do I need a license for a cleaning side hustle in Maryland?",
        answer:
          "The Maryland Home Improvement Commission FAQ says carpet cleaning is not home improvement. For other business registration and tax questions, check with the State of Maryland and your county.",
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
