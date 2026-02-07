import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import About from "./pages/About";
import ContactPage from "./pages/ContactPage";
import PropertyPage from "./pages/PropertyPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import SavedProperties from "./pages/SavedProperties.jsx";
import ProductDetails from "./components/ProductDetails";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext.jsx"; // ✅ Import the Auth context
import LandBanking from "./pages/LandBanking.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "about",
    element: <About />,
  },
  {
    path: "contact",
    element: <ContactPage />,
  },
  {
    path: "property",
    element: <PropertyPage />,
  },
  {
    path: "property/:id",
    element: <ProductDetails />,
  },
  {
    path: "login",
    element: <LoginPage />,
  },
  {
    path: "signup",
    element: <SignupPage />,
  },
  {
    path: "savedproperties",
    element: <SavedProperties />,
  },
  {
    path: "landbanking",
    element: <LandBanking />,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider> {/* ✅ Wrap the entire app in AuthProvider */}
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);
