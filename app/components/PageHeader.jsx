import { Icon } from "@shopify/polaris";

// Header shown at the top of each feature page.
export default function PageHeader({ icon, eyebrow, title, subtitle }) {
  return (
    <header className="ic-head">
      <span className="ic-head-icon">
        <Icon source={icon} />
      </span>
      <div className="ic-head-text">
        {eyebrow && <p className="ic-eyebrow">{eyebrow}</p>}
        <h1 className="ic-head-title">{title}</h1>
        {subtitle && <p className="ic-head-sub">{subtitle}</p>}
      </div>
    </header>
  );
}
