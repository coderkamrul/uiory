/* ------------------------------------------------------------------ */
/*  Data model for the showcase.                                       */
/*                                                                     */
/*  Every entry is a component that was built with an AI tool.         */
/*  - "single"  entries showcase one build.                            */
/*  - "compare" entries showcase the SAME prompt built by two tools   */
/*    (e.g. Muse vs Claude) side by side.                             */
/*                                                                     */
/*  The `prompt` is the exact text visitors can copy. Entries added    */
/*  from the dashboard are stored in the browser (localStorage) and    */
/*  merged with these seed entries on the homepage.                    */
/* ------------------------------------------------------------------ */

export type ShowcaseType = "single" | "compare";

export interface BuildVariant {
  tool: string;        // e.g. "Muse AI", "Claude"
  model: string;       // e.g. "Muse Spark", "Claude Sonnet"
  timeTaken: string;   // e.g. "~25 min, 4 iterations"
  verdict: string;     // one-line takeaway
  hue: number;         // preview accent hue (0-360)
  strengths: string[];
  mediaUrl?: string;   // uploaded preview media for this variant
  mediaType?: "image" | "video";
}

export interface Sponsor {
  name: string;        // e.g. "Build in Kimi"
  tagline: string;     // e.g. "Agentic AI for coding"
  url: string;         // e.g. "https://kimi.ai"
  logoUrl?: string;    // logo icon url
}

export const DEFAULT_SPONSORS: Sponsor[] = [
  {
    name: "Build in Kimi",
    tagline: "Agentic AI for coding",
    url: "https://kimi.ai",
    logoUrl: "https://www.google.com/s2/favicons?domain=kimi.ai&sz=128",
  },
  {
    name: "Build in Manus",
    tagline: "General AI agent",
    url: "https://manus.im",
    logoUrl: "https://www.google.com/s2/favicons?domain=manus.im&sz=128",
  },
  {
    name: "Build in AI Studio",
    tagline: "Build apps with Gemini",
    url: "https://aistudio.google.com",
    logoUrl: "https://www.google.com/s2/favicons?domain=aistudio.google.com&sz=128",
  },
];

export interface ShowcaseItem {
  slug: string;
  title: string;
  category: string;
  type: ShowcaseType;
  description: string;
  tags: string[];
  tech: string[];
  prompt: string;
  code?: string;
  author: string;
  createdAt: string;   // ISO date
  pro?: boolean;
  copies: number;      // how often the prompt was copied (seed value)
  imageUrl?: string;   // legacy preview image URL (pre-media-upload entries)
  mediaUrl?: string;   // uploaded preview media (Supabase Storage public URL)
  mediaType?: "image" | "video"; // what mediaUrl points at (GIFs count as image)
  hue: number;         // preview accent hue (0-360)
  pattern: "hero" | "card" | "button" | "pricing" | "nav" | "form" | "footer" | "dashboard";
  variants?: [BuildVariant, BuildVariant]; // compare entries only
  sponsors?: Sponsor[];
}

export const CATEGORIES = [
  "All",
  "Hero",
  "Button",
  "Card",
  "Pricing",
  "Navbar",
  "Form",
  "Footer",
  "Dashboard",
  "Animation",
] as const;

