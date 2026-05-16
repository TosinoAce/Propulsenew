import { useState } from "react";
import supabase from "../lib/supabase";
import { Link, useNavigate } from "react-router-dom";
import ButtonLight from "./ButtonLight";
import Button from "./button";
import "./LoginForm.css";
import { Eye, EyeOff } from 'lucide-react'

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState({});
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setError(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setError({});

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (authError) {
        setError({ global: authError.message });
        return;
      }

      console.log("Logged in user:", data.user);
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error)
      setError("Something went wrong");
    } finally {
      setIsLoading(false)
    }

    // if (!email || !password) {
    //   setError("All fields are required.");
    //   return;
    // }

    // const success = await login(email, password);

    // if (success) {
    //   navigate("/"); // Redirect to home page
    // } else {
    //   setError("Invalid email or password.");
    // }
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
          {error.global && <p className="error" style={{ textAlign: "center", marginBottom: "10px" }}>{error.global}</p>}
          <div>
            <input
              type="text"
              name="email"
              placeholder="email@domain.com"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className=""
            />
            {error.password && <p className="error">{error.password}</p>}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 transform -translate-y-1/2 right-3 text-gray-400 text-[12px] font-semibold cursor-pointer hover:text-black"
            >
              {showPassword ? (
                <EyeOff className="size-5 text-white" />
              ) : (
                <Eye className="size-5 text-white" />
              )}
            </button>
          </div>
          <Button
            disabled={isLoading || !formData.email || !formData.password}
            type="submit"
            name={isLoading ? "Signing in..." : "Sign In"}
            action={handleLogin}
          />
        </form>
        <p>© Propulse, Inc. 2025 Get Comfort With Reliability</p>
      </div>
    </div>
  );
};

export default LoginForm;
