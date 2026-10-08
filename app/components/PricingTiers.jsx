import { PLAN_TIERS } from "../planCatalog";
import { LogoMark, CheckGlyph } from "./Brand";

// Plan comparison used by both the standalone pricing page and the in-app
// pricing wall. Presentational only: every plan CTA is a real top-frame link
// (`target="_top"`) to Shopify's hosted managed-pricing page, where the actual
// price/cycle live and are picked. A direct anchor is used (rather than a form
// POST + reauthorize-header redirect) because a user click is a reliable user
// activation that can navigate the top frame out of the embedded iframe.
//
// Prices come from planCatalog.js and are display-only: the amount actually
// charged is set on the Partner Dashboard plans, so keep the two in sync.
export default function PricingTiers({ pricingUrl }) {
  return (
    <div className="ic-pricing">
      <header className="ic-pricing-band">
        <span className="ic-brandline"><LogoMark size={24} light />Image Care plans</span>
        <h1>Pick the plan that fits your catalog</h1>
        <p>
          Compress photos to WebP, write alt text with AI and measure page speed. Start free and
          upgrade when your store grows.
        </p>
      </header>

      <div className="ic-pricing-grid">
        {PLAN_TIERS.map((tier) => (
          <div key={tier.name} className={`ic-price-card${tier.popular ? " is-popular" : ""}`}>
            {tier.popular && <span className="ic-price-flag">MOST POPULAR</span>}
            <p className="ic-price-name">{tier.name}</p>
            <p className="ic-price-tag">{tier.tagline}</p>
            <p className="ic-price-amount">
              {`$${tier.price}`}<span>/ month</span>
            </p>
            <p className="ic-price-annual">
              {tier.price === 0 ? "Free forever, no card required" : `Or $${tier.priceAnnual}/year and save ~17%`}
            </p>
            <a href={pricingUrl} target="_top" className={`ic-btn ${tier.popular ? "ic-btn-primary" : "ic-btn-outline"} ic-price-cta`}>
              {tier.price === 0 ? "Start free" : `Choose ${tier.name}`}
            </a>
            <ul className="ic-ticks">
              {tier.features.map((f) => (
                <li key={f}><CheckGlyph />{f}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="ic-pricing-foot">Billed securely through Shopify. Change or cancel your plan at any time.</p>
    </div>
  );
}
