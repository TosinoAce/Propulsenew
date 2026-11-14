import { ArrowRight, Building2 } from "lucide-react";
import Button from "../button";
import EmptyState from "../EmptyState";
import PropertyCard, { PropertyCardSkeleton } from "../PropertyCard";
import Reveal from "../Reveal";

const FEATURED_COUNT = 5;

const Featured = ({ properties, loading, error }) => {
  const featured = properties.slice(0, FEATURED_COUNT);
  const [lead, ...rest] = featured;

  const renderGrid = () => {
    if (loading) {
      return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => <PropertyCardSkeleton key={i} />)}
        </div>
      );
    }

    if (error) {
      return (
        <EmptyState
          icon={Building2}
          title="Listings are unavailable right now"
          text="We could not load the latest properties. Please check your connection and refresh the page."
        />
      );
    }

    if (featured.length === 0) {
      return (
        <EmptyState
          icon={Building2}
          title="New listings are on the way"
          text="There are no properties listed yet. Please check back soon."
        />
      );
    }

    // One lead listing beside a 2 x 2 block of the next four
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal>
          <PropertyCard property={lead} feature />
        </Reveal>
        <div className="grid gap-6 sm:grid-cols-2">
          {rest.map((property, index) => (
            <Reveal key={property.id} delay={0.08 * (index + 1)}>
              <PropertyCard property={property} />
            </Reveal>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section className="shell py-24 lg:py-28">
      <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-semibold tracking-tighter text-ink sm:text-5xl">
            Fresh on the market
          </h2>
          <p className="mt-4 max-w-[52ch] text-lg leading-relaxed text-muted">
            The newest land and houses added to Propulse.
          </p>
        </div>
        <Button to="/property" variant="secondary">
          Browse properties
          <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
        </Button>
      </Reveal>

      {renderGrid()}
    </section>
  );
};

export default Featured;
