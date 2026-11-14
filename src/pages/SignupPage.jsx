import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MailCheck } from "lucide-react";
import supabase from "../lib/supabase";
import AuthShell, { PasswordInput } from "../components/AuthShell";
import Button from "../components/button";
import Field from "../components/Field";
import { getRedirectTarget } from "../lib/redirect";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const navigate = useNavigate();
  const { search } = useLocation();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear the error once the user starts correcting the field
    if (errors[name] || errors.global) {
      setErrors((prev) => ({ ...prev, [name]: "", global: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

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
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (isLoading || !validateForm()) return;

    setIsLoading(true);

    try {
      const fullName = formData.fullName.trim();
      const email = formData.email.trim();
      // Usernames are not asked for on the form, so derive one from the email
      const username = email.split("@")[0];

      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password: formData.password,
        options: {
          data: { fullName, username },
        },
      });

      if (signupError) {
        setErrors({ email: signupError.message });
        return;
      }

      const authUser = data.user;

      // Supabase returns a user with no identities when the email is already registered
      if (authUser && authUser.identities?.length === 0) {
        setErrors({ email: "This email is already registered. Please sign in instead." });
        return;
      }

      // No session means the project requires email confirmation before login
      if (!data.session) {
        setNeedsConfirmation(true);
        return;
      }

      const { error: profileError } = await supabase.from("user_profile").insert({
        auth_user: authUser.id,
        email: authUser.email,
        username,
        fullname: fullName,
      });

      // The account itself exists at this point, so do not block the user on a profile hiccup
      if (profileError) {
        console.error("Profile creation failed:", profileError);
      }

      navigate(getRedirectTarget(search), { replace: true });
    } catch (error) {
      console.error("signup failed", error);
      setErrors({ global: "Something went wrong. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  if (needsConfirmation) {
    return (
      <AuthShell title="Check your email">
        <div className="flex flex-col items-start gap-5">
          <MailCheck className="size-12 text-accent-deep" strokeWidth={1.5} aria-hidden="true" />
          <p className="text-lg leading-relaxed text-muted">
            We sent a confirmation link to <span className="font-medium text-ink">{formData.email.trim()}</span>.
            Open it to activate your account, then sign in.
          </p>
          <Button to="/login" size="lg">Go to sign in</Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      text="Save listings and reach realtors in a tap."
      footer={
        <>
          Already have an account?{" "}
          <Link to={`/login${search}`} className="font-medium text-accent-deep underline underline-offset-2">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSignup} noValidate className="flex flex-col gap-4">
        {errors.global && (
          <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
            {errors.global}
          </p>
        )}

        <Field label="Full name" error={errors.fullName}>
          {(props) => (
            <input
              {...props}
              name="fullName"
              autoComplete="name"
              value={formData.fullName}
              onChange={handleInputChange}
            />
          )}
        </Field>

        <Field label="Email" error={errors.email}>
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

        <Field label="Password" error={errors.password} hint="At least 6 characters.">
          {(props) => (
            <PasswordInput
              {...props}
              name="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleInputChange}
            />
          )}
        </Field>

        <Field label="Confirm password" error={errors.confirmPassword}>
          {(props) => (
            <PasswordInput
              {...props}
              name="confirmPassword"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
            />
          )}
        </Field>

        <Button type="submit" size="lg" className="mt-2 w-full" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Get started"}
        </Button>
      </form>
    </AuthShell>
  );
};

export default SignupPage;
