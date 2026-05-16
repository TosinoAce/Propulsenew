import { useState, useEffect } from "react";
import supabase from "../lib/supabase";
import PCard from "./PCard";
import "./PropertyContent.css";

const PropertyContent = ({ userId }) => {
  const [properties, setProperties] = useState([]);
  const [priceFilter, setPriceFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchProperties = async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*');
      
      if (error) {
        console.error("Error fetching properties:", error);
      } else {
        setProperties(data);
      }
    };

    fetchProperties();
  }, []);

  const filteredProperties = properties.filter((property) => {
    let isValid = true;

    if (priceFilter === "Below 1 Million" && property.propertyPriceTag >= 1000000) isValid = false;
    if (priceFilter === "Above 1 Million" && property.propertyPriceTag < 1000000) isValid = false;
    if (locationFilter && property.propertyLocationTag !== locationFilter) isValid = false;
    if (propertyTypeFilter && property.propertyTypeTag !== propertyTypeFilter) isValid = false;

    return isValid;
  });

  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage) || 1;

  const paginatedProperties = filteredProperties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) setCurrentPage(pageNumber);
  };

  return (
    <section className="property-body">
      <h2>Available Properties</h2>
      <h3>
        Over {properties.length} Properties available in <span>Kwara & Lagos State</span>
      </h3>

      <div className="filter">
        <select onChange={(e) => setPriceFilter(e.target.value)} value={priceFilter}>
          <option value="">Any Price</option>
          <option value="Below 1 Million">Below 1 Million</option>
          <option value="Above 1 Million">Above 1 Million</option>
        </select>
        <select onChange={(e) => setLocationFilter(e.target.value)} value={locationFilter}>
          <option value="">Any Location</option>
          <option value="Kwara State">Kwara State</option>
          <option value="Lagos State">Lagos State</option>
        </select>
        <select onChange={(e) => setPropertyTypeFilter(e.target.value)} value={propertyTypeFilter}>
          <option value="">Any Type</option>
          <option value="Land">Land Property</option>
          <option value="House">House Property</option>
        </select>
      </div>

      <div className="P-cardContainer">
        {paginatedProperties.length > 0 ? (
          paginatedProperties.map((property) => (
            <PCard
              key={property.id}
              id={property.id}
              image={property.propertyImage}
              details={property.propertyDetails}
              name={property.propertyName}
              location={property.propertyLocation}
              price={property.propertyPrice}
            />
          ))
        ) : (
          <p className="no-properties">No properties found.</p>
        )}
      </div>

      {filteredProperties.length > 0 && (
        <div className="pageNav">
          <div
            onClick={() => handlePageChange(currentPage - 1)}
            style={{ opacity: currentPage === 1 ? 0.5 : 1, pointerEvents: currentPage === 1 ? "none" : "auto" }}
          >
            <img src="ArrowLeft.png" alt="Previous Page" />
          </div>
          {Array.from({ length: totalPages }, (_, i) => (
            <div
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              className={currentPage === i + 1 ? "active" : ""}
            >
              {i + 1}
            </div>
          ))}
          <div
            onClick={() => handlePageChange(currentPage + 1)}
            style={{ opacity: currentPage === totalPages ? 0.5 : 1, pointerEvents: currentPage === totalPages ? "none" : "auto" }}
          >
            <img src="ArrowRight.png" alt="Next Page" />
          </div>
        </div>
      )}
    </section>
  );
};

export default PropertyContent;
