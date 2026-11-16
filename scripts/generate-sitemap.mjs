// Writes public/sitemap.xml and public/robots.txt from the live catalog, so search engines
// find every published listing, state page, partner, article and open role.
// Runs before every build (see "prebuild" in package.json).
//
// Set SITE_URL to the site's real address before deploying, for example:
//   SITE_URL=https://www.example.ng npm run build
// It can also go in .env as VITE_SITE_URL=...
import { readFile, writeFile } from "node:fs/promises";

const readEnvFile = async () => {
  try {
    const text = await readFile(".env", "utf8");
    return Object.fromEntries(
      text
        .split(/\r?\n/)
        .map((line) => line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/))
        .filter(Boolean)
        .map(([, key, value]) => [key, value.replace(/^["']|["']$/g, "")])
    );
  } catch {
    return {};
  }
};

const env = { ...(await readEnvFile()), ...process.env };
const PLACEHOLDER = "https://propulse.example.com";
const SITE_URL = (env.SITE_URL || env.VITE_SITE_URL || PLACEHOLDER).replace(/\/+$/, "");
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_KEY = env.VITE_SUPABASE_ANON_KEY;

if (SITE_URL === PLACEHOLDER) {
  console.warn(`Sitemap: SITE_URL is not set, so addresses use ${PLACEHOLDER}. Set it before deploying.`);
}

// Reads rows as an anonymous visitor would, so unpublished or private rows never leak in
const fetchRows = async (table, query) => {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  if (!response.ok) throw new Error(`${table}: HTTP ${response.status}`);
  return response.json();
};

const slugify = (text) =>
  text.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const day = (value) => (value ? new Date(value).toISOString().slice(0, 10) : undefined);

const entries = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/property", priority: "0.9", changefreq: "daily" },
  { path: "/about", priority: "0.6", changefreq: "monthly" },
  { path: "/landbanking", priority: "0.5", changefreq: "monthly" },
  { path: "/blog", priority: "0.7", changefreq: "weekly" },
  { path: "/careers", priority: "0.5", changefreq: "weekly" },
  { path: "/contact", priority: "0.5", changefreq: "yearly" },
];

try {
  if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error("Supabase address or key is missing from .env");

  const [properties, partners, posts, jobs] = await Promise.all([
    fetchRows("properties", 'select=id,"propertyLocationTag",updated_at,created_at&order=id.desc'),
    fetchRows("partners", "select=slug,created_at&is_active=eq.true"),
    fetchRows("posts", "select=slug,updated_at,published_at&is_published=eq.true"),
    fetchRows("jobs", "select=slug,updated_at&is_open=eq.true"),
  ]);

  const states = [...new Set(properties.map((property) => property.propertyLocationTag).filter(Boolean))];
  for (const state of states) {
    entries.push({ path: `/property/in/${slugify(state)}`, priority: "0.8", changefreq: "daily" });
  }
  for (const property of properties) {
    entries.push({ path: `/property/${property.id}`, priority: "0.8", changefreq: "weekly", lastmod: day(property.updated_at || property.created_at) });
  }
  for (const partner of partners) {
    entries.push({ path: `/partners/${partner.slug}`, priority: "0.6", changefreq: "weekly", lastmod: day(partner.created_at) });
  }
  for (const post of posts) {
    entries.push({ path: `/blog/${post.slug}`, priority: "0.6", changefreq: "monthly", lastmod: day(post.updated_at || post.published_at) });
  }
  for (const job of jobs) {
    entries.push({ path: `/careers/${job.slug}`, priority: "0.5", changefreq: "weekly", lastmod: day(job.updated_at) });
  }

  console.log(
    `Sitemap: ${entries.length} pages (${properties.length} listings, ${states.length} states, ${partners.length} partners, ${posts.length} articles, ${jobs.length} roles).`
  );
} catch (error) {
  // A failed lookup should not stop a deploy; the main pages are still listed
  console.warn(`Sitemap: could not read the catalog (${error.message}). Writing the main pages only.`);
}

const escape = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) => `  <url>
    <loc>${escape(SITE_URL + entry.path)}</loc>${entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : ""}
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

const robots = `# Propulse
User-agent: *
Allow: /
Disallow: /admin
Disallow: /login
Disallow: /signup
Disallow: /savedproperties

Sitemap: ${SITE_URL}/sitemap.xml
`;

await writeFile("public/sitemap.xml", xml);
await writeFile("public/robots.txt", robots);
