import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { MotionConfig } from "motion/react";
import Root from "./layout/Root";
import ErrorPage from "./pages/ErrorPage";
import App from "./App";
import { fetchListing } from "./lib/listing";
import "./index.css";

// The home page loads with the app. Every other page, and the whole admin area, is
// downloaded only when someone opens it, which keeps the first visit small on mobile data.
const About = lazy(() => import("./pages/About"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const PropertyPage = lazy(() => import("./pages/PropertyPage"));
const PropertyDetails = lazy(() => import("./pages/PropertyDetails"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const SavedProperties = lazy(() => import("./pages/SavedProperties"));
const LandBanking = lazy(() => import("./pages/LandBanking"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PartnerPage = lazy(() => import("./pages/PartnerPage"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Careers = lazy(() => import("./pages/Careers"));
const JobPage = lazy(() => import("./pages/JobPage"));
const AdminLayout = lazy(() => import("./admin/AdminLayout"));
const AdminOverview = lazy(() => import("./admin/AdminOverview"));
const AdminPartners = lazy(() => import("./admin/AdminPartners"));
const AdminProperties = lazy(() => import("./admin/AdminProperties"));
const AdminInquiries = lazy(() => import("./admin/AdminInquiries"));
const AdminBlog = lazy(() => import("./admin/AdminBlog"));
const AdminCareers = lazy(() => import("./admin/AdminCareers"));

// Admin screens share the admin frame; this keeps the frame on screen while a screen loads
const adminScreen = (Screen) => (
  <Suspense fallback={<div className="skeleton h-96 !rounded-3xl" aria-label="Loading" />}>
    <Screen />
  </Suspense>
);

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
      { path: "property/in/:state", element: <PropertyPage /> },
      {
        path: "property/:id",
        element: <PropertyDetails />,
        // Start loading the listing at the same time as the page code, without waiting for it
        loader: ({ params }) => {
          fetchListing(params.id);
          return null;
        },
      },
      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <SignupPage /> },
      { path: "savedproperties", element: <SavedProperties /> },
      { path: "landbanking", element: <LandBanking /> },
      { path: "partners/:slug", element: <PartnerPage /> },
      { path: "blog", element: <Blog /> },
      { path: "blog/:slug", element: <BlogPost /> },
      { path: "careers", element: <Careers /> },
      { path: "careers/:slug", element: <JobPage /> },
      {
        path: "admin",
        element: <AdminLayout />,
        children: [
          { path: "", element: adminScreen(AdminOverview) },
          { path: "partners", element: adminScreen(AdminPartners) },
          { path: "properties", element: adminScreen(AdminProperties) },
          { path: "inquiries", element: adminScreen(AdminInquiries) },
          { path: "blog", element: adminScreen(AdminBlog) },
          { path: "careers", element: adminScreen(AdminCareers) },
        ],
      },
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
