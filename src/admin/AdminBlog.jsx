import { useCallback, useEffect, useState } from "react";
import { Eye, FilePen, Newspaper, Pencil, Plus, Trash2 } from "lucide-react";
import supabase from "../lib/supabase";
import { formatPostDate, slugify } from "../lib/constants";
import Button from "../components/button";
import EmptyState from "../components/EmptyState";
import Field from "../components/Field";
import ListingImage from "../components/ListingImage";
import RichText from "../components/RichText";
import { describeError } from "./errors";
import { AdminHeader, Drawer, ErrorNote, ImagePicker, Toggle } from "./ui";

const EMPTY = {
  id: null,
  title: "",
  slug: "",
  category: "",
  excerpt: "",
  cover_url: "",
  author_name: "",
  author_role: "",
  body: "",
  is_published: false,
  published_at: null,
};

const FORMAT_HINT = 'Leave a blank line between paragraphs. Start a line with "## " for a heading and "- " for a bullet point.';

const AdminBlog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [form, setForm] = useState(null);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
    if (error) {
      console.error("Failed to load posts:", error);
      setLoadError(describeError(error, "We could not load the posts."));
    } else {
      setPosts(data);
      setLoadError("");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const closeForm = useCallback(() => setForm(null), []);
  const openForm = (post) => {
    setFormError("");
    setPreview(false);
    setForm(post ? { ...EMPTY, ...post, category: post.category ?? "", excerpt: post.excerpt ?? "", cover_url: post.cover_url ?? "", author_name: post.author_name ?? "", author_role: post.author_role ?? "" } : EMPTY);
  };

  const setField = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));
  const handleInput = (event) => setField(event.target.name, event.target.value);

  const handleSave = async (event) => {
    event.preventDefault();
    if (saving) return;

    const title = form.title.trim();
    const slug = form.id ? form.slug : slugify(form.slug.trim() || title);
    if (title.length < 3) return setFormError("Please enter a title.");
    if (!slug) return setFormError("Please enter a web address for the post.");
    if (form.is_published && !form.body.trim()) return setFormError("A published post needs some body text.");

    setSaving(true);
    setFormError("");

    const record = {
      title,
      category: form.category.trim() || null,
      excerpt: form.excerpt.trim() || null,
      cover_url: form.cover_url || null,
      author_name: form.author_name.trim() || null,
      author_role: form.author_role.trim() || null,
      body: form.body,
      is_published: form.is_published,
      // The first time a post goes live it gets its publish date
      published_at: form.is_published ? form.published_at ?? new Date().toISOString() : form.published_at,
      updated_at: new Date().toISOString(),
    };

    const { error } = form.id
      ? await supabase.from("posts").update(record).eq("id", form.id)
      : await supabase.from("posts").insert({ ...record, slug });

    setSaving(false);
    if (error) {
      console.error("Failed to save post:", error);
      setFormError(describeError(error, "We could not save this post."));
      return;
    }
    setForm(null);
    await load();
  };

  const handleDelete = async (post) => {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("posts").delete().eq("id", post.id);
    if (error) {
      console.error("Failed to delete post:", error);
      setLoadError(describeError(error, "We could not delete this post."));
      return;
    }
    await load();
  };

  const categories = [...new Set(posts.map((post) => post.category).filter(Boolean))];

  return (
    <>
      <AdminHeader title="Blog" text="Write and publish articles. Drafts stay hidden from the site until you publish them.">
        <Button onClick={() => openForm(null)}>
          <Plus className="size-4" strokeWidth={2} aria-hidden="true" />
          New post
        </Button>
      </AdminHeader>

      <ErrorNote>{loadError}</ErrorNote>

      {loading ? (
        <div className="flex flex-col gap-3" aria-hidden="true">
          {Array.from({ length: 4 }, (_, i) => <div key={i} className="skeleton h-24 !rounded-2xl" />)}
        </div>
      ) : posts.length === 0 && !loadError ? (
        <EmptyState icon={Newspaper} title="No posts yet" text="Write your first article for the Propulse blog." />
      ) : (
        <ul className="flex flex-col gap-3">
          {posts.map((post) => (
            <li key={post.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-panel p-3">
              <div className="relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-xl bg-tint">
                <ListingImage src={post.cover_url} loading="lazy" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 font-semibold text-ink">
                  {post.title}
                  <span className={`rounded-full px-2.5 py-0.5 text-sm font-normal ${post.is_published ? "bg-accent-soft text-accent-deep" : "bg-tint text-muted"}`}>
                    {post.is_published ? "Published" : "Draft"}
                  </span>
                </p>
                <p className="truncate text-sm text-muted">
                  {[post.category, post.author_name, post.is_published ? formatPostDate(post.published_at) : `Last edited ${formatPostDate(post.updated_at)}`]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
              <div className="flex gap-2">
                {post.is_published && (
                  <Button to={`/blog/${post.slug}`} variant="ghost" size="sm" aria-label={`View ${post.title} on the site`}>
                    <Eye className="size-4" strokeWidth={1.75} aria-hidden="true" />
                  </Button>
                )}
                <Button variant="secondary" size="sm" onClick={() => openForm(post)}>
                  <Pencil className="size-4" strokeWidth={1.75} aria-hidden="true" />
                  Edit
                </Button>
                <Button variant="danger" size="sm" aria-label={`Delete ${post.title}`} onClick={() => handleDelete(post)}>
                  <Trash2 className="size-4" strokeWidth={1.75} aria-hidden="true" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Drawer open={Boolean(form)} title={form?.id ? "Edit post" : "New post"} onClose={closeForm}>
        {form && (
          <form onSubmit={handleSave} noValidate className="flex flex-col gap-5">
            <Field label="Title">
              {(props) => <input {...props} name="title" value={form.title} onChange={handleInput} />}
            </Field>

            {!form.id && (
              <Field label="Web address" hint={`The post will live at /blog/${slugify(form.slug || form.title) || "..."}. It cannot be changed later.`}>
                {(props) => <input {...props} name="slug" placeholder="Leave empty to use the title" value={form.slug} onChange={handleInput} />}
              </Field>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category" hint="For example: Buying guide, Investing, Company.">
                {(props) => (
                  <>
                    <input {...props} name="category" list="post-categories" value={form.category} onChange={handleInput} />
                    <datalist id="post-categories">
                      {categories.map((entry) => <option key={entry} value={entry} />)}
                    </datalist>
                  </>
                )}
              </Field>
              <div />
              <Field label="Author">
                {(props) => <input {...props} name="author_name" value={form.author_name} onChange={handleInput} />}
              </Field>
              <Field label="Author's role">
                {(props) => <input {...props} name="author_role" value={form.author_role} onChange={handleInput} />}
              </Field>
            </div>

            <div>
              <p className="text-sm font-medium text-ink">Cover image</p>
              {form.cover_url && (
                <div className="relative mt-2 aspect-[16/9] overflow-hidden rounded-2xl bg-tint">
                  <ListingImage src={form.cover_url} />
                </div>
              )}
              <div className="mt-3">
                <ImagePicker label={form.cover_url ? "Replace cover" : "Upload cover"} folder="blog" onUploaded={(url) => setField("cover_url", url)} />
              </div>
            </div>

            <Field label="Summary" hint="One or two sentences shown on the blog page. Up to 320 characters.">
              {(props) => <textarea {...props} name="excerpt" maxLength={320} className={`${props.className} !min-h-24`} value={form.excerpt} onChange={handleInput} />}
            </Field>

            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-ink">Article</p>
                <div className="flex gap-1 rounded-full bg-tint p-1 text-sm" role="group" aria-label="Write or preview">
                  {[
                    { value: false, label: "Write", icon: FilePen },
                    { value: true, label: "Preview", icon: Eye },
                  ].map((mode) => (
                    <button
                      key={mode.label}
                      type="button"
                      aria-pressed={preview === mode.value}
                      onClick={() => setPreview(mode.value)}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors duration-300 ${preview === mode.value ? "bg-ink text-white" : "text-muted hover:text-ink"}`}
                    >
                      <mode.icon className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>
              {preview ? (
                <div className="mt-2 min-h-80 rounded-2xl border border-line p-5">
                  {form.body.trim() ? <RichText source={form.body} className="!text-base" /> : <p className="text-muted">Nothing written yet.</p>}
                </div>
              ) : (
                <>
                  <textarea
                    aria-label="Article"
                    className="field-input mt-2 !min-h-80 font-[inherit] leading-relaxed"
                    name="body"
                    value={form.body}
                    onChange={handleInput}
                  />
                  <p className="mt-2 text-sm text-muted">{FORMAT_HINT}</p>
                </>
              )}
            </div>

            <Toggle
              label="Published"
              hint="Turn on to show this post on the blog."
              checked={form.is_published}
              onChange={(value) => setField("is_published", value)}
            />

            <ErrorNote>{formError}</ErrorNote>

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={closeForm}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : form.is_published ? "Save and publish" : "Save draft"}
              </Button>
            </div>
          </form>
        )}
      </Drawer>
    </>
  );
};

export default AdminBlog;
