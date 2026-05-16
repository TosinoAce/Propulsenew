import { useParams, Link } from "react-router-dom"
import { useEffect, useState } from "react"
import supabase from "../lib/supabase"
import MainLayout from "../layout/MainLayout"
import Button from "./button"
import ButtonLight from "./ButtonLight"
import { useAuth } from "../auth/AuthContext"
import "./ProductDetails.css"

const ProductDetails = () => {
  const { id } = useParams()
  const { user } = useAuth()

  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const [isSaved, setIsSaved] = useState(false)
  const [savedRecordId, setSavedRecordId] = useState(null)

  useEffect(() => {
    if (!id) {
      setError("Invalid property id")
      setLoading(false)
      return
    }

    const fetchPropertyDetails = async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', Number(id))
        .single();

      if (error) {
        setError(error.message);
      } else {
        setProperty(data);
      }
      setLoading(false);
    };

    fetchPropertyDetails();

    const checkSavedProperty = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('savedProperties')
        .select('id')
        .eq('userId', user.id)
        .eq('propertyId', Number(id));
      
      if (data && data.length > 0) {
        setIsSaved(true);
        setSavedRecordId(data[0].id);
      }
    };

    checkSavedProperty();
  }, [id, user])

  const handleSaveToggle = async () => {
    if (!user) {
      alert("Please log in to save properties.");
      return;
    }

    if (isSaved) {
      const { error } = await supabase
        .from('savedProperties')
        .delete()
        .eq('id', savedRecordId);

      if (!error) {
        setIsSaved(false);
        setSavedRecordId(null);
      } else {
        console.error("Failed to unsave:", error);
      }
    } else {
      const { data, error } = await supabase
        .from('savedProperties')
        .insert([
          { userId: user.id, propertyId: Number(id) }
        ])
        .select();

      if (!error && data && data.length > 0) {
        setIsSaved(true);
        setSavedRecordId(data[0].id);
      } else {
        console.error("Save failed:", error);
      }
    }
  };

  if (loading) return <h2>Loading...</h2>
  if (error || !property) return <h2>{error}</h2>

  return (
    <MainLayout>
      <section className="propertyDetailsContainer">
        <div className="productHeading">
          <Link to="/property">
            <img src="/Vector11.png" alt="Go back" />
          </Link>
          <h2>{property.propertyName}</h2>
        </div>

        <div className="propertyDetails">
          <div className="propertyImages">
            {[1, 2, 3, 4, 5].map(num => (
              <div key={num} className={`div${num}`}>
                <img
                  src={property.propertyImage}
                  alt={property.propertyName}
                  className="p-image"
                />
              </div>
            ))}
          </div>

          <div className="PropertyInfo">
            <div id="PropertyInfo1">
              <p id="infoPrice">
                ₦ {property.propertyPrice} <span>per Plot</span>
              </p>
              <div>
                <ButtonLight
                  name={isSaved ? "Unsave Property" : "Save For Later"}
                  action={handleSaveToggle}
                />
                <Button
                  name="Contact Realtor"
                  action={() => setShowForm(true)}
                />
              </div>
            </div>

            <div id="PropertyInfo2">
              <p>
                <strong>Details:</strong> {property.propertyDetails}
              </p>
              <p>
                <strong>Location:</strong> {property.propertyLocation}
              </p>
              <p>
                <strong>Description:</strong> {property.fullDescription}
              </p>
              <p>
                <strong>Amenities:</strong> {property.amenities}
              </p>
              <h3>Realtor Information</h3>
              <p>
                <strong>Company Name:</strong> {property.realtorName}
              </p>
            </div>
          </div>
        </div>

        {showForm && (
          <div className="contactFormModal">
            <div className="contactFormContainer">
              <h2>Contact Realtor</h2>
              <form>
                <input type="text" value={property.realtorName} readOnly />
                <br />
                <input type="text" placeholder="Enter your name" required />
                <br />
                <input type="email" placeholder="Enter your email" required />
                <br />
                <input type="tel" placeholder="Enter your phone number" required />
                <br />
                <textarea
                  value={
                    "I am making enquiry on the " +
                    property.propertyName +
                    " located at " +
                    property.propertyLocation
                  }
                  readOnly
                ></textarea>
                <br />
                <div>
                  <button type="submit">Send Inquiry</button>
                  <button type="button" onClick={() => setShowForm(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>
    </MainLayout>
  )
}

export default ProductDetails
