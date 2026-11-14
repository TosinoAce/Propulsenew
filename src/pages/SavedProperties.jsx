import { useEffect, useState } from "react";
import { Heart, LogIn } from "lucide-react";
import supabase from "../lib/supabase";
import MainLayout from "../layout/MainLayout";
import Button from "../components/button";
import EmptyState from "../components/EmptyState";
import PageHeader from "../components/PageHeader";
import PropertyCard, { PropertyCardSkeleton } from "../components/PropertyCard";
import Reveal from "../components/Reveal";
import { useAuth } from "../auth/AuthContext";

const SavedProperties = () => {
  const { user, isAuthLoading } = useAuth();
  const [savedProperties, setSavedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      setSavedProperties([]);
      setLoading(false);
      return;
    }

    let active = true;

    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const { data: savedData, error: savedError } = await supabase
          .from("savedProperties")
          .select("id, propertyId")
          .eq("userId", user.id)
          .order("created_at", { ascending: false });

        if (savedError) throw savedError;

        let joined = [];
        if (savedData.length > 0) {
          const { data: propsData, error: propsError } = await supabase
            .from("properties")
            .select("*")
            .in("id", savedData.map((entry) => entry.propertyId));

          if (propsError) throw propsError;

          joined = savedData
            .map((entry) => {
              const prop = propsData.find((p) => String(p.id) === String(entry.propertyId));
              return prop ? { ...prop, savedId: entry.id } : null;
            })
            .filter(Boolean);
        }

        if (active) setSavedProperties(joined);
      } catch (err) {
        console.error("Failed to load saved properties:", err);
        if (active) setError("We could not load your saved properties. Please refresh the page.");
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchData();

    return () => { active = false; };
  }, [user, isAuthLoading]);

  const handleRemove = async (savedId) => {
    const { error } = await supabase.from("savedProperties").delete().eq("id", savedId);

    if (error) {
      console.error("Failed to remove property:", error);
      setError("We could not remove that property. Please try again.");
      return;
    }

    setError("");
    setSavedProperties((prev) => prev.filter((p) => p.savedId !== savedId));
  };

  const renderBody = () => {
    if (loading || isAuthLoading) {
      return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => <PropertyCardSkeleton key={i} />)}
        </div>
      );
    }

    if (!user) {
      return (
        <EmptyState
          icon={LogIn}
          title="Sign in to see your shortlist"
          text="Your saved properties are kept with your account so you can return to them on any device."
        >
          <Button to="/login">Sign in</Button>
          <Button to="/signup" variant="secondary">Get started</Button>
        </EmptyState>
      );
    }

    if (savedProperties.length === 0 && !error) {
      return (
        <EmptyState
          icon={Heart}
          title="Nothing saved yet"
          text="Tap Save for later on any property and it will appear here, ready to compare."
        >
          <Button to="/property">Browse properties</Button>
        </EmptyState>
      );
    }

    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {savedProperties.map((property, index) => (
          <Reveal key={property.savedId} delay={(index % 3) * 0.06}>
            <PropertyCard property={property} onRemove={() => handleRemove(property.savedId)} />
          </Reveal>
        ))}
      </div>
    );
  };

  return (
    <MainLayout>
      <PageHeader
        title="Saved properties"
        text="The listings you have shortlisted. Open one to contact its realtor, or remove the ones you have ruled out."
      />
      <section className="shell">
        {error && (
          <p role="alert" className="mb-8 rounded-xl bg-danger/10 px-4 py-3 text-danger">{error}</p>
        )}
        {renderBody()}
      </section>
    </MainLayout>
  );
};

export default SavedProperties;