export const SEED_ITEMS: ShowcaseItem[] = [
  {
    slug: "jelly-signup-button",
    title: "Jelly Sign Up Button — Bowl of Water",
    category: "Button",
    type: "single",
    description:
      "A sign-up button that behaves like a shallow bowl of water. Touch it and ripples spread from your cursor; drag and the wave follows your finger. Tick the terms box and a droplet fills it blue, letter by letter.",
    tags: ["webgl", "ripple", "interactive", "physics", "micro-interaction"],
    tech: ["WebGL", "GLSL", "Vanilla JS", "Single HTML file"],
    prompt:
      "Build a sign-up button in ONE self-contained HTML file. The button is a shallow bowl of water, not a solid pill: the surface is flat, the rim stays steady, and my cursor is a finger touching the water. On hover, ripples must radiate from the exact touch point (even when the mouse is still) and follow the cursor when it moves, with a small bow wave ahead of the finger. A checkbox 'I agree to the Terms & Conditions' sits above it; the button starts grey and disabled. Ticking the box drops ONE blue droplet onto the button, which splashes and then fills left to right with a wavy front, turning the letters white one by one as it passes. On click, the label 'Sign up' must MORPH (gooey liquid morph, not a swap) into '✓ Signed up!'. Use a real-time heightfield wave simulation rendered with WebGL shaders; no external libraries.",
    code: "/* Full source: the single-file build lives in the jelly-signup-button project. */",
    author: "Studio",
    createdAt: "2026-10-25",
    pro: true,
    copies: 128,
    hue: 217,
    pattern: "button",
  },
  {
    slug: "signup-button-muse-vs-claude",
    title: "Same Prompt, Two Builders: Jelly Button",
    category: "Button",
    type: "compare",
    description:
      "One prompt, two AI builders. Both got the same liquid sign-up button brief. Compare how each interpreted 'jelly' — and copy the prompt to run the experiment yourself.",
    tags: ["experiment", "comparison", "webgl", "css"],
    tech: ["WebGL", "CSS", "JavaScript"],
    prompt:
      "Make a 'Sign up' button that feels like jelly: it squishes when hovered, wobbles when clicked, and fills with blue liquid when a checkbox above it is ticked. Single HTML file, no external libraries.",
    author: "Studio",
    createdAt: "2026-10-25",
    pro: true,
    copies: 342,
    hue: 262,
    pattern: "button",
    variants: [
      {
        tool: "Muse AI",
        model: "Muse Spark",
        timeTaken: "5 iterations",
        verdict: "Built a real wave simulation — ripples are physics, not keyframes.",
        hue: 217,
        strengths: ["Real heightfield water simulation", "Ripples follow the cursor exactly", "Gooey text morph on click"],
      },
      {
        tool: "Claude",
        model: "Claude Sonnet",
        timeTaken: "2 iterations",
        verdict: "Faster to a pretty result, but the jelly is CSS springs — no real ripples.",
        hue: 262,
        strengths: ["Cleaner, shorter code", "Great spring physics on the whole button", "No WebGL fallback issues"],
      },
    ],
  },
  {
    slug: "elastic-card-fan-hero",
    title: "Elastic Card Fan Hero",
    category: "Hero",
    type: "single",
    description:
      "A landing hero where five cards fan out elastically (−26° to +26°) and settle with a soft idle float. Scrolling scrubs the fan open and closed. Editorial cream background, serif italic accents, one blue accent colour.",
    tags: ["hero", "scroll-animation", "gsap", "editorial"],
    tech: ["Tailwind CDN", "GSAP ScrollTrigger", "Single HTML file"],
    prompt:
      "Build a landing page hero in one HTML file: cream background (#F5F2EB), Inter font with Instrument Serif italic accent words, one blue accent (#2438FF). Five image cards fan out elastically from −26° to +26° on load and float gently when idle. Scrolling scrubs the fan rotation with GSAP ScrollTrigger. No arrow-button carousels — all motion is scroll-driven or automatic. Add a floating-cards split section and a marquee strip.",
    author: "Studio",
    createdAt: "2026-10-21",
    copies: 96,
    hue: 36,
    pattern: "hero",
  },
  {
    slug: "pricing-toggle-muse-vs-claude",
    title: "Same Prompt, Two Builders: Pricing Table",
    category: "Pricing",
    type: "compare",
    description:
      "A monthly/annual pricing toggle with animated prices. Same brief to both builders — one reached for a design system, the other for raw CSS. Copy the prompt and judge for yourself.",
    tags: ["experiment", "comparison", "pricing", "toggle"],
    tech: ["React", "Tailwind CSS"],
    prompt:
      "Build a pricing section with three tiers and a monthly/annual toggle. Prices must animate (count) between values when toggled, annual shows a 'save 20%' badge, the middle tier is highlighted. Clean light design, rounded-2xl cards, soft shadows.",
    author: "Studio",
    createdAt: "2026-10-19",
    copies: 187,
    hue: 152,
    pattern: "pricing",
    variants: [
      {
        tool: "Muse AI",
        model: "Muse Spark",
        timeTaken: "1 iteration",
        verdict: "Animated the numbers with a proper easing count-up and highlighted tier glow.",
        hue: 152,
        strengths: ["Count-up price animation", "Accessible toggle (aria-pressed)", "Responsive stacking handled"],
      },
      {
        tool: "Claude",
        model: "Claude Sonnet",
        timeTaken: "1 iteration",
        verdict: "Nearly identical output; differed mainly in shadow depth and badge placement.",
        hue: 199,
        strengths: ["Slightly tighter spacing", "Badge design more playful", "Code ~15% shorter"],
      },
    ],
  },
  {
    slug: "glass-navbar-blur",
    title: "Glass Navbar with Scroll Blur",
    category: "Navbar",
    type: "single",
    description:
      "A sticky navbar that starts transparent and gains a frosted-glass blur, border and shadow as you scroll. Mobile menu animates in with staggered links.",
    tags: ["navbar", "glassmorphism", "scroll"],
    tech: ["React", "Tailwind CSS"],
    prompt:
      "Build a sticky navbar component: transparent at the top of the page, and after 24px of scroll it gains a frosted glass background (backdrop-blur), a 1px bottom border and a soft shadow, all transitioned smoothly. Logo left, links centre, CTA button right. On mobile, a hamburger opens a full-width dropdown with links staggering in. React + Tailwind.",
    author: "Studio",
    createdAt: "2026-10-18",
    copies: 74,
    hue: 199,
    pattern: "nav",
  },
  {
    slug: "faq-accordion-editorial",
    title: "Editorial FAQ Accordion",
    category: "Form",
    type: "single",
    description:
      "A two-column FAQ in an editorial style: big serif questions, hairline dividers, smooth height animation, only one item open at a time.",
    tags: ["faq", "accordion", "editorial"],
    tech: ["Vanilla JS", "CSS Grid"],
    prompt:
      "Build an FAQ accordion in an editorial style: two-column layout (sticky heading left, questions right), hairline dividers between items, large serif question type, smooth height animation when opening, plus/minus icon that rotates. Only one item open at a time. No frameworks, one HTML file.",
    author: "Studio",
    createdAt: "2026-10-17",
    copies: 41,
    hue: 20,
    pattern: "form",
  },
  {
    slug: "analytics-dashboard-cards",
    title: "Analytics Dashboard Stat Cards",
    category: "Dashboard",
    type: "single",
    description:
      "A row of dashboard stat cards with sparklines, delta badges and count-up numbers. Dark sidebar companion layout included in the prompt.",
    tags: ["dashboard", "charts", "cards"],
    tech: ["React", "SVG"],
    prompt:
      "Build a dashboard stat-card row: four cards (Revenue, Users, Orders, Conversion), each with a count-up number, a green/red delta badge vs last week, and an inline SVG sparkline drawn from sample data. Light cards, 1px borders, rounded-2xl, soft shadow. React, no chart libraries — hand-rolled SVG sparklines.",
    author: "Studio",
    createdAt: "2026-10-15",
    copies: 63,
    hue: 174,
    pattern: "dashboard",
  },
  {
    slug: "hero-muse-vs-claude",
    title: "Same Prompt, Two Builders: SaaS Hero",
    category: "Hero",
    type: "compare",
    description:
      "One SaaS hero brief, two builders. The difference shows in the details: one wrote better copy, the other built the tighter layout grid.",
    tags: ["experiment", "comparison", "hero", "saas"],
    tech: ["Next.js", "Tailwind CSS"],
    prompt:
      "Build a SaaS landing hero: eyebrow badge, two-line headline with one gradient word, sub-copy, two CTAs (primary dark, secondary outline), a row of avatar faces with 'trusted by' text, and a product screenshot mock built from pure CSS blocks below. Light background, professional, rounded-2xl, soft shadows.",
    author: "Studio",
    createdAt: "2026-10-12",
    copies: 158,
    hue: 222,
    pattern: "hero",
    variants: [
      {
        tool: "Muse AI",
        model: "Muse Spark",
        timeTaken: "2 iterations",
        verdict: "Stronger layout structure and spacing system; copy was generic.",
        hue: 222,
        strengths: ["Consistent 8px spacing system", "CSS screenshot mock very detailed", "Best responsive behaviour"],
      },
      {
        tool: "Claude",
        model: "Claude Sonnet",
        timeTaken: "2 iterations",
        verdict: "Better headline copy and micro-interactions; grid slightly looser.",
        hue: 280,
        strengths: ["Sharper headline copy", "Nice hover states on CTAs", "Avatar stack with status dots"],
      },
    ],
  },
  {
    slug: "big-footer-cta",
    title: "Footer with Giant Wordmark",
    category: "Footer",
    type: "single",
    description:
      "A black footer panel with a newsletter row, link columns, and a giant cropped wordmark along the bottom edge.",
    tags: ["footer", "wordmark", "dark"],
    tech: ["Tailwind CSS", "HTML"],
    prompt:
      "Build a footer component: black background panel with rounded top corners. Top row: newsletter signup (input + button, with JS validation and success message). Middle: four link columns. Bottom: a giant wordmark in very large type, cropped by the footer's bottom edge. One HTML file with Tailwind CDN.",
    author: "Studio",
    createdAt: "2026-10-10",
    copies: 37,
    hue: 240,
    pattern: "footer",
  },
];

