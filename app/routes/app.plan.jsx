import PageHeader from "../components/PageHeader";
import { CreditCardIcon } from "@shopify/polaris-icons";
import { useLoaderData, useSubmit, useNavigation, useActionData } from "react-router";
import { authenticate } from "../shopify.server";
import {
  getBillingState,
  managedPricingUrl,
  appBridgeRedirect,
  cancelSubscription,
} from "../billing.server";
import { getUsage } from "../usage.server";
import { PLAN_TIERS } from "../planCatalog";
import { Page, Layout, BlockStack, Banner } from "@shopify/polaris";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { Meter, CheckGlyph } from "../components/Brand";

// Human labels for the entitlement flags, shown as the current plan's inclusions.
const FEATURE_LABELS = {
  optimize: "Image Optimizer (WebP)",
  altText: "Alt Text AI",
  autoOptimize: "Auto-Optimize new products",
  pageSpeed: "Speed Report (Lighthouse)",
};

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  let state = { hasActivePlan: false, plan: null, appHandle: undefined };
  try {
    state = await getBillingState(admin, session.shop);
  } catch (e) {
    if (e instanceof Response) throw e;
  }

  let usage = { imagesUsed: 0 };
  try { usage = await getUsage(session.shop); } catch { /* table not ready */ }

  const plan = state.plan || { name: "Free", tier: "free", monthlyImages: 100, features: {} };
  const included = Object.keys(FEATURE_LABELS).filter((k) => plan.features?.[k]);

  return {
    hasActivePlan: state.hasActivePlan,
    planName: plan.name,
    tier: plan.tier,
    monthlyImages: plan.monthlyImages,
    included,
    imagesUsed: usage.imagesUsed || 0,
    // Direct top-frame link target for the Change/Choose-plan CTA.
    pricingUrl: managedPricingUrl(session.shop, state.appHandle),
  };
};

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const actionType = formData.get("actionType");

  const state = await getBillingState(admin);
  const pricingUrl = managedPricingUrl(session.shop, state.appHandle);

  // Cancel: try the in-app cancel mutation first; if managed pricing blocks it,
  // fall back to the hosted page to cancel manually.
  if (actionType === "cancel") {
    const sub = state.activeSubscription;
    if (!sub) return { cancelled: true };
    try {
      await cancelSubscription(admin, sub.id);
      return { cancelled: true };
    } catch (e) {
      console.error("[BILLING] in-app cancel failed, redirecting:", e?.message);
      throw appBridgeRedirect(pricingUrl);
    }
  }

  return null;
};

export default function BillingPage() {
  const { hasActivePlan, planName, monthlyImages, included, imagesUsed, pricingUrl } = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const submit = useSubmit();
  const isBusy = navigation.state !== "idle";

  const post = (actionType) => {
    const fd = new FormData();
    fd.append("actionType", actionType);
    submit(fd, { method: "post" });
  };

  const quota = monthlyImages || 0;
  const used = imagesUsed || 0;
  const pct = quota > 0 ? Math.min(100, Math.round((used / quota) * 100)) : 0;
  const fmt = (n) => Number(n).toLocaleString();
  const currentIdx = PLAN_TIERS.findIndex((t) => t.name === planName);

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <PageHeader icon={CreditCardIcon} eyebrow="Billing" title="Plans & usage" subtitle="Your current plan, this month's image usage and the features included" />
        </Layout.Section>

        {actionData?.cancelled && !hasActivePlan && (
          <Layout.Section>
            <Banner title="Subscription cancelled" tone="info">
              You're now on the Free plan. You can choose a paid plan again at any time.
            </Banner>
          </Layout.Section>
        )}

        <Layout.Section>
          <BlockStack gap="400">
            <section className="ic-planhero">
              <div>
                <p className="ic-eyebrow">
                  Current plan
                  <span className="ic-planhero-status">{hasActivePlan ? "ACTIVE" : "FREE TIER"}</span>
                </p>
                <p className="ic-planhero-name">{planName}</p>
                <p className="ic-planhero-sub">{`${fmt(quota)} images optimized per month`}</p>
                <div className="ic-actions">
                  <a className="ic-btn ic-btn-light" href={pricingUrl} target="_top">
                    {hasActivePlan ? "Change plan" : "Upgrade plan"}
                  </a>
                  {hasActivePlan && (
                    <button type="button" className="ic-btn ic-btn-onbrand" disabled={isBusy} onClick={() => post("cancel")}>
                      {isBusy ? "Cancelling…" : "Cancel subscription"}
                    </button>
                  )}
                </div>
              </div>

              <div className="ic-welcome-usage">
                <p className="ic-usage-label">Usage this month</p>
                <p className="ic-usage-big">{fmt(used)}<span>{`/ ${fmt(quota)}`}</span></p>
                <Meter pct={pct} dark label={`${pct}% of monthly images used`} />
                <p className="ic-usage-note">{`${fmt(Math.max(0, quota - used))} images left. Resets on the 1st of each month.`}</p>
              </div>
            </section>

            <div className="ic-panel">
              <p className="ic-panel-title">Included in {planName}</p>
              <div className="ic-chips">
                {Object.entries(FEATURE_LABELS).map(([k, label]) => {
                  const on = included.includes(k);
                  return (
                    <span key={k} className={`ic-chip${on ? "" : " is-locked"}`}>
                      <CheckGlyph />
                      {label}
                      {!on && <span className="ic-chip-tag">Upgrade</span>}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="ic-panel">
              <p className="ic-panel-title">Compare plans</p>
              <p className="ic-panel-sub">Monthly prices. Annual billing saves about 17%.</p>
              <div className="ic-tiers">
                {PLAN_TIERS.map((t, i) => (
                  <div key={t.name} className={`ic-tier${i === currentIdx ? " is-current" : ""}`}>
                    <div className="ic-tier-top">
                      <p className="ic-tier-name">{t.name}</p>
                      {i === currentIdx && <span className="ic-tier-you">YOUR PLAN</span>}
                    </div>
                    <p className="ic-tier-price">{`$${t.price}`}<span>/mo</span></p>
                    <p className="ic-tier-meta">{`${t.images} images / month`}</p>
                    <ul className="ic-ticks">
                      {t.features.map((f) => (
                        <li key={f}><CheckGlyph />{f}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <p className="ic-footnote">
                Charges appear on your Shopify invoice. Plan changes are reflected here automatically.
              </p>
            </div>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
