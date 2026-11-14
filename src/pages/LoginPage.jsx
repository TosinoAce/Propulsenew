import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import supabase from "../lib/supabase";
import AuthShell, { PasswordInput } from "../components/AuthShell";
import Button from "../components/button";
import Field from "../components/Field";
import { getRedirectTarget } from "../lib/redirect";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState({});
  const navigate = useNavigate();
  const { search } = useLocation();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (error[name] || error.global) {
      setError((prev) => ({ ...prev, [name]: "", global: "" }));
    }
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
    }

    setError(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (isLoading || !validateForm()) return;

    setIsLoading(true);
    setError({});

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (authError) {
        setError({ global: authError.message });
        return;
      }

      navigate(getRedirectTarget(search), { replace: true });
    } catch (err) {
      console.error("Login failed:", err);
      setError({ global: "Something went wrong. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      text="Sign in to pick up your property search."
      footer={
        <>
          New to Propulse?{" "}
          <Link to={`/signup${search}`} className="font-medium text-accent-deep underline underline-offset-2">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleLogin} noValidate className="flex flex-col gap-4">
        {error.global && (
          <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
            {error.global}
          </p>
        )}

        <Field label="Email" error={error.email}>
          {(props) => (
            <input
              {...props}
              type="email"
              name="email"
              placeholder="email@domain.com"
              autoComplete="email"
              value={formData.email}
              onChange={handleInputChange}
            />
          )}
        </Field>

        <Field label="Password" error={error.password}>
          {(props) => (
            <PasswordInput
              {...props}
              name="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleInputChange}
            />
          )}
        </Field>

        <Button type="submit" size="lg" className="mt-2 w-full" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </AuthShell>
  );
};

export default LoginPage;
