import { useState, type FormEvent } from "react";
import "./App.css";

// ---- Edit this data to make the site yours ----
const SITE_NAME = "Saloni Shah";

type NavItem = {
  label: string;
  href?: string;
  children?: string[];
};

type FooterColumn = {
  title: string;
  links: string[];
};

const NAV: NavItem[] = [
  {
    label: "Books",
    children: ["All", "Book One", "Book Two", "Book Three", "Boxed Sets"],
  },
  {
    label: "About Me",
    children: ["My Story", "Photo Album", "Music"],
  },
  { label: "Tour and Events", href: "#tour" },
  {
    label: "Shop",
    children: ["All", "Art", "Clothing", "Stationery"],
  },
];

const SOCIALS: string[] = ["Facebook", "Instagram", "YouTube", "TikTok", "Twitter", "Pinterest"];

const FOOTER_COLUMNS: FooterColumn[] = [
  { title: "About", links: ["My Story", "Press"] },
  { title: "Shop", links: ["Art", "Books", "Clothing", "Stationery", "Wholesale"] },
  { title: "Connect", links: ["Tour", "Live", "Newsletter", "Music"] },
  { title: "Help", links: ["Contact", "Careers", "Shipping & Returns", "FAQ"] },
];

type HeaderProps = {
  cartCount: number;
  onSearch: () => void;
};

function Header({ cartCount, onSearch }: HeaderProps) {
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  return (
    <header className="header">
      <a className="skip" href="#main">Skip to content</a>

      <div className="header__bar">
        <button
          className="icon-btn header__burger"
          aria-label="Open menu"
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>

        <a className="header__title" href="/">{SITE_NAME}</a>

        <div className="header__actions">
          <button className="link-btn" onClick={onSearch}>Search</button>
          <a className="link-btn" href="#cart">
            Cart{cartCount > 0 && <span className="badge">{cartCount}</span>}
          </a>
        </div>
      </div>

      <nav className={`nav ${drawerOpen ? "nav--open" : ""}`} aria-label="Main">
        <ul className="nav__list">
          {NAV.map((item) => (
            <li key={item.label} className="nav__item">
              {item.children ? (
                <>
                  <button className="nav__link" aria-haspopup="true">
                    {item.label}
                    <svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true">
                      <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  </button>
                  <ul className="dropdown">
                    {item.children.map((c) => (
                      <li key={c}><a href="#">{c}</a></li>
                    ))}
                  </ul>
                </>
              ) : (
                <a className="nav__link" href={item.href}>{item.label}</a>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero" id="tour">
      {/* Replace this block with your own <img> or background-image */}
      <a className="hero__link" href="#tour" aria-label="See tour dates">
        <div className="hero__art">
          <p className="hero__kicker">Live this season</p>
          <h1 className="hero__heading">Tour dates are open</h1>
          <span className="hero__cta">See where I’ll be</span>
        </div>
      </a>
    </section>
  );
}

function Newsletter() {
  const [email, setEmail] = useState<string>("");
  const [done, setDone] = useState<boolean>(false);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: wire this to Mailchimp / Klaviyo / your backend
    setDone(true);
  };

  return (
    <section className="newsletter">
      <h2 className="newsletter__title">the weekly letter</h2>
      <p className="newsletter__sub">a short note in your inbox, every week</p>

      {done ? (
        <p className="newsletter__thanks">You’re subscribed. Check your inbox to confirm.</p>
      ) : (
        <form className="newsletter__form" onSubmit={submit}>
          <label className="sr-only" htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            required
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit">Subscribe</button>
        </form>
      )}

      <p className="newsletter__legal">
        By joining our mailing list, you agree to our <a href="#">Terms of Use</a> and{" "}
        <a href="#">Privacy Policy</a>.
      </p>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="footer__brand">
          <span className="footer__logo">{SITE_NAME}</span>
          <ul className="footer__socials">
            {SOCIALS.map((s) => (
              <li key={s}><a href="#">{s}</a></li>
            ))}
          </ul>
        </div>

        {FOOTER_COLUMNS.map((col) => (
          <div key={col.title} className="footer__col">
            <h3>{col.title}</h3>
            <ul>
              {col.links.map((l) => (
                <li key={l}><a href="#">{l}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="footer__bottom">
        <p>© {new Date().getFullYear()}, {SITE_NAME}</p>
        <ul>
          <li><a href="#">Terms of Use</a></li>
          <li><a href="#">Privacy Policy</a></li>
        </ul>
      </div>
    </footer>
  );
}

export default function App() {
  const [cartCount] = useState<number>(0);

  return (
    <>
      <Header cartCount={cartCount} onSearch={() => alert("Hook up search here")} />
      <main id="main">
        <Hero />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
