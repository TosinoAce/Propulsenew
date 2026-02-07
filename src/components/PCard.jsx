import { useNavigate } from "react-router-dom";
import Button from "./button";
import "./PCard.css";

const PCard = ({ id, image, name, location, price, details }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/property/${id}`);
  };

  return (
    <div className="PCard">
      <div className="Pcard-Img">
        <img src={image} alt={name} />
      </div>
      <p className="p-Details">{details}</p>
      <h3 className="p-Name">{name}</h3>
      <p className="p-Location">{location}</p>
      <div className="P-Button">
        <p className="p-Price">₦ {price}</p>
        <Button name="View Details" action={handleViewDetails} />
      </div>
    </div>
  );
};

export default PCard;
