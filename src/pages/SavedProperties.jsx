import { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../layout/MainLayout";

const SavedProperties = () => {
  const userId = "3";
  const [savedProperties, setSavedProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const savedRes = await axios.get(
          `http://localhost:5000/savedProperties?userId=${userId}`
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
          .map(item =>
            propsRes.data.find(
              prop => prop.id === item.propertyId
            )
          )
          .filter(Boolean);

        setSavedProperties(joined);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading saved properties...</p>;

  return (
    <MainLayout>
      <div className="savedContainer">
        <h2>Saved Properties</h2>

        {savedProperties.length === 0 ? (
          <p>You have no saved properties.</p>
        ) : (
          <div>
            {savedProperties.map(property => (
              <div key={property.id}>
                <img
                  src={property.propertyImage}
                  alt={property.propertyName}
                />
                <h3>{property.propertyName}</h3>
                <p>{property.propertyLocation}</p>
                <p>₦ {property.propertyPrice}</p>
                <p>{property.propertyBrief}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default SavedProperties;
