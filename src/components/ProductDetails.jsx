import { useParams, Link } from "react-router-dom"
import { useEffect, useState } from "react"
import MainLayout from "../layout/MainLayout"
import Button from "./button"
import ButtonLight from "./ButtonLight"
import "./ProductDetails.css"

const ProductDetails = () => {
  const { id } = useParams()
  const userId = "3"

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

    fetch(`http://localhost:5000/properties/${Number(id)}`)
      .then(res => {
        if (!res.ok) {
          throw new Error("Property not found")
        }
        return res.json()
      })
      .then(data => {
        setProperty(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })

    fetch(
      `http://localhost:5000/savedProperties?userId=${userId}&propertyId=${Number(id)}`
    )
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
          setIsSaved(true)
          setSavedRecordId(data[0].id)
        }
      })
  }, [id])

  const handleSaveToggle = () => {
    if (isSaved) {
      fetch(`http://localhost:5000/savedProperties/${savedRecordId}`, {
        method: "DELETE",
      }).then(() => {
        setIsSaved(false)
        setSavedRecordId(null)
      })
    } else {
      fetch("http://localhost:5000/savedProperties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          propertyId: Number(id),
        }),
      })
        .then(res => res.json())
        .then(data => {
          setIsSaved(true)
          setSavedRecordId(data.id)
        })
    }
  }

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
