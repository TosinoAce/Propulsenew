import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowUpRight, Clock, Newspaper } from "lucide-react";
import supabase from "../lib/supabase";
import { formatPostDate } from "../lib/constants";
import MainLayout from "../layout/MainLayout";
import Seo, { breadcrumbs } from "../components/Seo";
import EmptyState from "../components/EmptyState";
import ListingImage from "../components/ListingImage";
import PageHeader from "../components/PageHeader";
import Reveal from "../components/Reveal";
import { readingMinutes } from "../components/RichText";
import Tilt from "../components/motion/Tilt";

const EASE = [0.16, 1, 0.3, 1];

const PostMeta = ({ post, light = false }) => (
  <p className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-sm ${light ? "text-white/75" : "text-muted"}`}>
    {post.category && (
      <span className={`rounded-full px-3 py-1 font-medium ${light ? "bg-white/15 text-white" : "bg-accent-soft text-accent-deep"}`}>
        {post.category}
      </span>
    )}
    <span>{formatPostDate(post.published_at)}</span>
    <span className="flex items-center gap-1">
      <Clock className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
      {readingMinutes(post.body)} min read
    </span>
  </p>
);

/** The blog index: the newest post as a large feature, then the rest as cards, filterable by category. */
const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [category, setCategory] = useState("");

  useEffect(() => {
    let active = true;
    supabase
      .from("posts")
      .select("id, title, slug, excerpt, body, cover_url, category, author_name, published_at")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .then(({ data, error: loadError }) => {
        if (!active) return;
        if (loadError) {
          console.error("Failed to load posts:", loadError);
          setError(true);
        } else {
          setPosts(data);
        }
        setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const categories = [...new Set(posts.map((post) => post.category).filter(Boolean))];
  const visible = category ? posts.filter((post) => post.category === category) : posts;
  const [feature, ...rest] = visible;

  return (
    <MainLayout>
      <Seo
        title="Blog: buying property in Nigeria"
        description="Guides to buying land and houses in Nigeria, from title documents to land banking, plus news from Propulse and our verified partners."
        jsonLd={breadcrumbs([{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }])}
      />
      <PageHeader
        title="The Propulse blog"
        text="Guides to buying property in Nigeria, news from our partners, and how we work."
      />

      <section className="shell">
        {categories.length > 1 && (
          <Reveal className="mb-8 flex w-max max-w-full flex-wrap gap-1 rounded-full bg-tint p-1" role="group" aria-label="Filter by category">
            {["", ...categories].map((entry) => {
              const active = entry === category;
              return (
                <button
                  key={entry || "all"}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCategory(entry)}
                  className={`relative rounded-full px-4 py-2 text-[15px] transition-colors duration-300 ${active ? "text-white" : "text-muted hover:text-ink"}`}
                >
                  {active && (
                    <motion.span layoutId="blog-category" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 380, damping: 32 }} />
                  )}
                  <span className="relative">{entry || "All posts"}</span>
                </button>
              );
            })}
          </Reveal>
        )}

        {loading ? (
          <div className="flex flex-col gap-6" aria-hidden="true">
            <div className="skeleton aspect-[21/9] !rounded-3xl" />
            <div className="grid gap-6 md:grid-cols-3">
              {Array.from({ length: 3 }, (_, i) => <div key={i} className="skeleton h-80 !rounded-3xl" />)}
            </div>
          </div>
        ) : error ? (
          <EmptyState icon={Newspaper} title="We could not load the blog" text="Please check your connection and refresh the page." />
        ) : !feature ? (
          <EmptyState icon={Newspaper} title="No posts yet" text="Our first articles are on the way. Please check back soon." />
        ) : (
          <>
            {/* Newest post as a feature */}
            <Reveal key={feature.id}>
              <Link to={`/blog/${feature.slug}`} className="group relative block overflow-hidden rounded-3xl bg-ink">
                <div className="relative aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9]">
                  <ListingImage src={feature.cover_url} alt="" sizes="100vw" fetchPriority="high" className="transition-transform duration-[1200ms] ease-out-expo group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" aria-hidden="true" />
                </div>
                <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-6 p-6 sm:p-10">
                  <div className="max-w-2xl">
                    <PostMeta post={feature} light />
                    <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tighter text-white sm:text-5xl">{feature.title}</h2>
                    {feature.excerpt && <p className="mt-3 max-w-[56ch] text-lg leading-relaxed text-white/80">{feature.excerpt}</p>}
                  </div>
                  <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-accent text-ink transition-transform duration-500 ease-out-expo group-hover:rotate-45">
                    <ArrowUpRight className="size-6" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </Reveal>

            {rest.length > 0 && (
              <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.7, delay: (index % 3) * 0.06, ease: EASE }}
                  >
                    <Tilt max={4} className="h-full">
                      <Link
                        to={`/blog/${post.slug}`}
                        className="group flex h-full flex-col rounded-3xl border border-line bg-panel p-2.5 shadow-card transition-shadow duration-500 hover:shadow-lift"
                      >
                        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-tint">
                          <ListingImage src={post.cover_url} alt="" loading="lazy" className="transition-transform duration-700 ease-out-expo group-hover:scale-[1.06]" />
                        </div>
                        <div className="flex flex-1 flex-col px-3 pb-3 pt-4">
                          <PostMeta post={post} />
                          <h3 className="mt-3 text-xl font-semibold tracking-tight text-ink">{post.title}</h3>
                          {post.excerpt && <p className="mt-2 line-clamp-3 leading-relaxed text-muted">{post.excerpt}</p>}
                          <p className="mt-auto pt-5 text-sm font-medium text-ink">
                            <span className="inline-flex items-center gap-1.5 border-b border-transparent transition-colors duration-300 group-hover:border-ink">
                              Read the article
                              <ArrowUpRight className="size-4" strokeWidth={1.75} aria-hidden="true" />
                            </span>
                          </p>
                        </div>
                      </Link>
                    </Tilt>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </MainLayout>
  );
};

export default Blog;
