import Footer from '@/components/Footer';
import JsonLd from '@/components/JsonLd';
import { APP_STORE_LINKS } from '@/lib/appStores';
import ProviderEffects from './ProviderEffects';
import './provider.css';

const IOS = APP_STORE_LINKS.seller.apple;
const ANDROID = APP_STORE_LINKS.seller.play;

const FAQS = [
  {
    q: 'What is WhoCan Provider?',
    a: 'WhoCan Provider is the app for service providers. You list a service, set your own price, receive booking requests from local buyers, and get paid through the app.',
  },
  {
    q: 'Is this a job?',
    a: 'No. You work for yourself and choose which requests to accept. WhoCan does not employ you.',
  },
  {
    q: 'Can I set my own price?',
    a: 'Yes. You create price plans and describe what each one includes.',
  },
  {
    q: 'Do I have to accept every request?',
    a: 'No. You accept the requests that fit your work and schedule, and decline the rest.',
  },
  {
    q: 'How do I get paid?',
    a: 'Buyers pay in the app and the payment is held in escrow. After you mark the job completed and the buyer approves it, the payment is released to you.',
  },
  {
    q: 'Do I need a license?',
    a: 'Some work, such as electrical, plumbing, gas and larger home improvement projects, requires a license in Maryland. You are responsible for meeting the rules for the services you offer.',
  },
];

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

function Check() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
      <path d="M16.4 12.6c0-2.2 1.8-3.3 1.9-3.4-1-1.5-2.6-1.7-3.2-1.7-1.4-.1-2.6.8-3.3.8s-1.7-.8-2.8-.8c-1.4 0-2.8.8-3.5 2.1-1.5 2.6-.4 6.5 1.1 8.6.7 1 1.6 2.2 2.7 2.1 1.1 0 1.5-.7 2.8-.7s1.7.7 2.8.7 1.9-1 2.6-2.1c.8-1.2 1.1-2.3 1.2-2.4-.1 0-2.3-.9-2.3-3.2zM14.3 6.2c.6-.7 1-1.7.9-2.7-.9 0-1.9.6-2.5 1.3-.5.6-1 1.6-.9 2.6 1 .1 1.9-.5 2.5-1.2z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#34A853" d="M4 3.2v17.6c0 .4.4.6.8.4l9.4-8.8z" />
      <path fill="#FBBC04" d="m18.5 9.4-4.3 3.4-9.4-8.8c.2-.2.6-.2.9 0z" />
      <path fill="#EA4335" d="m14.2 12.8 4.3 3.4-12.8 4.8c-.3.1-.7.1-.9 0z" />
      <path fill="#4285F4" d="m21 11.1-2.5-1.7-4.3 3.4 4.3 3.4 2.5-1.7c.7-.5.7-2.2 0-2.7z" />
    </svg>
  );
}

function StoreButtons({ withIcons = true }: { withIcons?: boolean }) {
  return (
    <>
      <a className="store" href={IOS} target="_blank" rel="noopener noreferrer" aria-label="Download WhoCan Provider on the App Store">
        {withIcons && <AppleIcon />}
        <span><small>Download on the</small><b>App Store</b></span>
      </a>
      <a className="store" href={ANDROID} target="_blank" rel="noopener noreferrer" aria-label="Get WhoCan Provider on Google Play">
        {withIcons && <PlayIcon />}
        <span><small>Get it on</small><b>Google Play</b></span>
      </a>
    </>
  );
}

const NAV = [
  { href: '#what', label: 'What is it' },
  { href: '#guide', label: 'Guide' },
  { href: '#expect', label: 'Expectations' },
  { href: '#faq', label: 'FAQ' },
];