export function getItem(slug: string): ShowcaseItem | undefined {
  return SEED_ITEMS.find((i) => i.slug === slug);
}

export function relatedItems(item: ShowcaseItem, n = 3): ShowcaseItem[] {
  return SEED_ITEMS.filter(
    (i) => i.slug !== item.slug && (i.category === item.category || i.type === item.type)
  ).slice(0, n);
}

/* ---- Supabase row mapping (table: public.components) ---- */
export interface ComponentRow {
  slug: string;
  title: string;
  category: string;
  type: ShowcaseType;
  description: string;
  tags: string[];
  tech: string[];
  prompt: string;
  code: string | null;
  author: string;
  hue: number;
  pattern: ShowcaseItem["pattern"];
  image_url: string | null;
  media_url: string | null;
  media_type: "image" | "video" | null;
  variants: [BuildVariant, BuildVariant] | null;
  copies: number;
  featured: boolean;
  created_at: string;
  sponsors?: Sponsor[] | null;
}

export function rowToItem(r: ComponentRow): ShowcaseItem {
  return {
    slug: r.slug,
    title: r.title,
    category: r.category,
    type: r.type,
    description: r.description ?? "",
    tags: r.tags ?? [],
    tech: r.tech ?? [],
    prompt: r.prompt,
    code: r.code ?? undefined,
    author: r.author ?? "Studio",
    createdAt: r.created_at ?? new Date().toISOString(),
    pro: r.featured ?? false,
    copies: r.copies ?? 0,
    imageUrl: r.image_url ?? undefined,
    mediaUrl: r.media_url ?? r.image_url ?? undefined,
    mediaType: r.media_type ?? (r.image_url ? "image" : undefined),
    hue: r.hue ?? 222,
    pattern: r.pattern ?? "card",
    variants: r.variants ?? undefined,
    sponsors: Array.isArray(r.sponsors) && r.sponsors.length > 0 ? r.sponsors : undefined,
  };
}

