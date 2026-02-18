import { useNavigate } from "react-router-dom";
import Button from "./button";
import "./PCard.css";

const PCard = ({ id, image, name, location, price, details, onRemove }) => {
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
        <div style={{ display: 'flex', gap: '5px' }}>
            <Button name="View Details" action={handleViewDetails} />
            {onRemove && (
                <button 
                    onClick={onRemove} 
                    style={{
                        backgroundColor: '#ff4d4d', 
                        color: 'white', 
                        border: 'none', 
                        padding: '10px 15px', 
                        borderRadius: '5px', 
                        cursor: 'pointer'
                    }}
                >
                    Remove
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default PCard;
