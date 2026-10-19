import {
  useEffect,
  useLayoutEffect,
  useState,
  type Dispatch,
  type FormEvent,
  type ReactNode,
  type SetStateAction,
} from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import "./App.css";
import "./theme.css";

const SITE_NAME = "Saloni Shah";

// Set to false before the final launch to hide the color picker.
const SHOW_THEME_PANEL = true;

const AMAZON_URL =
  "https://www.amazon.com.au/Listening-Silences-Somewhere-Saloni-Shah/dp/1923843311";

// ---- Theme (colors the client can change) ----
type ThemeKey =
  | "headerBg" | "headerInk"
  | "heroFrom" | "heroTo" | "heroInk"
  | "introBg" | "introInk"
  | "newsBg" | "newsInk" | "newsBtn"
  | "footerBg" | "footerInk"
  | "pageBg" | "pageInk"
  | "accent";

type Theme = Record<ThemeKey, string>;

// Brand colors: rust #C44A21, yellow #EFDE25, blue #012169.
// When the client picks final colors, paste them here to make them the default.
const DEFAULT_THEME: Theme = {
  headerBg: "#012169",
  headerInk: "#efde25",
  heroFrom: "#c44a21",
  heroTo: "#c44a21",
  heroInk: "#ffffff",
  introBg: "#fff8ea",
  introInk: "#012169",
  newsBg: "#efde25",
  newsInk: "#012169",
  newsBtn: "#012169",
  footerBg: "#012169",
  footerInk: "#ffffff",
  pageBg: "#c44a21",
  pageInk: "#ffffff",
  accent: "#efde25",
};

const CSS_VARS: Record<ThemeKey, string> = {
  headerBg: "--header-bg",
  headerInk: "--header-ink",
  heroFrom: "--hero-from",
  heroTo: "--hero-to",
  heroInk: "--hero-ink",
  introBg: "--intro-bg",
  introInk: "--intro-ink",
  newsBg: "--news-bg",
  newsInk: "--news-ink",
  newsBtn: "--news-btn",
  footerBg: "--footer-bg",
  footerInk: "--footer-ink",
  pageBg: "--page-bg",
  pageInk: "--page-ink",
  accent: "--accent",
};

const THEME_GROUPS: { title: string; fields: { key: ThemeKey; label: string }[] }[] = [
  {
    title: "Header and menu",
    fields: [
      { key: "headerBg", label: "Background" },
      { key: "headerInk", label: "Text" },
    ],
  },
  {
    title: "Hero banner",
    fields: [
      { key: "heroFrom", label: "Background (start)" },
      { key: "heroTo", label: "Background (end)" },
      { key: "heroInk", label: "Text" },
    ],
  },
  {
    title: "Intro about the poet",
    fields: [
      { key: "introBg", label: "Background" },
      { key: "introInk", label: "Text" },
    ],
  },
  {
    title: "Newsletter",
    fields: [
      { key: "newsBg", label: "Background" },
      { key: "newsInk", label: "Text" },
      { key: "newsBtn", label: "Button" },
    ],
  },
  {
    title: "Footer",
    fields: [
      { key: "footerBg", label: "Background" },
      { key: "footerInk", label: "Text" },
    ],
  },
  {
    title: "Other pages",
    fields: [
      { key: "pageBg", label: "Background" },
      { key: "pageInk", label: "Text" },
    ],
  },
  {
    title: "Highlights",
    fields: [{ key: "accent", label: "Headings and buttons" }],
  },
];

// Bumped to v2 so colors saved from the earlier draft don't hide the new palette.
const STORAGE_KEY = "site-theme-v2";
const HEX = /^#[0-9a-f]{6}$/i;

function loadTheme(): Theme {
  if (!SHOW_THEME_PANEL) return DEFAULT_THEME;
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    const merged: Theme = { ...DEFAULT_THEME };
    (Object.keys(DEFAULT_THEME) as ThemeKey[]).forEach((k) => {
      if (typeof saved[k] === "string" && HEX.test(saved[k])) merged[k] = saved[k];
    });
    return merged;
  } catch {
    return DEFAULT_THEME;
  }
}

// Picks blue or white text so a button label stays readable on any color.
function readableOn(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6 ? "#012169" : "#ffffff";
}

type ThemePanelProps = {
  theme: Theme;
  setTheme: Dispatch<SetStateAction<Theme>>;
};