export function itemToRow(i: ShowcaseItem): ComponentRow {
  return {
    slug: i.slug,
    title: i.title,
    category: i.category,
    type: i.type,
    description: i.description,
    tags: i.tags,
    tech: i.tech,
    prompt: i.prompt,
    code: i.code ?? null,
    author: i.author || "Studio",
    hue: i.hue,
    pattern: i.pattern,
    image_url:
      i.imageUrl ?? (i.mediaType === "image" ? i.mediaUrl ?? null : null),
    media_url: i.mediaUrl ?? null,
    media_type: i.mediaType ?? (i.mediaUrl ? "image" : null),
    variants: i.variants ?? null,
    copies: i.copies,
    featured: !!i.pro,
    created_at: new Date(i.createdAt || Date.now()).toISOString(),
    sponsors: i.sponsors && i.sponsors.length > 0 ? i.sponsors : null,
  };
}

export const PATTERNS: { id: ShowcaseItem["pattern"]; label: string }[] = [
  { id: "hero", label: "Hero mock" },
  { id: "card", label: "Card mock" },
  { id: "button", label: "Button mock" },
  { id: "pricing", label: "Pricing mock" },
  { id: "nav", label: "Navbar mock" },
  { id: "form", label: "Form mock" },
  { id: "footer", label: "Footer mock" },
  { id: "dashboard", label: "Dashboard mock" },
];

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
