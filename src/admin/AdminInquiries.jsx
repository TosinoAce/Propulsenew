import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Inbox, Mail, Phone } from "lucide-react";
import supabase from "../lib/supabase";
import { INQUIRY_STATUS } from "../lib/constants";
import Button from "../components/button";
import EmptyState from "../components/EmptyState";
import Select from "../components/Select";
import { describeError } from "./errors";
import { AdminHeader, ErrorNote } from "./ui";

const FILTERS = [{ value: "all", label: "All" }, ...Object.entries(INQUIRY_STATUS).map(([value, label]) => ({ value, label }))];

const formatDate = (value) =>
  new Date(value).toLocaleString("en-NG", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

const STATUS_STYLE = {
  new: "bg-accent text-ink",
  contacted: "bg-accent-soft text-accent-deep",
  closed: "bg-tint text-muted",
};

/** One inbox for property inquiries, contact messages and the land banking waitlist. */
const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("inquiries")
      .select('*, property:properties(id, "propertyName")')
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load inquiries:", error);
      setError(describeError(error, "We could not load the inquiries."));
    } else {
      setInquiries(data);
      setError("");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (inquiry, status) => {
    // Show the change at once and put it back if the save fails
    setInquiries((prev) => prev.map((entry) => (entry.id === inquiry.id ? { ...entry, status } : entry)));

    const { error } = await supabase.from("inquiries").update({ status }).eq("id", inquiry.id);
    if (error) {
      console.error("Failed to update inquiry:", error);
      setError(describeError(error, "We could not update that inquiry."));
      setInquiries((prev) => prev.map((entry) => (entry.id === inquiry.id ? { ...entry, status: inquiry.status } : entry)));
    }
  };

  const counts = inquiries.reduce((totals, inquiry) => ({ ...totals, [inquiry.status]: (totals[inquiry.status] ?? 0) + 1 }), {});
  const visible = filter === "all" ? inquiries : inquiries.filter((inquiry) => inquiry.status === filter);

  return (
    <>
      <AdminHeader
        title="Inquiries"
        text="Messages from property pages, the contact form and the land banking waitlist. Pass each one to the partner, then mark how far it has got."
      />

      <ErrorNote>{error}</ErrorNote>

      <div role="group" aria-label="Filter by status" className="mb-5 flex flex-wrap gap-1 rounded-full bg-tint p-1 sm:w-max">
        {FILTERS.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={filter === option.value}
            onClick={() => setFilter(option.value)}
            className={`rounded-full px-4 py-2 text-[15px] transition-colors duration-300 ${
              filter === option.value ? "bg-ink text-white" : "text-muted hover:text-ink"
            }`}
          >
            {option.label}
            {option.value !== "all" && counts[option.value] > 0 && ` (${counts[option.value]})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col gap-3" aria-hidden="true">
          {Array.from({ length: 4 }, (_, i) => <div key={i} className="skeleton h-36 !rounded-2xl" />)}
        </div>
      ) : visible.length === 0 && !error ? (
        <EmptyState
          icon={Inbox}
          title={filter === "all" ? "No inquiries yet" : `Nothing marked ${INQUIRY_STATUS[filter].toLowerCase()}`}
          text="New messages from the site will appear here."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((inquiry) => (
            <li key={inquiry.id} className="rounded-2xl border border-line bg-panel p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 font-semibold text-ink">
                    {inquiry.name}
                    <span className={`rounded-full px-2.5 py-0.5 text-sm font-normal ${STATUS_STYLE[inquiry.status]}`}>
                      {INQUIRY_STATUS[inquiry.status]}
                    </span>
                  </p>
                  <p className="text-sm text-muted">
                    {formatDate(inquiry.created_at)}
                    {", "}
                    {inquiry.topic && <span className="font-medium text-ink">{inquiry.topic}, </span>}
                    {inquiry.property ? (
                      <>
                        about{" "}
                        <Link to={`/property/${inquiry.property.id}`} className="font-medium text-accent-deep underline underline-offset-2">
                          {inquiry.property.propertyName}
                        </Link>
                        {inquiry.realtor_name && ` (${inquiry.realtor_name})`}
                      </>
                    ) : (
                      "general message"
                    )}
                  </p>
                </div>
                <div className="w-40">
                  <Select
                    pill
                    className="!min-h-9 !py-1 text-sm"
                    aria-label={`Status of the inquiry from ${inquiry.name}`}
                    value={inquiry.status}
                    onChange={(value) => updateStatus(inquiry, value)}
                    options={Object.entries(INQUIRY_STATUS).map(([value, label]) => ({ value, label }))}
                  />
                </div>
              </div>

              <p className="mt-4 max-w-[75ch] whitespace-pre-line leading-relaxed text-ink-soft">{inquiry.message}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" href={`mailto:${inquiry.email}`}>
                  <Mail className="size-4" strokeWidth={1.75} aria-hidden="true" />
                  {inquiry.email}
                </Button>
                {inquiry.phone && (
                  <Button variant="secondary" size="sm" href={`tel:${inquiry.phone.replace(/[^\d+]/g, "")}`}>
                    <Phone className="size-4" strokeWidth={1.75} aria-hidden="true" />
                    {inquiry.phone}
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default AdminInquiries;
