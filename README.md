# uiory — AI-Built Component Showcase

A Next.js 15 + React 19 + Tailwind CSS v4 + GSAP gallery for UI components
built with AI tools. Every card carries the exact prompt that built it
(anyone can copy it), and compare cards show the same prompt built by two
different AI builders, side by side.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start   # production
```

`.env.local` is already filled in with the project's Supabase URL and
publishable key.

## One-time Supabase setup

1. Open the Supabase project → **SQL Editor** → paste `supabase/schema.sql`
   → **Run**. This creates the `components` table, the `profiles` table,
   the storage bucket `component-media`, all Row Level Security policies,
   and the trigger that makes the **first signed-up user the admin**.
2. Optional but recommended while developing: **Authentication →
   Providers → Email** → turn **Confirm email** off, so signups can sign
   in immediately (no confirmation email round-trip).
3. Open the site → **Sign up**. The first account becomes the admin;
   every later account is a normal user.

## Pages & accounts

- `/` — Homepage: hero, filter/sort/search, the component grid.
  Cards open the detail as an overlay at `/?prompt=[slug]` — big media
  preview, copy-the-prompt button, builder switcher for comparisons,
  the visible full prompt and the component code (when uploaded).
- `/signup`, `/login` — Supabase Auth (email + password).
- `/dashboard` — Normal-user dashboard: name, email, account type,
  member since. No admin powers.
- `/admin` — Admin only (others are redirected): component list,
  stats, search, delete — plus dedicated create (`/admin/new`) and
  edit (`/admin/[slug]/edit`) pages.
- `/components/[slug]` — redirects to `/?prompt=[slug]`.

## Uploading a component (admin)

- **Preview media**: drag & drop or click to browse — image (JPG/PNG/WebP),
  GIF, or video (MP4/WebM/MOV), up to 50 MB. Files go to the public
  Supabase Storage bucket and play inline on cards and the detail page.
- **Prompt**: the exact prompt text (public, copyable).
- **Component code**: paste it, or upload the code file — it is shown on
  the detail page with its own copy button.
- **Compare A/B**: same prompt, two builders — tool, model, time taken,
  verdict, strengths per builder.

## How the data flows

- `lib/db.ts` talks straight to Supabase from the browser with the
  publishable key. Security lives in the database (RLS): reads are
  public; inserts/updates/deletes and storage uploads succeed only for
  signed-in admins. No service-role key is used by the app.
- If the Supabase env vars are removed, the app falls back to
  browser-local storage so the flow still works offline.
- An empty database means an empty homepage — there are no demo items.
