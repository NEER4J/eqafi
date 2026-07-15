import SubscribeButton from "./components/SubscribeButton";

const plans = [
  {
    name: "Essential",
    audience: "Startups and small businesses",
    price: "$700",
    planId: "Equafi-Essential-CAD-Monthly",
    description: "A dependable monthly foundation for keeping your books current.",
    features: [
      "Small business bookkeeping",
      "Bank reconciliation",
      "CRA reporting and T2 support",
      "HST, GST, and sales tax filings",
      "Dedicated bookkeeper",
      "Bookkeeping software included",
      "Payroll and time tracking available",
    ],
  },
  {
    name: "Professional",
    audience: "Growing businesses",
    price: "$1,050",
    planId: "Equafi-Professional-CAD-Monthly",
    description: "More control and a dedicated finance partner as operations expand.",
    featured: true,
    features: [
      "Medium business bookkeeping",
      "CRA reporting and T2 support",
      "HST and sales tax filings",
      "Dedicated bookkeeper",
      "Staff accountant point of contact",
      "Payroll for 5-10 employees",
      "Bill payments and software included",
      "Additional services on request",
    ],
  },
  {
    name: "Premium",
    audience: "Established and scaling businesses",
    price: "$2,550",
    planId: "Equafi-Premium-CAD-Monthly",
    description: "A complete operating finance function for more complex teams.",
    features: [
      "Medium to large business bookkeeping",
      "CRA reporting and T2 financials",
      "HST and sales tax filings",
      "Dedicated bookkeeper and CPA contact",
      "Payroll for 10-20 employees",
      "Accounts payable and bill payments",
      "Invoicing and receivables workflows",
      "Cash and access controls",
      "Finance operations software included",
    ],
  },
];

const services = [
  ["01", "Bookkeeping", "Accurate, reconciled books that stay current month to month."],
  ["02", "Tax and CRA", "Reporting support for T2, HST, GST, and ongoing obligations."],
  ["03", "Payroll", "Practical payroll and time-management support for your team."],
  ["04", "Payables and receivables", "Bill payment, invoicing, and cash-control workflows."],
];

export default function Home() {
  return (
    <main id="top">
      <header className="site-header">
        <nav className="site-nav" aria-label="Main navigation">
          <a className="brand-mark" href="#top" aria-label="Equafi home">
            <span>Equafi</span>
          </a>
          <div className="nav-links">
            <a href="#services">Services</a>
            <a href="#pricing">Plans</a>
            <a href="#contact">Contact</a>
          </div>
          <a className="nav-cta" href="#contact">
            Contact Equafi
          </a>
        </nav>
      </header>

      <section className="hero-section" aria-labelledby="hero-title">
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Financial operations, made clear</p>
            <h1 id="hero-title">Finance support that keeps business moving.</h1>
            <p className="hero-text">
              Equafi gives Canadian businesses reliable bookkeeping, tax, payroll,
              and payment operations, with a dedicated team behind the numbers.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#pricing">
                Explore plans
              </a>
              <a className="button button-secondary" href="#contact">
                Speak with Equafi <span aria-hidden="true">&#8594;</span>
              </a>
            </div>
            <div className="trust-row" aria-label="Equafi service highlights">
              <span>CRA reporting</span>
              <span>Payroll support</span>
              <span>Dedicated support</span>
            </div>
          </div>

          <div className="hero-dashboard" aria-label="Finance overview preview">
            <div className="dashboard-header">
              <div>
                <p>Equafi overview</p>
                <strong>July 2026</strong>
              </div>
              <span className="status-dot">On track</span>
            </div>
            <div className="dashboard-main">
              <div className="balance-card">
                <span>Books reconciled</span>
                <strong>100%</strong>
                <small>Up to date this month</small>
              </div>
              <div className="activity-card">
                <div className="activity-heading">
                  <span>Monthly activity</span>
                  <strong>+18.4%</strong>
                </div>
                <div className="activity-chart" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
                <div className="chart-labels" aria-hidden="true">
                  <span>Jan</span><span>Apr</span><span>Jul</span>
                </div>
              </div>
            </div>
            <div className="dashboard-footer">
              <span className="gateway-mark">E</span>
              <p><strong>Reporting ready</strong><br />Finance operations aligned</p>
              <span aria-hidden="true">&#8599;</span>
            </div>
          </div>
        </div>
      </section>

      <section className="services-section" id="services" aria-labelledby="services-title">
        <div className="section-intro">
          <div>
            <p className="eyebrow">What Equafi handles</p>
            <h2 id="services-title">The finance work behind a well-run business.</h2>
          </div>
          <p>
            Choose the support you need today, with a practical path to add more
            as your business grows.
          </p>
        </div>
        <div className="service-grid">
          {services.map(([number, name, description]) => (
            <article className="service-card" key={name}>
              <span className="service-number">{number}</span>
              <h3>{name}</h3>
              <p>{description}</p>
              <span className="service-arrow" aria-hidden="true">&#8594;</span>
            </article>
          ))}
        </div>
      </section>

      <section className="pricing-section" id="pricing" aria-labelledby="pricing-title">
        <div className="pricing-intro">
          <p className="eyebrow">Monthly service plans</p>
          <h2 id="pricing-title">Clear support, scaled to your business.</h2>
          <p>Every plan is tailored to your operating needs and paid monthly.</p>
        </div>
        <div className="pricing-grid">
          {plans.map((plan) => (
            <article className={`pricing-card ${plan.featured ? "featured-card" : ""}`} key={plan.name}>
              {plan.featured && <span className="recommended-label">Most popular</span>}
              <div className="plan-heading">
                <h3>{plan.name}</h3>
                <p>{plan.audience}</p>
                <span>{plan.description}</span>
              </div>
              <div className="plan-price">
                <div>
                  <strong>{plan.price}</strong>
                </div>
                <span>per month</span>
              </div>
              <SubscribeButton planId={plan.planId} className="plan-button">
                Subscribe
              </SubscribeButton>
              <div className="features-title">Included support</div>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="contact-section" id="contact" aria-labelledby="contact-title">
        <div>
          <p className="eyebrow">Start with a conversation</p>
          <h2 id="contact-title">Bring clarity to your finance operations.</h2>
        </div>
        <div className="contact-copy">
          <p>
            Tell us a little about your business and the support you are looking
            for. We will confirm the right scope and next steps.
          </p>
          <address className="contact-details">
            <a href="mailto:info@equafi.ca">info@equafi.ca</a>
            <span>5160 Explorer Dr, Unit-30</span>
            <span>Mississauga, ON L4W 4T7</span>
          </address>
          <div className="contact-actions">
            <a className="button button-primary" href="mailto:info@equafi.ca">
              Email info@equafi.ca
            </a>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <a className="brand-mark" href="#top"><span>Equafi</span></a>
        <address>5160 Explorer Dr, Unit-30, Mississauga, ON L4W 4T7</address>
        <a href="mailto:info@equafi.ca">info@equafi.ca</a>
      </footer>
    </main>
  );
}
