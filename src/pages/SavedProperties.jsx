import { useEffect, useState } from "react";
import axios from "axios";
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
        const savedRes = await axios.get(
          `http://localhost:5000/savedProperties?userId=${user.id}`
        );

        if (savedRes.data.length === 0) {
          setSavedProperties([]);
          setLoading(false);
          return;
        }

        const propsRes = await axios.get(
          "http://localhost:5000/properties"
        );

        const joined = savedRes.data
          .map(item => {
            const prop = propsRes.data.find(
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
        await axios.delete(`http://localhost:5000/savedProperties/${savedId}`);
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