function ThemePanel({ theme, setTheme }: ThemePanelProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const copy = async () => {
    const json = JSON.stringify(theme, null, 2);
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy these colors:", json);
    }
  };

  return (
    <div className="tp">
      <button
        className="tp__toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        {open ? "Close" : "Customize colors"}
      </button>

      {open && (
        <div className="tp__panel" role="dialog" aria-label="Customize colors">
          <p className="tp__intro">
            Pick a color for each part of the site. Changes show right away and are saved in this
            browser.
          </p>

          {THEME_GROUPS.map((group) => (
            <fieldset key={group.title} className="tp__group">
              <legend>{group.title}</legend>
              {group.fields.map((f) => (
                <label key={f.key} className="tp__row">
                  <span>{f.label}</span>
                  <span className="tp__ctl">
                    <code>{theme[f.key]}</code>
                    <input
                      type="color"
                      value={theme[f.key]}
                      onChange={(e) => setTheme((t) => ({ ...t, [f.key]: e.target.value }))}
                    />
                  </span>
                </label>
              ))}
            </fieldset>
          ))}

          <div className="tp__actions">
            <button onClick={() => setTheme(DEFAULT_THEME)}>Reset</button>
            <button onClick={copy}>{copied ? "Copied" : "Copy my colors"}</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Navigation ----
type NavChild = { label: string; to: string };
type NavItem = { label: string; to?: string; children?: NavChild[] };

const NAV: NavItem[] = [
  {
    label: "Books",
    children: [{ label: "Listening Silences", to: "/books/listening-silences" }],
  },
  { label: "About Me", to: "/about-me" },
  { label: "Events", to: "/events" },
  { label: "Blog", to: "/blog" },
  { label: "Shop", to: "/shop" },
];

const SOCIALS: string[] = ["Facebook", "Instagram", "YouTube", "Twitter"];

// ---- Layout pieces ----
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Header() {
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const closeDrawer = () => setDrawerOpen(false);

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

        <Link className="header__title" to="/" onClick={closeDrawer}>{SITE_NAME}</Link>
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
                      <li key={c.to}>
                        <Link to={c.to} onClick={closeDrawer}>{c.label}</Link>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <Link className="nav__link" to={item.to!} onClick={closeDrawer}>
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </header>
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

        <div className="footer__col">
          <h3>Explore</h3>
          <ul>
            <li><Link to="/books/listening-silences">Listening Silences</Link></li>
            <li><Link to="/about-me">About Me</Link></li>
            <li><Link to="/events">Events</Link></li>
            <li><Link to="/blog">Blog</Link></li>
            <li><Link to="/shop">Shop</Link></li>
          </ul>
        </div>
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

function Page({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="page">
      <h1 className="page__title">{title}</h1>
      {children}
    </section>
  );
}

function BuyButton() {
  return (
    <a className="btn" href={AMAZON_URL} target="_blank" rel="noopener noreferrer">
      Buy on Amazon
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
        <path d="M3 11L11 3M5 3h6v6" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </a>
  );
}

// ---- Poet intro (shared by Home and About Me) ----
function Bio() {
  return (
    <div className="bio">
      <p className="bio__lead">
        Saloni Shah is a poet, storyteller, and listener based in Adelaide, Australia.
      </p>
      <p>
        Born and raised in Palanpur, India, she has been writing since childhood, drawn to the
        quiet stories hidden within everyday life. Shaped by family, migration, education, and a
        career in technology, her poetry explores silence, memory, belonging, compassion, and
        becoming.
      </p>
      <p>
        She is fascinated by the way small, often-overlooked moments linger in the heart and
        reveal deeper truths, and her work listens closely to the spaces between speech and
        silence.
      </p>
      <p>
        <Link className="bio__book" to="/books/listening-silences">Listening Silences</Link> is
        her first poetry collection.
      </p>
    </div>
  );
}

// ---- Pages ----
function Hero() {
  return (
    <section className="hero">
      <Link className="hero__link" to="/books/listening-silences" aria-label="Explore Listening Silences">
        <div className="hero__art">
          <p className="hero__kicker">The first poetry collection</p>
          <h1 className="hero__heading">Listening Silences</h1>
          <span className="hero__cta">Explore the book</span>
        </div>
      </Link>
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
      <div className="newsletter__inner">
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
      </div>
    </section>
  );
}

function HomePage() {
  return (
    <>
      <Hero />
      <section className="intro">
        <div className="intro__inner">
          <Bio />
          <Link className="intro__more" to="/about-me">More about me</Link>
        </div>
      </section>
      <Newsletter />
    </>
  );
}

function BookPage() {
  return (
    <Page title="Listening Silences">
      <div className="book">
        <div className="book__cover">
          <img src="/img/listening_silences.jpg" alt="Listening Silences book cover" />
        </div>
        <div className="book__body">
          <p className="book__tag">Poetry collection by {SITE_NAME}</p>
          <p>Listening Silences is Saloni Shah’s first poetry collection.</p>
          <BuyButton />
        </div>
      </div>
    </Page>
  );
}

function AboutPage() {
  return (
    <Page title="About Me">
      <Bio />
    </Page>
  );
}

function ShopPage() {
  return (
    <Page title="Shop">
      <article className="product">
        <div className="product__cover">
          <img src="/img/listening_silences.jpg" alt="Listening Silences book cover" />
        </div>
        <div className="product__body">
          <p className="product__eyebrow">Poetry collection</p>
          <h2 className="product__title">Listening Silences</h2>
          <p className="product__author">by {SITE_NAME}</p>
          <p className="product__note">Order your copy from Amazon Australia.</p>
          <BuyButton />
        </div>
      </article>
    </Page>
  );
}

function EventsPage() {
  return (
    <Page title="Events">
      <p className="muted">Upcoming events will be listed here.</p>
    </Page>
  );
}

function BlogPage() {
  return (
    <Page title="Blog">
      <p className="muted">Posts will appear here.</p>
    </Page>
  );
}

function CartPage() {
  return (
    <Page title="Cart">
      <p className="muted">Your cart is empty.</p>
    </Page>
  );
}

function NotFound() {
  return (
    <Page title="Page not found">
      <p><Link className="bio__book" to="/">Back to the home page</Link></p>
    </Page>
  );
}

export default function App() {
  const [theme, setTheme] = useState<Theme>(loadTheme);

  // Push the chosen colors into CSS variables and remember them.
  useLayoutEffect(() => {
    const root = document.documentElement;
    (Object.keys(CSS_VARS) as ThemeKey[]).forEach((k) => {
      root.style.setProperty(CSS_VARS[k], theme[k]);
    });
    root.style.setProperty("--news-btn-ink", readableOn(theme.newsBtn));
    root.style.setProperty("--accent-ink", readableOn(theme.accent));

    if (SHOW_THEME_PANEL) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
      } catch {
        /* storage unavailable, colors just won't persist */
      }
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Header />
      <main id="main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/books/listening-silences" element={<BookPage />} />
          <Route path="/about-me" element={<AboutPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      {SHOW_THEME_PANEL && <ThemePanel theme={theme} setTheme={setTheme} />}
    </BrowserRouter>
  );
}
