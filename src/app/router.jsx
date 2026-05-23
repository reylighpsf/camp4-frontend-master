import { createBrowserRouter } from "react-router";

import PrivateAuth from "../components/features/auth/PrivateAuth";
import PublicAuth from "../components/features/auth/PublicAuth";
import AllowRole from "../components/features/auth/AllowRole";
import TodosPage from "../pages/todos";
import SigninPage from "../pages/auth/Signin";
import SignupPage from "../pages/auth/Signup";
import VerifyEmailPage from "../pages/auth/VerifyEmail";
import VerifyEmailResultPage from "../pages/auth/VerifyEmailResult";
import AdminPage from "../pages/admin/Admin";
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

  // PRIVATE
  {
    path: "/",
    element: (
      <PrivateAuth>
        <TodosPage />
      </PrivateAuth>
    ),
  },

  // ROLE BASED
  {
    path: "/admin",
    element: (
      <PrivateAuth>
        <AllowRole allowedRoles={["admin"]}>
          <AdminPage />
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
