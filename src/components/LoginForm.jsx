import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext"; // Import AuthContext
import ButtonLight from "./ButtonLight";
import Button from "./button";
import "./LoginForm.css";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth(); // Get login function from AuthContext

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("All fields are required.");
      return;
    }

    const success = await login(email, password);

    if (success) {
      navigate("/"); // Redirect to home page
    } else {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="LoginContainer">
      <div className="First">
        <h2>Get Started Now</h2>
        <p>Let’s get started and begin your property search</p>
        <Link to="/signup">
          <ButtonLight name="Sign Up" />
        </Link>
      </div>
      <div className="Second">
        <Link to="/">
          <img src="/smallLogo.png" alt="Propulse Logo" className="B-Logo" />
        </Link>
        <h2>Welcome Back</h2>
        <div className="G-signIn">
          <img src="/Google.png" alt="Google Logo" />
          Sign in with Google
        </div>
        <p>Or</p>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="email@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="error">{error}</p>}
          <Button name="Sign In" action={handleLogin} />
        </form>
        <p>© Propulse, Inc. 2025 Get Comfort With Reliability</p>
      </div>
    </div>
  );
};

export default LoginForm;
