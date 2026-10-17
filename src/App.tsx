import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import "./App.css";

const SITE_NAME = "Saloni Shah";

// ---- Navigation ----
type NavChild = { label: string; to: string };
type NavItem = { label: string; to?: string; children?: NavChild[] };

const NAV: NavItem[] = [
  {
    label: "Books",
    children: [{ label: "Listening Silences", to: "/books/listening-silences" }],
  },
  { label: "About Me", to: "/about-me" },
  { label: "Tour and Events", to: "/tour" },
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

type HeaderProps = { cartCount: number; onSearch: () => void };

function Header({ cartCount, onSearch }: HeaderProps) {
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

        <div className="header__actions">
          <button className="link-btn" onClick={onSearch}>Search</button>
          {/* <Link className="link-btn" to="/cart" onClick={closeDrawer}>
            Cart{cartCount > 0 && <span className="badge">{cartCount}</span>}
          </Link> */}
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
            <li><Link to="/tour">Tour and Events</Link></li>
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

function HomePage() {
  return (
    <>
      <Hero />
      <section className="intro">
        <Bio />
        <Link className="intro__more" to="/about-me">More about me</Link>
      </section>
      <Newsletter />
    </>
  );
}

function BookPage() {
  return (
    <Page title="Listening Silences">
      <div className="book">
        <div className="book__cover" aria-hidden="true">
          <img src="/img/listening_silences.jpg" alt="Listening Silences cover" />
        </div>
        <div className="book__body">
          <p className="book__tag">Poetry collection by {SITE_NAME}</p>
          <p>Listening Silences is Saloni Shah’s first poetry collection.</p>
          <p className="muted">Add the book description, excerpts, and buy links here.</p>
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
      <p className="muted">Products will appear here.</p>
    </Page>
  );
}

function TourPage() {
  return (
    <Page title="Tour and Events">
      <p className="muted">Upcoming events will be listed here.</p>
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
  const [cartCount] = useState<number>(0);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Header cartCount={cartCount} onSearch={() => alert("Hook up search here")} />
      <main id="main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/books/listening-silences" element={<BookPage />} />
          <Route path="/about-me" element={<AboutPage />} />
          <Route path="/tour" element={<TourPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}
