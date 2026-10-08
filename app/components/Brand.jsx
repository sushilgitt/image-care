import { Icon } from "@shopify/polaris";

// Image Care brand primitives: the photo-frame logo mark, KPI tiles and a slim
// linear meter. Pure SVG/CSS so server and client render identically.

// Photo frame with a "smaller file" down-arrow badge. `light` renders a white
// tile for use on the solid indigo surfaces.
export function LogoMark({ size = 22, light = false }) {
  return (
    <svg className={`ic-logo${light ? " ic-logo--light" : ""}`} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect className="ic-logo-tile" width="24" height="24" rx="6" />
      <rect className="ic-logo-line" x="4.4" y="5.4" width="12.6" height="10.6" rx="1.6" fill="none" stroke="#fff" strokeWidth="1.7" />
      <path className="ic-logo-line" d="M6.6 14l2.9-3.3 2 2.1 1.5-1.5 2.2 2.3" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle className="ic-logo-dot" cx="13.7" cy="8.6" r="1.1" fill="#fff" />
      <circle className="ic-logo-badge" cx="17.7" cy="17.7" r="4.5" fill="#fff" stroke="#4848DC" strokeWidth="1.4" />
      <path className="ic-logo-ink" d="M17.7 15.5v4.3M16 18.1l1.7 1.7 1.7-1.7" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Stroke check mark used in feature lists (colour comes from CSS `stroke`).
export function CheckGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3.5 8.5l3 3 6-7" />
    </svg>
  );
}

const clamp = (n) => Math.min(100, Math.max(0, Number(n) || 0));

// Slim linear meter. `dark` is for use on the indigo surfaces.
export function Meter({ pct = 0, dark = false, label }) {
  const p = clamp(pct);
  const cls = `ic-meter${dark ? " ic-meter--dark" : ""}${p >= 100 ? " is-full" : p >= 80 ? " is-high" : ""}`;
  return (
    <div className={cls} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(p)} aria-label={label}>
      <span style={{ width: `${p}%` }} />
    </div>
  );
}

// Row of KPI tiles. items: [{ icon, label, value, suffix?, hint?, tone? }]
// where tone is "good" | "warn".
export function KpiGrid({ items }) {
  return (
    <div className="ic-kpis" style={{ "--cols": items.length }}>
      {items.map((k) => (
        <div key={k.label} className={`ic-kpi${k.tone ? ` is-${k.tone}` : ""}`}>
          <span className="ic-kpi-icon"><Icon source={k.icon} /></span>
          <div className="ic-kpi-body">
            <p className="ic-kpi-label">{k.label}</p>
            <p className="ic-kpi-value">{k.value}{k.suffix && <small>{k.suffix}</small>}</p>
            {k.hint && <p className="ic-kpi-hint">{k.hint}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
