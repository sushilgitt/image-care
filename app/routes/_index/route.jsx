import { redirect } from "react-router";
import { LogoMark } from "../../components/Brand";
import styles from "./styles.module.css";

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  // No shop-domain form: App Store apps must be installed and opened from
  // Shopify (App Store / admin), never by typing a myshopify.com URL here.
  return null;
};

const FEATURES = [
  {
    title: "Image Optimizer",
    text: "Converts product photos to WebP and replaces them on the product. Image order and variant images stay the same.",
  },
  {
    title: "Alt Text AI",
    text: "Writes accurate alt text from what is in each image, so you meet accessibility guidelines and help SEO.",
  },
  {
    title: "Speed Report",
    text: "Runs Google Lighthouse on any product page and shows the file size you saved.",
  },
];

export default function App() {
  return (
    <main className={styles.page}>
      <section className={styles.band}>
        <div className={styles.shell}>
          <header className={styles.brand}>
            <LogoMark size={30} light />
            Image Care
          </header>
          <h1 className={styles.heading}>Make every product photo lighter.</h1>
          <p className={styles.text}>
            Image Care compresses your Shopify product images to WebP, writes alt text with AI and
            measures how much faster your product pages load.
          </p>
          <p className={styles.note}>
            Install Image Care from the Shopify App Store, then open it from <strong>Apps</strong> in
            your Shopify admin.
          </p>
        </div>
      </section>

      <div className={styles.shell}>
        <ul className={styles.grid}>
          {FEATURES.map((f) => (
            <li key={f.title}>
              <strong>{f.title}</strong>
              <p>{f.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
