import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, useScroll, useSpring } from "motion/react";
import { ArrowLeft, Clock, Link2, Share2, SearchX } from "lucide-react";
import supabase from "../lib/supabase";
import { formatPostDate, getInitials } from "../lib/constants";
import { SIZES } from "../lib/images";
import MainLayout from "../layout/MainLayout";
import Seo, { absoluteUrl, breadcrumbs } from "../components/Seo";
import Button from "../components/button";
import EmptyState from "../components/EmptyState";
import ListingImage from "../components/ListingImage";
import Reveal from "../components/Reveal";
import RichText, { readingMinutes } from "../components/RichText";
import CtaBand from "../components/CtaBand";
import ParallaxImage from "../components/motion/ParallaxImage";

const EASE = [0.16, 1, 0.3, 1];

/** One blog post, with a reading-progress bar and links to more posts. */
const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [more, setMore] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [shareNote, setShareNote] = useState("");

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 28 });

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);

    const load = async () => {
      const { data, error: loadError } = await supabase
        .from("posts")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      if (!active) return;
      if (loadError) {
        console.error("Failed to load post:", loadError);
        setError(true);
        setLoading(false);
        return;
      }
      setPost(data);
      setLoading(false);

      if (data) {
        const { data: others } = await supabase
          .from("posts")
          .select("id, title, slug, excerpt, cover_url, category, published_at")
          .eq("is_published", true)
          .neq("id", data.id)
          .order("published_at", { ascending: false })
          .limit(2);
        if (active && others) setMore(others);
      }
    };

    load();
    return () => { active = false; };
  }, [slug]);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: post.title, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareNote("Link copied");
        setTimeout(() => setShareNote(""), 2500);
      }
    } catch (err) {
      if (err?.name !== "AbortError") setShareNote("Could not share");
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="shell min-h-[100dvh] max-w-3xl pt-32" aria-hidden="true">
          <div className="skeleton h-5 w-32" />
          <div className="skeleton mt-6 h-14 w-full" />
          <div className="skeleton mt-8 aspect-[16/9] !rounded-3xl" />
        </div>
      </MainLayout>
    );
  }

  if (error || !post) {
    return (
      <MainLayout>
        <div className="shell pt-28">
          <EmptyState
            icon={SearchX}
            title={error ? "Something went wrong" : "Article not found"}
            text={error ? "We could not load this article. Please try again." : "This article may have been moved or taken down."}
          >
            <Button to="/blog">Back to the blog</Button>
          </EmptyState>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Seo
        title={post.title}
        description={post.excerpt ?? post.body.slice(0, 200)}
        image={post.cover_url?.replace(/\.(jpe?g|png)$/i, "-1280.webp")}
        type="article"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt ?? undefined,
            image: post.cover_url ? [absoluteUrl(post.cover_url)] : undefined,
            datePublished: post.published_at,
            dateModified: post.updated_at,
            inLanguage: "en-NG",
            articleSection: post.category ?? undefined,
            author: { "@type": "Person", name: post.author_name || "Propulse team", jobTitle: post.author_role ?? undefined },
            publisher: { "@type": "Organization", name: "Propulse", logo: { "@type": "ImageObject", url: absoluteUrl("/icon-512.png") } },
            mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
          },
          breadcrumbs([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
        ]}
      />
      {/* Reading progress, just under the navigation bar */}
      <motion.div aria-hidden="true" className="fixed inset-x-0 top-[72px] z-30 h-[3px] origin-left bg-accent" style={{ scaleX: progress }} />

      <article>
        <motion.header
          className="shell max-w-4xl pt-32"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <Link to="/blog" className="inline-flex items-center gap-2 text-muted transition-colors duration-300 hover:text-ink">
            <ArrowLeft className="size-4" strokeWidth={1.75} aria-hidden="true" />
            All posts
          </Link>
          {post.category && (
            <p className="mt-8 text-sm font-medium uppercase tracking-[0.18em] text-accent-deep">{post.category}</p>
          )}
          <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tighter text-ink sm:text-6xl">{post.title}</h1>
          {post.excerpt && <p className="mt-5 max-w-[60ch] text-xl leading-relaxed text-muted">{post.excerpt}</p>}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-y border-line py-5">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white">
                {getInitials(post.author_name || "Propulse")}
              </span>
              <div>
                <p className="font-medium text-ink">{post.author_name || "Propulse team"}</p>
                <p className="flex flex-wrap items-center gap-x-2 text-sm text-muted">
                  {post.author_role && <span>{post.author_role},</span>}
                  <span>{formatPostDate(post.published_at)}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
                    {readingMinutes(post.body)} min read
                  </span>
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                href={`https://wa.me/?text=${encodeURIComponent(`${post.title} ${window.location.href}`)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Share2 className="size-4" strokeWidth={1.75} aria-hidden="true" />
                WhatsApp
              </Button>
              <Button variant="secondary" size="sm" onClick={handleShare}>
                <Link2 className="size-4" strokeWidth={1.75} aria-hidden="true" />
                {shareNote || "Share"}
              </Button>
            </div>
          </div>
        </motion.header>

        {post.cover_url && (
          <motion.div
            className="shell mt-10 max-w-5xl"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
          >
            <ParallaxImage src={post.cover_url} alt="" className="aspect-[16/9]" shift={5} sizes={SIZES.full} fetchPriority="high" />
          </motion.div>
        )}

        <Reveal className="shell mt-12 max-w-3xl">
          <RichText source={post.body} />
        </Reveal>
      </article>

      {more.length > 0 && (
        <section className="shell mt-24 max-w-5xl">
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-tighter text-ink sm:text-4xl">Keep reading</h2>
          </Reveal>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {more.map((entry, index) => (
              <Reveal key={entry.id} delay={index * 0.08}>
                <Link to={`/blog/${entry.slug}`} className="group flex gap-5 rounded-3xl border border-line bg-panel p-3 transition-shadow duration-500 hover:shadow-lift">
                  <div className="relative aspect-square w-28 shrink-0 overflow-hidden rounded-2xl bg-tint sm:w-36">
                    <ListingImage src={entry.cover_url} alt="" loading="lazy" sizes="160px" className="transition-transform duration-700 ease-out-expo group-hover:scale-105" />
                  </div>
                  <div className="min-w-0 py-2 pr-2">
                    {entry.category && <p className="text-sm font-medium text-accent-deep">{entry.category}</p>}
                    <h3 className="mt-1 text-lg font-semibold tracking-tight text-ink">{entry.title}</h3>
                    <p className="mt-1 text-sm text-muted">{formatPostDate(entry.published_at)}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <CtaBand />
    </MainLayout>
  );
};

export default BlogPost;
