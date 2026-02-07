import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ButtonLight from "./ButtonLight";
import Button from "./button";
import "./LoginForm.css";

const SignupForm = () => {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorEmail, setErrorEmail] = useState("");
  const [errorPassword, setErrorPassword] = useState("");
  const [errorConfirmPassword, setErrorConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const validateAndRegister = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    let valid = true;

    // Email validation
    if (!email.includes("@gmail")) {
      setErrorEmail("Email should have @gmail");
      valid = false;
    } else {
      setErrorEmail("");
    }

    // Password validation
    if (password.length < 8) {
      setErrorPassword("Password should be at least 8 characters");
      valid = false;
    } else {
      setErrorPassword("");
    }

    // Confirm password validation
    if (password !== confirmPassword) {
      setErrorConfirmPassword("Passwords didn't match.");
      valid = false;
    } else {
      setErrorConfirmPassword("");
    }

    if (!valid) return;

    try {
      // Check if email already exists
      const response = await fetch(`http://localhost:5000/users?email=${email}`);
      const existingUsers = await response.json();

      if (existingUsers.length > 0) {
        setErrorMessage("Email is already registered.");
        return;
      }

      // Register the new user
      const newUser = { email, fullName, password };
      await fetch("http://localhost:5000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      // Redirect to login after successful signup
      navigate("/login");
    } catch (error) {
      console.error("Error registering user:", error);
      setErrorMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="LoginContainer">
      <div className="First">
        <h2>Already Have An Account?</h2>
        <p>Let’s Continue Exploring Properties</p>
        <Link to="/login">
          <ButtonLight name="Sign In" />
        </Link>
      </div>
      <div className="Second">
        <Link to="/">
          <img src="/smallLogo.png" alt="Propulse Logo" className="B-Logo" />
        </Link>
        <h2>Let’s Get Started</h2>
        <div className="G-signIn">
          <img src="/Google.png" alt="Google Logo" />
          Sign up with Google
        </div>
        <p>Or</p>
        {errorMessage && <p className="error">{errorMessage}</p>}
        <form onSubmit={validateAndRegister}>
          <input
            type="text"
            placeholder="email@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <p className="error">{errorEmail}</p>

          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="error">{errorPassword}</p>

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <p className="error">{errorConfirmPassword}</p>

          <Button name="Register" action={validateAndRegister} />
        </form>
        <p>© Propulse, Inc. 2025 Get Comfort With Reliability</p>
      </div>
    </div>
  );
};

export default SignupForm;
