/* Seed the Supabase `components` table with the entries from lib/data.ts.
   Usage:
     1. Fill .env.local (see .env.example)
     2. Run supabase/schema.sql in the Supabase SQL Editor
     3. npm run seed
*/
import { createClient } from "@supabase/supabase-js";
import { SEED_ITEMS } from "../lib/data";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

async function main() {
  const rows = SEED_ITEMS.map((i) => ({
    slug: i.slug,
    title: i.title,
    category: i.category,
    type: i.type,
    description: i.description,
    tags: i.tags,
    tech: i.tech,
    prompt: i.prompt,
    code: i.code ?? null,
    author: i.author,
    hue: i.hue,
    pattern: i.pattern,
    variants: i.variants ?? null,
    copies: i.copies,
    featured: !!i.pro,
    created_at: new Date(i.createdAt).toISOString(),
  }));

  const { error } = await supabase
    .from("components")
    .upsert(rows, { onConflict: "slug" });

  if (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
  console.log(`Seeded ${rows.length} components into Supabase.`);
}

main();
