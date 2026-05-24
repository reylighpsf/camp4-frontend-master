import { createBrowserRouter } from "react-router";

import PrivateAuth from "../components/auth/PrivateAuth";
import PublicAuth from "../components/auth/PublicAuth";
import AllowRole from "../components/auth/AllowRole";
import LandingPage from "../pages/landing";
import SigninPage from "../pages/auth/Signin";
import SignupPage from "../pages/auth/Signup";
import VerifyEmailPage from "../pages/auth/VerifyEmail";
import VerifyEmailResultPage from "../pages/auth/VerifyEmailResult";
import AdminPage from "../pages/admin/Admin";
import MemberDashboard from "../pages/member/Dashboard";
import UnauthorizedPage from "../pages/Unauthorized";
import NotFound from "../pages/NotFound";

export const router = createBrowserRouter([
  // PUBLIC
  {
    path: "/sign-in",
    element: (
      <PublicAuth>
        <SigninPage />
      </PublicAuth>
    ),
  },
  {
    path: "/sign-up",
    element: (
      <PublicAuth>
        <SignupPage />
      </PublicAuth>
    ),
  },
  {
    path: "/verify-email",
    element: <VerifyEmailPage />,
  },
  {
    path: "/verify-email/result",
    element: <VerifyEmailResultPage />,
  },
  {
    path: "/verify-email/:token",
    element: <VerifyEmailResultPage />,
  },
  {
    path: "/",
    element: <LandingPage />,
  },

  // ROLE BASED
  {
    path: "/admin",
    element: (
      <PrivateAuth>
        <AllowRole allowedRoles={["pengurus"]}>
          <AdminPage />
        </AllowRole>
      </PrivateAuth>
    ),
  },
  {
    path: "/member",
    element: (
      <PrivateAuth>
        <AllowRole allowedRoles={["member"]}>
          <MemberDashboard />
        </AllowRole>
      </PrivateAuth>
    ),
  },

  {
    path: "/unauthorized",
    element: <UnauthorizedPage />,
  },

  {
    path: "*",
    element: <NotFound />,
  },
]);
