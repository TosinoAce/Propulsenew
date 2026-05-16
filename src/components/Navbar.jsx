import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "./button";
import { useAuth } from "../auth/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, handleLogout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const logout = () => {
    handleLogout();
    setDropdownOpen(false);
  };

  if (!user) return null;

  return (
    <header>
      <div className="Logo">
        <img src="/propulseLogo.png" alt="Propulse logo" />

        {/* Mobile Menu Toggle */}
        <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          ☰
        </button>

        <ul className={mobileMenuOpen ? "nav-links mobile-open" : "nav-links"}>
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>
            <button>Home</button>
          </Link>
          <Link to="/property" onClick={() => setMobileMenuOpen(false)}>
            <button>Properties</button>
          </Link>
          <Link to="/landbanking" onClick={() => setMobileMenuOpen(false)}>
            <button>Land Banking</button>
          </Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)}>
            <button>About Us</button>
          </Link>

          {/* Mobile Auth Section */}
          <div className="mobile-auth">
            {user ? (
              <>
                <h3 className="mobile-user-name">{user.user_metadata.fullName}</h3>
                <Link to="/savedproperties" onClick={() => setMobileMenuOpen(false)}>
                  <button>Saved Properties</button>
                </Link>
                <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>
                  <button>Get in Touch</button>
                </Link>
                <button onClick={() => { logout(); setMobileMenuOpen(false); }}>Logout</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button name="GET STARTED" />
              </Link>
            )}
          </div>
        </ul>
      </div>

      <div className="desktop-auth">
        {user ? (
          <div className="profile-menu" onClick={toggleDropdown}>
            <h3>{user.user_metadata.fullName}</h3>
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
                <button onClick={logout}>Logout</button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login">
            <Button name="GET STARTED" />
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;
