import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { MotionConfig } from "motion/react";
import Root from "./layout/Root";
import ErrorPage from "./pages/ErrorPage";
import App from "./App";
import About from "./pages/About";
import ContactPage from "./pages/ContactPage";
import PropertyPage from "./pages/PropertyPage";
import PropertyDetails from "./pages/PropertyDetails";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import SavedProperties from "./pages/SavedProperties.jsx";
import LandBanking from "./pages/LandBanking.jsx";
import NotFound from "./pages/NotFound";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    // Any page that crashes while rendering lands here instead of a blank screen
    errorElement: <ErrorPage />,
    children: [
      { path: "", element: <App /> },
      { path: "about", element: <About /> },
      { path: "contact", element: <ContactPage /> },
      { path: "property", element: <PropertyPage /> },
      { path: "property/:id", element: <PropertyDetails /> },
      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <SignupPage /> },
      { path: "savedproperties", element: <SavedProperties /> },
      { path: "landbanking", element: <LandBanking /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* Animations follow the visitor's reduced-motion setting everywhere */}
    <MotionConfig reducedMotion="user">
      <RouterProvider router={router} />
    </MotionConfig>
  </StrictMode>
);
