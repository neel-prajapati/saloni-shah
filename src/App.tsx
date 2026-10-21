import {
  useEffect,
  useLayoutEffect,
  useState,
  type Dispatch,
  type FormEvent,
  type ReactNode,
  type SetStateAction,
} from "react";
import { BrowserRouter, Routes, Route, Link, useLocation, useParams } from "react-router-dom";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import "./App.css";
import "./theme.css";
import { getBlogPosts, type BlogPost } from "./blog";

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
      {Math.random()===100 && <button
        className="tp__toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        {open ? "Close" : "Customize colors"}
      </button>}

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
  { label: "Facts about me", to: "/facts-about-me" },
  { label: "Events", to: "/events" },
  { label: "Blog", to: "/blog" },
  { label: "Shop", to: "/shop" },
  { label: "Contact Us", to: "/contact-us" },
];

const SOCIALS = [
  { logo: "/img/insta-logo.png", label: "Saloni Shah on Instagram", href: "https://www.instagram.com/saloni_shah1211" },
  { logo: "/img/x-logo.png", label: "Saloni Shah on X (Twitter)", href: "https://x.com/salonishayara" },
];

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
                  <button className="nav__link" aria-haspopup="true" onClick={() => setDrawerOpen((v) => !v)}>
                    {item.label}
                    <svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true">
                      <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  </button>
                  {drawerOpen && <ul className="dropdown">
                    {item.children.map((c) => (
                      <li key={c.to}>
                        <Link to={c.to} onClick={closeDrawer}>{c.label}</Link>
                      </li>
                    ))}
                  </ul>}
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
            {SOCIALS.map((social) => (
              <>
              <li key={social.label}>
                <a href={social.href} target="_blank" rel="noopener noreferrer">
                  {social.logo && (
                    <img src={social.logo} alt={social.label} style={{ width: "35px", height: "35px", borderRadius: "50%" }} />
                  )}
                  {/* {social.label} */}
                </a>
              </li>
              </>
            ))}
          </ul>
        </div>

        <div className="footer__col">
          <h3>Explore</h3>
          <ul>
            <li><Link to="/books/listening-silences">Listening Silences</Link></li>
            <li><Link to="/about-me">About Me</Link></li>
            <li><Link to="/facts-about-me">Facts about me</Link></li>
            <li><Link to="/events">Events</Link></li>
            <li><Link to="/blog">Blog</Link></li>
            <li><Link to="/shop">Shop</Link></li>
            <li><Link to="/contact-us">Contact Us</Link></li>
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

