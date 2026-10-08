import { useNavigate, useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { getBillingStateCached } from "../billing.server";
import { getUsage } from "../usage.server";
import { entitled } from "../plans.server";
import db from "../db.server";
import { Page, Button, Badge, Icon } from "@shopify/polaris";
import {
  ImageMagicIcon,
  MagicIcon,
  AutomationIcon,
  GaugeIcon,
} from "@shopify/polaris-icons";
import { LogoMark, Meter } from "../components/Brand";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  let plan = null;
  try {
    plan = (await getBillingStateCached(admin, session.shop)).plan;
  } catch (e) {
    if (e instanceof Response) throw e; // let re-auth propagate
  }

  let usage = { imagesUsed: 0 };
  let autoOptimize = false;
  try {
    usage = await getUsage(session.shop);
    const settings = await db.shopSettings.findUnique({ where: { shop: session.shop } });
    autoOptimize = settings?.autoOptimize ?? false;
  } catch { /* usage/settings tables not ready — defaults */ }

  return {
    plan: {
      name: plan?.name || "Free",
      tier: plan?.tier || "free",
      monthlyImages: plan?.monthlyImages ?? 100,
      altText: entitled(plan, "altText"),
      pageSpeed: entitled(plan, "pageSpeed"),
      autoOptimizeAllowed: entitled(plan, "autoOptimize"),
    },
    usage,
    autoOptimize,
  };
};

export default function Index() {
  const navigate = useNavigate();
  const { plan, usage, autoOptimize } = useLoaderData();

  const quota = plan.monthlyImages || 0;
  const used = usage?.imagesUsed || 0;
  const remaining = Math.max(0, quota - used);
  const pct = quota > 0 ? Math.min(100, Math.round((used / quota) * 100)) : 0;
  const fmt = (n) => Number(n).toLocaleString();

  const autoStatus = !plan.autoOptimizeAllowed
    ? { label: "Growth plan", tone: "attention" }
    : autoOptimize
      ? { label: "On", tone: "success" }
      : { label: "Off", tone: undefined };

  const tools = [
    {
      icon: ImageMagicIcon,
      title: "Image Optimizer",
      desc: "Turn heavy JPEG and PNG photos into WebP and swap them on the product. Order, variant images and the featured photo stay the same.",
      cta: "Open",
      onClick: () => navigate("/app/optimize"),
      available: true,
    },
    {
      icon: MagicIcon,
      title: "Alt Text AI",
      desc: "AI describes each product photo for shoppers and search engines. Review, then apply in one click.",
      cta: plan.altText ? "Open" : "Upgrade",
      onClick: () => navigate(plan.altText ? "/app/alt-text" : "/app/plan"),
      available: plan.altText,
      badge: plan.altText ? undefined : { label: "Starter+", tone: "attention" },
    },
    {
      icon: AutomationIcon,
      title: "Auto-Optimize",
      desc: "New products are optimized in the background as soon as they are created.",
      cta: plan.autoOptimizeAllowed ? "Manage" : "Upgrade",
      onClick: () => navigate(plan.autoOptimizeAllowed ? "/app/optimize" : "/app/plan"),
      available: plan.autoOptimizeAllowed,
      badge: autoStatus,
    },
    {
      icon: GaugeIcon,
      title: "Speed Report",
      desc: "Run Google Lighthouse on any product page and see how much page weight you removed.",
      cta: plan.pageSpeed ? "Open" : "Upgrade",
      onClick: () => navigate(plan.pageSpeed ? "/app/speed" : "/app/plan"),
      available: plan.pageSpeed,
      badge: plan.pageSpeed ? undefined : { label: "Growth+", tone: "attention" },
    },
  ];

  return (
    <Page>
      <section className="ic-welcome">
        <div>
          <span className="ic-brandline"><LogoMark size={26} light />Image Care</span>
          <h1>Make every product photo lighter.</h1>
          <p className="ic-welcome-sub">
            Compress images to WebP, write alt text with AI and track page speed, all from your
            Shopify admin.
          </p>
          <div className="ic-actions">
            <button type="button" className="ic-btn ic-btn-light" onClick={() => navigate("/app/optimize")}>
              Optimize images
            </button>
            <button type="button" className="ic-btn ic-btn-onbrand" onClick={() => navigate("/app/plan")}>
              View plan
            </button>
          </div>
        </div>

        <div className="ic-welcome-usage">
          <p className="ic-usage-label">Images this month</p>
          <p className="ic-usage-big">{fmt(used)}<span>{`/ ${fmt(quota)}`}</span></p>
          <Meter pct={pct} dark label={`${pct}% of this month's images used`} />
          <p className="ic-usage-note">{`${fmt(remaining)} left · resets on the 1st`}</p>
        </div>
      </section>

      <div className="ic-dash">
        <section>
          <h2 className="ic-h2">Tools</h2>
          <div className="ic-toollist">
            {tools.map((t) => (
              <div key={t.title} className={`ic-toolrow${t.available ? "" : " is-locked"}`}>
                <span className="ic-tool-icon"><Icon source={t.icon} /></span>
                <div>
                  <p className="ic-tool-name">
                    {t.title}
                    {t.badge && <Badge tone={t.badge.tone}>{t.badge.label}</Badge>}
                  </p>
                  <p className="ic-tool-desc">{t.desc}</p>
                </div>
                <Button variant={t.available ? "primary" : "secondary"} onClick={t.onClick}>
                  {t.cta}
                </Button>
              </div>
            ))}
          </div>
        </section>

        <aside className="ic-side">
          <div className="ic-panel">
            <p className="ic-eyebrow">Your plan</p>
            <p className="ic-plan-name">{plan.name}</p>
            <ul className="ic-facts">
              <li>Optimized this month<b>{fmt(used)}</b></li>
              <li>Images remaining<b>{fmt(remaining)}</b></li>
              <li>Tools included<b>{`${tools.filter((t) => t.available).length} of ${tools.length}`}</b></li>
              <li>Auto-Optimize<b>{autoStatus.label}</b></li>
            </ul>
            <button type="button" className="ic-btn ic-btn-outline ic-btn-block" onClick={() => navigate("/app/plan")}>
              Plans &amp; usage
            </button>
          </div>

          <div className="ic-panel">
            <p className="ic-panel-title">Quick start</p>
            <ol className="ic-steps">
              <li>
                <span className="ic-step-num">1</span>
                <span><strong>Open Image Optimizer</strong>See every product and its image size.</span>
              </li>
              <li>
                <span className="ic-step-num">2</span>
                <span><strong>Select products</strong>Pick one, a few or all of them.</span>
              </li>
              <li>
                <span className="ic-step-num">3</span>
                <span><strong>Optimize</strong>Photos are converted to WebP and replaced.</span>
              </li>
            </ol>
          </div>
        </aside>
      </div>
      <div style={{ height: 24 }} />
    </Page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
