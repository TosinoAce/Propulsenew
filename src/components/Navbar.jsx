import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "./button";
import { useAuth } from "../auth/AuthContext"; // ✅ Import useAuth hook
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth(); // ✅ Get user and logout from context
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleLogout = () => {
    logout(); // ✅ Call logout from context
    setDropdownOpen(false);
  };

  return (
    <header>
      <div className="Logo">
        <img src="/propulseLogo.png" alt="Propulse logo" />
        <ul>
          <Link to="/">
            <button>Home</button>
          </Link>
          <Link to="/property">
            <button>Properties</button>
          </Link>
          <Link to="/landbanking">
            <button>Land Banking</button>
          </Link>
          <Link to="/about">
            <button>About Us</button>
          </Link>
        </ul>
      </div>

      {user ? (
        <div className="profile-menu" onClick={toggleDropdown}>
          <h3>{user.fullName}</h3> {/* Display the logged-in user's name */}
          <img
            src="/placeholder.png"
            alt="User Avatar"
            className="avatar"
          />

          {dropdownOpen && (
            <div className="dropdown">
              <Link to="/savedproperties">
                <button className="dropdown-nav">Saved Properties</button>
              </Link>
              <Link to="/contact">
                <button className="dropdown-nav">Get in Touch</button>
              </Link>
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      ) : (
        <Link to="/login">
          <Button name="GET STARTED" />
        </Link>
      )}
    </header>
  );
};

export default Navbar;