function Page({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="page">
      {title && <h1 className="page__title">{title}</h1>}
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
function HeroImage() {
  return (
    <section className="hero-image" aria-label="Featured image">
      <img src="/img/hero.png" alt="Featured artwork for Saloni Shah" />
    </section>
  );
}

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


function HomePage() {
  return (
    <>
      <HeroImage />
      <Hero />
      <section className="intro">
        <div className="intro__inner">
          <Bio />
          <Link className="intro__more" to="/about-me">More about me</Link>
        </div>
      </section>
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
          {/* <figure className="book__artwork">
            <img src="/img/art5.jpg" alt="Handwritten poetry artwork on a pale background" loading="lazy" />
            <figcaption>A glimpse into the world of words and feeling.</figcaption>
          </figure> */}
          <BuyButton />
        </div>
      </div>
    </Page>
  );
}

const ARTWORKS = [
  { src: "/img/art1.jpg", alt: "Watercolour artwork with blue washes and a small red flower", caption: "" },
  { src: "/img/art3.jpg", alt: "Blue and red abstract bird artwork", caption: "" },
  { src: "/img/art4.jpg", alt: "Abstract artwork in deep blue and green", caption: "" },
  { src: "/img/art6.jpg", alt: "Colourful radial watercolour artwork", caption: "" },
];

function ArtworkGallery() {
  return (
    <section className="art-gallery" aria-labelledby="art-gallery-title">
      <div className="art-gallery__heading">
        <p className="art-gallery__eyebrow">A little more to explore</p>
        <h2 id="art-gallery-title">Poetry in colour</h2>
        <p>A small selection of artwork inspired by imagination, memory, and the everyday.</p>
      </div>
      <div className="art-gallery__grid">
        {ARTWORKS.map((artwork) => (
          <figure className="art-gallery__item" key={artwork.src}>
            <img src={artwork.src} alt={artwork.alt} loading="lazy" />
            <figcaption>{artwork.caption}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function AboutPage() {
  return (
    <Page title="">
      <article className="about-story">
        <p className="about-story__lead">I am a poet, storyteller, and listener based in Adelaide, Australia.</p>
        <p>Born and raised in Palanpur, India, I have been writing since childhood, always drawn to the quiet stories hidden within everyday life. My journey has been shaped by family, migration, education, and a career in technology, each leaving its own imprint on how I see and experience the world.</p>
        <p>Through my poetry, I explore silence, memory, belonging, compassion, and the ongoing process of becoming. I am fascinated by the small, often-overlooked moments that linger long after they pass, the moments that quietly reveal profound truths about who we are.</p>
        <p>I write to listen as much as to speak. My work dwells in the spaces between words, where silence carries its own language and ordinary experiences unfold into something deeper and more meaningful.</p>
        <p><Link className="about-story__book" to="/books/listening-silences">Listening Silences</Link> is my first poetry collection, an invitation to pause, reflect, and discover the stories that live beneath the surface of everyday life.</p>
      </article>
      <ArtworkGallery />
    </Page>
  );
}

const PERSONAL_FACTS = [
  { icon: "✦", text: "I was the first person in my entire family to study in an English-medium school." },
  { icon: "📚", text: "English wasn't the language of my childhood, yet I went on to publish my first poetry collection in it." },
  { icon: "😅", text: "Confidence is in my bloodline. I can be panicking inside and still look completely composed on the outside." },
  { icon: "🚀", text: 'My default response to exciting opportunities is “yes.” The planning, learning, and confidence usually catch up later.' },
  { icon: "💻", text: "I work in technology, write poetry, and somehow enjoy living between logic and imagination." },
  { icon: "☕", text: "Many of my best ideas arrive with a cup of chai and absolutely no warning." },
  { icon: "🎨", text: "I paint my thoughts before I pen them down. Every poem begins as a feeling, an image, or a scene in my mind long before it becomes words on a page." },
  { icon: "📝", text: "I can spend three hours finding the perfect word and then forget why I opened the fridge." },
  { icon: "🌏", text: "I moved countries and changed continents, but I still mentally convert everything into Indian measurements and family opinions." },
  { icon: "🙈", text: "I often sound like I know exactly what I'm doing. That's a carefully cultivated illusion." },
  { icon: "💭", text: "I overthink for free, but thankfully I also write for free... at least in my head." },
  { icon: "❤️", text: "Some people collect stamps. I collect stories, awkward moments, and life lessons." },
];

function FactsAboutMePage() {
  return (
    <Page title="">
      <div className="facts-stage">
        {/* <div className="facts-decor facts-decor--left" aria-hidden="true">
          <span className="facts-doodle facts-doodle--dove">🕊️</span>
          <span className="facts-doodle facts-doodle--chai">☕</span>
          <span className="facts-doodle facts-doodle--sparkle">✦</span>
          <span className="facts-doodle facts-doodle--paint">🎨</span>
          <img className="facts-art facts-art--left" src="/img/art3.jpg" alt="" />
        </div>
        <div className="facts-decor facts-decor--right" aria-hidden="true">
          <span className="facts-doodle facts-doodle--bird">🐦</span>
          <span className="facts-doodle facts-doodle--laugh">😅</span>
          <span className="facts-doodle facts-doodle--thought">💭</span>
          <span className="facts-doodle facts-doodle--flower">🌼</span>
          <img className="facts-art facts-art--right" src="/img/art6.jpg" alt="" />
        </div> */}
        <div className="facts-content" >
          <section className="facts-intro">
            {/* <p className="facts-intro__eyebrow">A little beyond the poems ✨</p> */}
            <p className="facts-intro__lead">A few little truths, quirks, and wonderfully human contradictions that make me, me.</p>
            {/* <p className="facts-intro__aside">(The fridge story is absolutely true.) 😅</p> */}
          </section>
          <section className="facts-grid" aria-label="Fun facts about Saloni Shah">
            {PERSONAL_FACTS.map((fact, index) => (
              <article className={`fact-card${index === 1200 ? " fact-card--featured" : ""}`} key={fact.text}>
                <span className="fact-card__icon" aria-hidden="true">{fact.icon}</span>
                <p>{fact.text}</p>
                <span className="fact-card__number">{String(index + 1).padStart(2, "0")}</span>
              </article>
            ))}
          </section>
          <p className="facts-signoff">Somewhere between chai, colour, and a carefully chosen word — that’s where you’ll find me.</p>
        </div>
      </div>
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
  const { posts, loading, error, reload } = useBlogPosts();

  return (
    <Page>
      {loading && <p className="muted" role="status">Loading stories…</p>}
      {error && (
        <div className="blog__notice" role="alert">
          <p>Blog posts could not be loaded right now. Please try again.</p>
          <button className="btn" type="button" onClick={reload}>Try again</button>
        </div>
      )}
      {!loading && !error && posts.length === 0 && (
        <p className="muted">New stories are on their way. Please check back soon.</p>
      )}
      {!loading && !error && posts.length > 0 && (
        <div className="blog-list">
          {posts.map((post) => (
            <article className="blog-card" key={post.id}>
              {post.coverImage && (
                <Link to={`/blog/${post.slug}`} tabIndex={-1} aria-hidden="true">
                  <img
                    className="blog-card__image"
                    src={post.coverImage.url}
                    alt={post.coverImage.alt ?? ""}
                    loading="lazy"
                  />
                </Link>
              )}
              <div className="blog-card__content">
                <time className="blog-card__date" dateTime={post.publishedAt}>
                  {formatBlogDate(post.publishedAt)}
                </time>
                <h2 className="blog-card__title">
                  <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>
                {post.excerpt && <p className="blog-card__excerpt">{post.excerpt}</p>}
                <Link className="blog-card__link" to={`/blog/${post.slug}`}>
                  Read the story <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </Page>
  );
}

function useBlogPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;

    getBlogPosts()
      .then((nextPosts) => {
        if (active) setPosts(nextPosts);
      })
      .catch((cause: unknown) => {
        console.error("Unable to load blog posts.", cause);
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [attempt]);

  const reload = () => {
    setLoading(true);
    setError(false);
    setAttempt((value) => value + 1);
  };

  return { posts, loading, error, reload };
}

function formatBlogDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function BlogPostPage() {
  const { slug } = useParams();
  const { posts, loading, error, reload } = useBlogPosts();
  const post = posts.find((item) => item.slug === slug);

  if (loading) {
    return <Page title="Blog"><p className="muted" role="status">Loading story…</p></Page>;
  }

  if (error) {
    return (
      <Page title="Blog">
        <div className="blog__notice" role="alert">
          <p>This story could not be loaded right now. Please try again.</p>
          <button className="btn" type="button" onClick={reload}>Try again</button>
        </div>
      </Page>
    );
  }

  if (!post) {
    return (
      <Page title="Story not found">
        <p className="muted">This story may have been moved or unpublished.</p>
        <p><Link className="blog__back" to="/blog">Back to all stories</Link></p>
      </Page>
    );
  }

  return (
    <article className="page blog-post">
      <Link className="blog__back" to="/blog">← All stories</Link>
      <header className="blog-post__header">
        <time className="blog-card__date" dateTime={post.publishedAt}>
          {formatBlogDate(post.publishedAt)}
        </time>
        <h1 className="page__title">{post.title}</h1>
        {post.excerpt && <p className="blog-post__excerpt">{post.excerpt}</p>}
      </header>
      {post.coverImage && (
        <img className="blog-post__image" src={post.coverImage.url} alt={post.coverImage.alt ?? ""} />
      )}
      <div className="blog-post__body">
        <PortableText value={post.body} components={blogTextComponents} />
      </div>
    </article>
  );
}

const blogTextComponents: PortableTextComponents = {
  marks: {
    link: ({ children, value }) => {
      const href = value?.href;
      if (
        typeof href !== "string" ||
        (!/^https?:\/\//i.test(href) && !/^mailto:/i.test(href))
      ) {
        return <>{children}</>;
      }
      const external = /^https?:\/\//i.test(href);
      return (
        <a href={href} target={external ? "_blank" : undefined} rel="noopener noreferrer">
          {children}
        </a>
      );
    },
  },
};

function ContactPage() {
  const [sending, setSending] = useState<boolean>(false);
  const [status, setStatus] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  const submitContact = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setStatus(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("https://formsubmit.co/ajax/salonishah121190@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          ...payload,
          _subject: `Website contact: ${String(payload.subject ?? "New message")}`,
          _template: "table",
        }),
      });
      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error("The message could not be sent. Please try again.");
      }

      setStatus({
        kind: "success",
        message: "Thanks for reaching out. Your message has been sent.",
      });
      form.reset();
    } catch {
      setStatus({
        kind: "error",
        message: "Sorry, your message could not be sent. Please try again or email salonishah121190@gmail.com directly.",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Page title="Contact Us">
      <div className="contact">
        <p className="contact__intro">Have a question, an event enquiry, or just want to say hello? Send me a message.</p>
        <form className="contact__form" onSubmit={submitContact}>
          <label htmlFor="contact-name">Name</label>
          <input id="contact-name" name="name" type="text" autoComplete="name" required />

          <label htmlFor="contact-email">Email address</label>
          <input id="contact-email" name="email" type="email" autoComplete="email" required />

          <label htmlFor="contact-subject">Subject</label>
          <input id="contact-subject" name="subject" type="text" required />

          <label htmlFor="contact-message">Message</label>
          <textarea id="contact-message" name="message" rows={6} required />

          <button className="btn" type="submit" disabled={sending}>
            {sending ? "Sending…" : "Send message"}
          </button>
          {status && (
            <p className={`contact__status contact__status--${status.kind}`} role="status">
              {status.message}
            </p>
          )}
        </form>
      </div>
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
          <Route path="/facts-about-me" element={<FactsAboutMePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/contact-us" element={<ContactPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      {SHOW_THEME_PANEL && <ThemePanel theme={theme} setTheme={setTheme} />}
    </BrowserRouter>
  );
}
