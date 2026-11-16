import { useCallback, useEffect, useState } from "react";
import { Briefcase, ExternalLink, Eye, Inbox, Mail, Pencil, Phone, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import supabase from "../lib/supabase";
import { APPLICATION_STATUS, EMPLOYMENT_TYPES, formatPostDate, slugify } from "../lib/constants";
import Button from "../components/button";
import EmptyState from "../components/EmptyState";
import Field from "../components/Field";
import Select from "../components/Select";
import { describeError } from "./errors";
import { AdminHeader, Drawer, ErrorNote, Toggle } from "./ui";

const EMPTY = {
  id: null,
  title: "",
  team: "",
  location: "",
  employment_type: "Full-time",
  summary: "",
  body: "",
  is_open: true,
};

const STATUS_STYLE = {
  new: "bg-accent text-ink",
  reviewing: "bg-accent-soft text-accent-deep",
  interview: "bg-ink text-white",
  closed: "bg-tint text-muted",
};

/** Open roles and the applications sent for them. */
const AdminCareers = () => {
  const [tab, setTab] = useState("roles");
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [form, setForm] = useState(null);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const [jobResult, applicationResult] = await Promise.all([
      supabase.from("jobs").select("*").order("created_at", { ascending: false }),
      supabase.from("job_applications").select("*, job:jobs(id, title, slug)").order("created_at", { ascending: false }),
    ]);
    const error = jobResult.error || applicationResult.error;
    if (error) {
      console.error("Failed to load careers:", error);
      setLoadError(describeError(error, "We could not load the roles and applications."));
    } else {
      setJobs(jobResult.data);
      setApplications(applicationResult.data);
      setLoadError("");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const closeForm = useCallback(() => setForm(null), []);
  const openForm = (job) => {
    setFormError("");
    setForm(job ? { ...EMPTY, ...job, team: job.team ?? "", location: job.location ?? "", employment_type: job.employment_type ?? "Full-time", summary: job.summary ?? "" } : EMPTY);
  };
  const setField = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));
  const handleInput = (event) => setField(event.target.name, event.target.value);

  const handleSave = async (event) => {
    event.preventDefault();
    if (saving) return;

    const title = form.title.trim();
    if (title.length < 3) return setFormError("Please enter the role title.");
    if (!form.body.trim()) return setFormError("Please describe the role.");

    setSaving(true);
    setFormError("");

    const record = {
      title,
      team: form.team.trim() || null,
      location: form.location.trim() || null,
      employment_type: form.employment_type || null,
      summary: form.summary.trim() || null,
      body: form.body,
      is_open: form.is_open,
      updated_at: new Date().toISOString(),
    };

    // A new role gets a web address from its title, with a number added if it is already taken
    let error;
    if (form.id) {
      ({ error } = await supabase.from("jobs").update(record).eq("id", form.id));
    } else {
      const base = slugify(title);
      const taken = new Set(jobs.map((job) => job.slug));
      let slug = base;
      for (let n = 2; taken.has(slug); n += 1) slug = `${base}-${n}`;
      ({ error } = await supabase.from("jobs").insert({ ...record, slug }));
    }

    setSaving(false);
    if (error) {
      console.error("Failed to save role:", error);
      setFormError(describeError(error, "We could not save this role."));
      return;
    }
    setForm(null);
    await load();
  };

  const handleDelete = async (job) => {
    if (!window.confirm(`Delete the "${job.title}" role? Its applications are kept.`)) return;
    const { error } = await supabase.from("jobs").delete().eq("id", job.id);
    if (error) {
      console.error("Failed to delete role:", error);
      setLoadError(describeError(error, "We could not delete this role."));
      return;
    }
    await load();
  };

  const updateApplication = async (application, status) => {
    setApplications((prev) => prev.map((entry) => (entry.id === application.id ? { ...entry, status } : entry)));
    const { error } = await supabase.from("job_applications").update({ status }).eq("id", application.id);
    if (error) {
      console.error("Failed to update application:", error);
      setLoadError(describeError(error, "We could not update that application."));
      setApplications((prev) => prev.map((entry) => (entry.id === application.id ? { ...entry, status: application.status } : entry)));
    }
  };

  const countFor = (jobId) => applications.filter((application) => application.job_id === jobId).length;
  const newApplications = applications.filter((application) => application.status === "new").length;

  const tabs = [
    { value: "roles", label: "Roles", count: jobs.length },
    { value: "applications", label: "Applications", count: newApplications, highlight: newApplications > 0 },
  ];

  return (
    <>
      <AdminHeader title="Careers" text="Post open roles for the careers page and review the applications that come in.">
        {tab === "roles" && (
          <Button onClick={() => openForm(null)}>
            <Plus className="size-4" strokeWidth={2} aria-hidden="true" />
            New role
          </Button>
        )}
      </AdminHeader>

      <ErrorNote>{loadError}</ErrorNote>

      <div className="mb-5 flex w-max gap-1 rounded-full bg-tint p-1" role="tablist" aria-label="Careers sections">
        {tabs.map((entry) => {
          const active = entry.value === tab;
          return (
            <button
              key={entry.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(entry.value)}
              className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-[15px] transition-colors duration-300 ${active ? "text-white" : "text-muted hover:text-ink"}`}
            >
              {active && <motion.span layoutId="careers-tab" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
              <span className="relative">{entry.label}</span>
              {entry.count > 0 && (
                <span className={`relative rounded-full px-2 py-0.5 text-xs font-semibold ${entry.highlight ? "bg-accent text-ink" : active ? "bg-white/20" : "bg-panel"}`}>
                  {entry.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex flex-col gap-3" aria-hidden="true">
          {Array.from({ length: 3 }, (_, i) => <div key={i} className="skeleton h-24 !rounded-2xl" />)}
        </div>
      ) : tab === "roles" ? (
        jobs.length === 0 && !loadError ? (
          <EmptyState icon={Briefcase} title="No roles yet" text="Post a role and it will appear on the careers page." />
        ) : (
          <ul className="flex flex-col gap-3">
            {jobs.map((job) => (
              <li key={job.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-panel p-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-deep">
                  <Briefcase className="size-5" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 font-semibold text-ink">
                    {job.title}
                    <span className={`rounded-full px-2.5 py-0.5 text-sm font-normal ${job.is_open ? "bg-accent-soft text-accent-deep" : "bg-tint text-muted"}`}>
                      {job.is_open ? "Open" : "Closed"}
                    </span>
                  </p>
                  <p className="truncate text-sm text-muted">
                    {[job.team, job.location, job.employment_type].filter(Boolean).join(", ")}
                    {`, ${countFor(job.id)} ${countFor(job.id) === 1 ? "application" : "applications"}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  {job.is_open && (
                    <Button to={`/careers/${job.slug}`} variant="ghost" size="sm" aria-label={`View ${job.title} on the site`}>
                      <Eye className="size-4" strokeWidth={1.75} aria-hidden="true" />
                    </Button>
                  )}
                  <Button variant="secondary" size="sm" onClick={() => openForm(job)}>
                    <Pencil className="size-4" strokeWidth={1.75} aria-hidden="true" />
                    Edit
                  </Button>
                  <Button variant="danger" size="sm" aria-label={`Delete ${job.title}`} onClick={() => handleDelete(job)}>
                    <Trash2 className="size-4" strokeWidth={1.75} aria-hidden="true" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )
      ) : applications.length === 0 && !loadError ? (
        <EmptyState icon={Inbox} title="No applications yet" text="Applications sent from the careers page will appear here." />
      ) : (
        <ul className="flex flex-col gap-3">
          {applications.map((application) => (
            <li key={application.id} className="rounded-2xl border border-line bg-panel p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 font-semibold text-ink">
                    {application.name}
                    <span className={`rounded-full px-2.5 py-0.5 text-sm font-normal ${STATUS_STYLE[application.status]}`}>
                      {APPLICATION_STATUS[application.status]}
                    </span>
                  </p>
                  <p className="text-sm text-muted">
                    {application.job ? `For ${application.job.title}` : "Role since removed"}, {formatPostDate(application.created_at)}
                  </p>
                </div>
                <div className="w-40">
                  <Select
                    pill
                    className="!min-h-9 !py-1 text-sm"
                    aria-label={`Status of the application from ${application.name}`}
                    value={application.status}
                    onChange={(value) => updateApplication(application, value)}
                    options={Object.entries(APPLICATION_STATUS).map(([value, label]) => ({ value, label }))}
                  />
                </div>
              </div>

              {application.message && (
                <p className="mt-4 max-w-[75ch] whitespace-pre-line leading-relaxed text-ink-soft">{application.message}</p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {application.cv_link && (
                  <Button variant="primary" size="sm" href={application.cv_link} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="size-4" strokeWidth={1.75} aria-hidden="true" />
                    Open CV
                  </Button>
                )}
                <Button variant="secondary" size="sm" href={`mailto:${application.email}`}>
                  <Mail className="size-4" strokeWidth={1.75} aria-hidden="true" />
                  {application.email}
                </Button>
                {application.phone && (
                  <Button variant="secondary" size="sm" href={`tel:${application.phone.replace(/[^\d+]/g, "")}`}>
                    <Phone className="size-4" strokeWidth={1.75} aria-hidden="true" />
                    {application.phone}
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Drawer open={Boolean(form)} title={form?.id ? "Edit role" : "New role"} onClose={closeForm}>
        {form && (
          <form onSubmit={handleSave} noValidate className="flex flex-col gap-5">
            <Field label="Role title">
              {(props) => <input {...props} name="title" value={form.title} onChange={handleInput} />}
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Team">
                {(props) => <input {...props} name="team" placeholder="For example: Operations" value={form.team} onChange={handleInput} />}
              </Field>
              <Field label="Location">
                {(props) => <input {...props} name="location" placeholder="For example: Lagos, hybrid" value={form.location} onChange={handleInput} />}
              </Field>
              <Field label="Type">
                {(props) => (
                  <Select {...props} value={form.employment_type} onChange={(value) => setField("employment_type", value)} options={EMPLOYMENT_TYPES} />
                )}
              </Field>
            </div>
            <Field label="Summary" hint="One sentence shown in the list of open roles.">
              {(props) => <textarea {...props} name="summary" maxLength={320} className={`${props.className} !min-h-20`} value={form.summary} onChange={handleInput} />}
            </Field>
            <Field
              label="Full description"
              hint='Leave a blank line between paragraphs. Start a line with "## " for a heading and "- " for a bullet point.'
            >
              {(props) => <textarea {...props} name="body" className={`${props.className} !min-h-80 leading-relaxed`} value={form.body} onChange={handleInput} />}
            </Field>
            <Toggle
              label="Open for applications"
              hint="Turn off to take the role off the careers page."
              checked={form.is_open}
              onChange={(value) => setField("is_open", value)}
            />

            <ErrorNote>{formError}</ErrorNote>

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={closeForm}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save role"}</Button>
            </div>
          </form>
        )}
      </Drawer>
    </>
  );
};

export default AdminCareers;