export default function SellersPage() {
  return (
    <>
    <div className="pv">
      <JsonLd data={faqLd} />
      <ProviderEffects />
      <div className="prog" id="pv-prog" />

      <div className="annbar">
        <span className="dot" />
        <span><b>Now launching in Maryland.</b> List your service on WhoCan Provider.</span>
        <a href="#get">Download</a>
      </div>

      <header id="pv-hd">
        <div className="nav">
          <a className="logo" href="/" aria-label="WhoCan home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/provider/app-icon.webp" width={38} height={38} alt="" />
            WhoCan<small>Provider</small>
          </a>
          <nav className="menu" aria-label="Page sections">
            {NAV.map((n) => <a key={n.href} href={n.href}>{n.label}</a>)}
          </nav>
          <div className="right">
            <span className="loc">Maryland</span>
            <a className="pill" href="#get">Download the app</a>
            <button className="burger" id="pv-bg" aria-label="Menu" aria-expanded="false" type="button"><i /></button>
          </div>
        </div>
      </header>
      <div className="mmenu" id="pv-mm">
        {NAV.map((n) => <a key={n.href} href={n.href}>{n.label}</a>)}
        <a href="#get" style={{ background: 'var(--b500)', marginTop: 14 }}>Download the app</a>
      </div>

      <main>
        <div className="hero">
          <div className="mesh"><i /><i /><i /></div>
          <div className="gridl" />
          <div className="wrap">
            <div>
              <span className="tag"><i />FOR PROVIDERS IN MARYLAND</span>
              <h1>
                Get booked for your<br />
                <span className="rline">
                  <span className="rot">
                    <span>cleaning</span>
                    <span aria-hidden="true">handyman</span>
                    <span aria-hidden="true">lawn care</span>
                    <span aria-hidden="true">car detailing</span>
                    <span aria-hidden="true">cleaning</span>
                  </span>
                  <span className="wk">work</span>
                </span>
              </h1>
              <p className="def">
                <b>WhoCan Provider</b> is the app where you list your service, set your own price and get booking
                requests from people nearby. You accept the jobs you want, do the work, and are paid through the app.
              </p>
              <div className="chiprow">
                <span><Check />Set your own price</span>
                <span><Check />Accept or decline</span>
                <span><Check />Escrow payments</span>
              </div>
              <div className="cta-row">
                <StoreButtons />
                <a className="ghost" href="#guide">Read the guide ↓</a>
              </div>
            </div>

            <div className="flow">
              <h3>HOW WHOCAN WORKS</h3>
              <div style={{ marginTop: 20 }}>
                <div className="node">
                  <div className="ic"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg></div>
                  <div><b>A buyer needs help</b><small>Posts a request or books a listing near them</small></div>
                </div>
              </div>
              <div className="link" />
              <div className="node mid">
                <div className="ic"><svg viewBox="0 0 24 24"><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" /><path d="M9 12l2 2 4-4" /></svg></div>
                <div><b>WhoCan connects you</b><small>Chat, compare offers, pay in the app. Payment is held in escrow</small></div>
              </div>
              <div className="link" />
              <div className="node you">
                <div className="ic"><svg viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z" /></svg></div>
                <div><b>You, the provider</b><small>Accept the job, do the work, get paid after the buyer approves</small></div>
              </div>
            </div>
          </div>
        </div>

        <section id="what">
          <div className="wrap">
            <div className="rv">
              <span className="eyebrow">What is WhoCan Provider?</span>
              <h2>A simple way to find local customers</h2>
              <p className="sub">
                WhoCan is a platform that connects people who need a service with independent providers near them.
                WhoCan Provider is the app for the provider side: you.
              </p>
            </div>
            <div className="three">
              <div className="c rv"><span className="k">IT IS</span><h3>Your listing and booking tool</h3><p>Create a service with a clear title, photos and your own price, then manage requests, chat and job status in one app.</p></div>
              <div className="c rv" style={{ transitionDelay: '.1s' }}><span className="k">IT IS FOR</span><h3>People who work for themselves</h3><p>Cleaners, handymen, lawn and car detailing providers, and anyone with a skill neighbors need.</p></div>
              <div className="c rv" style={{ transitionDelay: '.2s' }}><span className="k">IT IS NOT</span><h3>A job or a salary</h3><p>WhoCan does not employ you or guarantee income. You choose the work, and the work is yours.</p></div>
            </div>
            <div className="chips rv">
              <span>Cleaning</span><span>Handyman</span><span>Lawn care</span><span>Car detailing</span><span>+ more in the app</span>
            </div>
          </div>
        </section>

        <section className="alt">
          <div className="wrap">
            <div className="rv"><span className="eyebrow">Before you start</span><h2>What you need</h2></div>
            <div className="need">
              <div className="rv"><i>1</i><b>A phone</b><p>iPhone or Android with the WhoCan Provider app.</p></div>
              <div className="rv" style={{ transitionDelay: '.08s' }}><i>2</i><b>A service you offer</b><p>One clear thing you do well, such as deep cleaning.</p></div>
              <div className="rv" style={{ transitionDelay: '.16s' }}><i>3</i><b>Your service area</b><p>The location you can actually reach on time.</p></div>
              <div className="rv" style={{ transitionDelay: '.24s' }}><i>4</i><b>Photos of your work</b><p>Clear photos help buyers choose you.</p></div>
            </div>
          </div>
        </section>

        <section id="guide">
          <div className="wrap">
            <div className="rv">
              <span className="eyebrow">Step by step guide</span>
              <h2>How to use WhoCan Provider</h2>
              <p className="sub">From download to your first completed job.</p>
            </div>
            <div className="guide">
              <nav className="toc" id="pv-toc" aria-label="Guide steps">
                <a href="#s1" className="on">1. Sign up</a>
                <a href="#s2">2. Add your location</a>
                <a href="#s3">3. Create your service</a>
                <a href="#s4">4. Handle requests</a>
                <a href="#s5">5. Do the job</a>
                <a href="#s6">6. Get paid</a>
              </nav>
              <div>
                <div className="gs rv" id="s1">
                  <div>
                    <span className="n"><b>1</b>STEP ONE</span>
                    <h3>Download and sign up</h3>
                    <p>Install WhoCan Provider from the App Store or Google Play and create your account.</p>
                    <ul><li>Use the name and phone number buyers can recognize</li><li>Complete the verification the app asks for</li></ul>
                  </div>
                  <div className="shot ill" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><rect x="7" y="2" width="10" height="20" rx="2.5" /><path d="M11 18h2" /></svg>
                  </div>
                </div>

                <div className="gs rv" id="s2">
                  <div>
                    <span className="n"><b>2</b>STEP TWO</span>
                    <h3>Add your location</h3>
                    <p>Tell the app where you work so nearby buyers can find you.</p>
                    <ul><li>Choose the area you can reach on time</li><li>Only list areas you can actually serve</li></ul>
                  </div>
                  <div className="shot ill" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" /><circle cx="12" cy="10" r="2.6" /></svg>
                  </div>
                </div>

                <div className="gs rv" id="s3">
                  <div>
                    <span className="n"><b>3</b>STEP THREE</span>
                    <h3>Create your service</h3>
                    <p>This is your listing. Buyers compare it with others before they book.</p>
                    <ul>
                      <li>Pick the category and sub categories that fit</li>
                      <li>Write a clear title that starts with &quot;I will…&quot;</li>
                      <li>Add cover photos or a video of real work</li>
                      <li>Create your price plans and say what each includes</li>
                    </ul>
                    <div className="tip"><b>Tip:</b> specific beats vague. &quot;I will deep clean your kitchen&quot; gets more requests than &quot;cleaning&quot;.</div>
                  </div>
                  <div className="shot">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/provider/s_create.webp" width={520} height={1583} loading="lazy" alt="Create service screen in the WhoCan Provider app" />
                    <span>Create new favor</span>
                  </div>
                </div>

                <div className="gs rv" id="s4">
                  <div>
                    <span className="n"><b>4</b>STEP FOUR</span>
                    <h3>Review and accept requests</h3>
                    <p>A buyer&apos;s request shows the job, the place, the date and what they need.</p>
                    <ul><li>Check the details and the location</li><li>Chat with the buyer if something is unclear</li><li>Accept what you can do well, decline the rest</li></ul>
                  </div>
                  <div className="shot">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/provider/s_request.webp" width={520} height={1126} loading="lazy" alt="Booking request screen in the WhoCan Provider app" />
                    <span>Booking request</span>
                  </div>
                </div>

                <div className="gs rv" id="s5">
                  <div>
                    <span className="n"><b>5</b>STEP FIVE</span>
                    <h3>Do the job and mark it completed</h3>
                    <p>Track the favor in the app while you work.</p>
                    <ul><li>Arrive on time and follow what was agreed</li><li>Raise any change in scope in the chat first</li><li>Mark the favor completed when it is done, so the buyer can review and approve it</li></ul>
                  </div>
                  <div className="shot">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/provider/s_progress.webp" width={520} height={1126} loading="lazy" alt="Favor in progress screen in the WhoCan Provider app" />
                    <span>Favor in progress</span>
                  </div>
                </div>

                <div className="gs rv" id="s6">
                  <div>
                    <span className="n"><b>6</b>STEP SIX</span>
                    <h3>Get paid after the buyer approves</h3>
                    <p>The buyer pays through the app and the payment is held in escrow. Once you mark the job completed and the buyer approves it, the payment is released to you.</p>
                    <ul><li>No cash handling needed</li><li>Payment is released after the buyer&apos;s approval</li></ul>
                  </div>
                  <div className="shot">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/provider/s_home.webp" width={520} height={1393} loading="lazy" alt="Home screen in the WhoCan Provider app" />
                    <span>Provider home</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="alt" id="expect">
          <div className="wrap">
            <div className="rv"><span className="eyebrow">Be clear on what this is</span><h2>Honest expectations</h2></div>
            <div className="hgrid">
              <div className="box yes rv">
                <h3>What WhoCan gives you</h3>
                <ul>
                  <li>A place to list your service and set your price</li>
                  <li>Requests from local buyers that you accept or decline</li>
                  <li>In-app chat and job tracking</li>
                  <li>Payments held in escrow and released after the buyer approves the job</li>
                </ul>
              </div>
              <div className="box no rv" style={{ transitionDelay: '.1s' }}>
                <h3>What it is not</h3>
                <ul>
                  <li>Not a job or a salary</li>
                  <li>No guaranteed income or number of bookings</li>
                  <li>Not a license: you are responsible for any license your work needs</li>
                  <li>WhoCan is a platform that connects you with buyers</li>
                </ul>
              </div>
            </div>
            <div className="lic rv">
              <b>Licensing in Maryland.</b> Some work, such as electrical, plumbing, gas and larger home improvement,
              requires a license. Check the current rules with the Maryland Home Improvement Commission before you offer it.
            </div>
          </div>
        </section>

        <section id="faq">
          <div className="wrap">
            <div className="rv"><span className="eyebrow">FAQ</span><h2>Questions providers ask</h2></div>
            <div className="faq">
              {FAQS.map((f, i) => (
                <div key={f.q} className={`q${i === 0 ? ' open' : ''}`}>
                  <button type="button" aria-expanded={i === 0}>{f.q}<i aria-hidden="true">+</i></button>
                  <div className="a">{f.a}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="get" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="cta rv">
              <div>
                <h2 style={{ color: '#fff' }}>Ready to list your first service?</h2>
                <p className="sub" style={{ color: '#EDE0FF' }}>Download WhoCan Provider and set up in minutes.</p>
                <div className="cta-row" style={{ animation: 'none' }}><StoreButtons withIcons={false} /></div>
              </div>
              <div className="qr">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/provider/qr-provider.svg" width={152} height={152} alt="QR code that opens this page on your phone" />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
    {/* Outside .pv so the scoped reset does not touch the shared footer */}
    <Footer />
    </>
  );
}
