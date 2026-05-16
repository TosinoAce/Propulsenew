import { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import MainLayout from "../layout/MainLayout";
import PCard from "../components/PCard";
import { useAuth } from "../auth/AuthContext";
import "../components/PropertyContent.css"; // Reuse the grid layout styles

const SavedProperties = () => {
  const { user } = useAuth();
  const [savedProperties, setSavedProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data: savedData, error: savedError } = await supabase
          .from('savedProperties')
          .select('*')
          .eq('userId', user.id);

        if (savedError) throw savedError;

        if (!savedData || savedData.length === 0) {
          setSavedProperties([]);
          setLoading(false);
          return;
        }

        const propertyIds = savedData.map(item => item.propertyId);

        const { data: propsData, error: propsError } = await supabase
          .from('properties')
          .select('*')
          .in('id', propertyIds);

        if (propsError) throw propsError;

        const joined = savedData
          .map(item => {
            const prop = propsData.find(
              p => String(p.id) === String(item.propertyId)
            );
            return prop ? { ...prop, savedId: item.id } : null;
          })
          .filter(Boolean);

        setSavedProperties(joined);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleRemove = async (savedId) => {
    if (!window.confirm("Are you sure you want to remove this property?")) return;

    try {
        const { error } = await supabase
          .from('savedProperties')
          .delete()
          .eq('id', savedId);

        if (error) throw error;
        
        setSavedProperties(prev => prev.filter(p => p.savedId !== savedId));
    } catch (err) {
        console.error("Failed to remove property:", err);
        alert("Failed to remove property. Please try again.");
    }
  };

  if (loading) return <MainLayout><p>Loading saved properties...</p></MainLayout>;

  if (!user) return <MainLayout><p>Please log in to view saved properties.</p></MainLayout>;

  return (
    <MainLayout>
      <div className="savedContainer">
        <h2>Saved Properties</h2>

        {savedProperties.length === 0 ? (
          <p>You have no saved properties.</p>
        ) : (
          <div className="P-cardContainer">
            {savedProperties.map(property => (
              <PCard
                key={property.id}
                id={property.id}
                image={property.propertyImage}
                details={property.propertyDetails}
                name={property.propertyName}
                location={property.propertyLocation}
                price={property.propertyPrice}
                onRemove={() => handleRemove(property.savedId)}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default SavedProperties;
