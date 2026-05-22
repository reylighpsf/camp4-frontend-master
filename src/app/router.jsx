import React from "react";
import { createBrowserRouter } from "react-router";

import PrivateAuth from "../features/auth/PrivateAuth";
import PublicAuth from "../features/auth/PublicAuth";
import AllowRole from "../features/auth/AllowRole";

const TodosPage = React.lazy(() => import("../pages/Todos"));
const SigninPage = React.lazy(() => import("../pages/auth/Signin"));
const SignupPage = React.lazy(() => import("../pages/auth/Signup"));
const AdminPage = React.lazy(() => import("../pages/Admin"));
const UnauthorizedPage = React.lazy(() => import("../pages/Unauthorized"));
const NotFound = React.lazy(() => import("../pages/NotFound"));

export const router = createBrowserRouter([
  // PUBLIC
  {
    path: "/signin",
    element: (
      <PublicAuth>
        <SigninPage />
      </PublicAuth>
    ),
  },
  {
    path: "/signup",
    element: (
      <PublicAuth>
        <SignupPage />
      </PublicAuth>
    ),
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
