import { useState } from "react";
import supabase from "../lib/supabase";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import ButtonLight from "./ButtonLight";
import Button from "./button";
import "./LoginForm.css";
import { Eye, EyeOff } from "lucide-react";

const SignupForm = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, seterrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAuth();

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    //Clear error when user starts typing
    if (errors?.[name]) {
      seterrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    // if (!formData.username.trim()) {
    //   newErrors.username = "Username is required";
    // } else if (formData.username.length < 3) {
    //   newErrors.username = "Username must be at least 3 characters";
    // }

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

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords didn't match.";
    }

    seterrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            fullName: formData.fullName,
            username: formData.username
          }
        }
      })

      if (signupError) {
        console.error(signupError.message);
        seterrors({ email: signupError.message });
        return;
      }

      const authUser = data.user;


      // Upsert user profile in Supabase
      const { error: profileError } = await supabase
        .from("user_profile")
        .upsert({
          auth_user: authUser?.id,
          email: authUser?.email,
          username: formData.username,
          fullname: formData.fullName,
        });

      if (profileError) {
        throw profileError;
      }

      setUser(authUser);

      navigate("/");
    } catch (error) {
      console.error("signup failed", error)
    } finally {
      setIsLoading(false);
    }
  }

  // const validateAndRegister = async (e) => {
  //   e.preventDefault();
  //   setErrorMessage("");

  //   let valid = true;

  //   // Email validation
  //   if (!email.includes("@gmail")) {
  //     setErrorEmail("Email should have @gmail");
  //     valid = false;
  //   } else {
  //     setErrorEmail("");
  //   }

  //   // Password validation
  //   if (password.length < 8) {
  //     setErrorPassword("Password should be at least 8 characters");
  //     valid = false;
  //   } else {
  //     setErrorPassword("");
  //   }

  //   // Confirm password validation
  //   if (password !== confirmPassword) {
  //     setErrorConfirmPassword("Passwords didn't match.");
  //     valid = false;
  //   } else {
  //     setErrorConfirmPassword("");
  //   }

  //   if (!valid) return;

  //   try {
  //     // Check if email already exists
  //     const response = await fetch(`http://localhost:5000/users?email=${email}`);
  //     const existingUsers = await response.json();

  //     if (existingUsers.length > 0) {
  //       setErrorMessage("Email is already registered.");
  //       return;
  //     }

  //     // Register the new user
  //     const newUser = { email, fullName, password };
  //     await fetch("http://localhost:5000/users", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(newUser),
  //     });

  //     // Redirect to login after successful signup
  //     navigate("/login");
  //   } catch (error) {
  //     console.error("Error registering user:", error);
  //     setErrorMessage("An error occurred. Please try again.");
  //   }
  // };

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
        {/* {errors.message && <p className="error">{errors.message}</p>} */}
        <form onSubmit={handleSignup}>
          <div>
            <input
              type="text"
              name="email"
              placeholder="email@domain.com"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            {errors.email && (
              <p className="error">{errors.email}</p>
            )}
          </div>
          <div>
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleInputChange}
            />
            {errors.fullName && (
              <p className="error">{errors.fullName}</p>
            )}
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
            {errors.password && (
              <p className="error">{errors.password}</p>
            )}
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

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
            />
            {errors.confirmPassword && (
              <p className="error">{errors.confirmPassword}</p>
            )}
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
            type="submit"
            name={isLoading ? "Signing up..." : "Sign up"}
            disabled={isLoading || !formData.email || !formData.password}
          // action={handleSignup}
          />
        </form>
        <p>© Propulse, Inc. 2025 Get Comfort With Reliability</p>
      </div>
    </div>
  );
};

export default SignupForm;