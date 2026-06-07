import { Navigate, createBrowserRouter } from "react-router";

import PrivateAuth from "../components/auth/PrivateAuth";
import PublicAuth from "../components/auth/PublicAuth";
import AllowRole from "../components/auth/AllowRole";
import LandingPage from "../pages/landing";
import MembershipPage from "../components/landing/membership/Membership";
import ChoosePlanPage from "../pages/auth/membership/ChoosePlan";
import SigninPage from "../pages/auth/sign/Signin";
import SignupPage from "../pages/auth/sign/Signup";
import ForgotPasswordPage from "../pages/auth/forgot/ForgotPassword";
import VerifyEmailPage from "../pages/auth/verify/VerifyEmail";
import VerifyEmailResultPage from "../pages/auth/verify/VerifyEmailResult";
import PaymentPage from "../pages/auth/pay/Payment";
import PaymentSuccessPage from "../pages/auth/pay/PaymentSuccess";
import AdminPage from "../pages/admin/Dashboard";
import ActiveMemberPage from "../pages/admin/components/active-member/ActiveMember";
import {
  MembershipCatalogPage,
  TrainerCatalogPage,
} from "../pages/admin/components/catalog/CatalogManagement";
import NewsUpdatePage from "../pages/admin/components/news-update/NewsUpdate";
import PaymentHistoryPage from "../pages/admin/components/payments/PaymentHistory";
import PaymentsPage from "../pages/admin/components/payments/Payments";
import TrainerPage from "../pages/admin/components/trainer/Trainer";
import MemberDashboard from "../pages/member/Dashboard";
import CheckInOutPage from "../pages/member/components/check-in-out/CheckInOut";
import ProfilePage from "../pages/member/components/profile/Profile";
import ProfileMembershipPlanPage from "../pages/member/components/profile/MembershipPlan";
import TrainerBookingPage from "../pages/member/components/trainer-booking/TrainerBooking";
import TrainerCheckoutPage from "../pages/member/components/trainer-packages/TrainerCheckout";
import WorkoutTrackingPage from "../pages/member/components/workout-tracking/WorkoutTracking";
import UnauthorizedPage from "../pages/Unauthorized";
import NotFound from "../pages/NotFound";

export const router = createBrowserRouter([
  // PUBLIC
  {
    path: "/choose-plan",
    element: (
      <PublicAuth>
        <ChoosePlanPage />
      </PublicAuth>
    ),
  },
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
    path: "/forgot-password",
    element: (
      <PublicAuth>
        <ForgotPasswordPage />
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
    path: "/payment",
    element: <PaymentPage />,
  },
  {
    path: "/payment/success",
    element: <PaymentSuccessPage />,
  },
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/explore",
    element: <LandingPage scrollToExplore />,
  },
  {
    path: "/membership",
    element: <MembershipPage />,
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
    path: "/admin/news-update",
    element: (
      <PrivateAuth>
        <AllowRole allowedRoles={["pengurus"]}>
          <NewsUpdatePage />
        </AllowRole>
      </PrivateAuth>
    ),
  },
  {
    path: "/admin/payments",
    element: (
      <PrivateAuth>
        <AllowRole allowedRoles={["pengurus"]}>
          <PaymentsPage />
        </AllowRole>
      </PrivateAuth>
    ),
  },
  {
    path: "/admin/payments/history",
    element: (
      <PrivateAuth>
        <AllowRole allowedRoles={["pengurus"]}>
          <PaymentHistoryPage />
        </AllowRole>
      </PrivateAuth>
    ),
  },
  {
    path: "/admin/active-member",
    element: (
      <PrivateAuth>
        <AllowRole allowedRoles={["pengurus"]}>
          <ActiveMemberPage />
        </AllowRole>
      </PrivateAuth>
    ),
  },
  {
    path: "/admin/trainer",
    element: (
      <PrivateAuth>
        <AllowRole allowedRoles={["pengurus"]}>
          <TrainerPage />
        </AllowRole>
      </PrivateAuth>
    ),
  },
  {
    path: "/admin/catalogs",
    element: <Navigate replace to="/admin/catalogs/membership" />,
  },
  {
    path: "/admin/catalogs/membership",
    element: (
      <PrivateAuth>
        <AllowRole allowedRoles={["pengurus"]}>
          <MembershipCatalogPage />
        </AllowRole>
      </PrivateAuth>
    ),
  },
  {
    path: "/admin/catalogs/trainer",
    element: (
      <PrivateAuth>
        <AllowRole allowedRoles={["pengurus"]}>
          <TrainerCatalogPage />
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
    path: "/member/check-in",
    element: (
      <PrivateAuth>
        <AllowRole allowedRoles={["member"]}>
          <CheckInOutPage />
        </AllowRole>
      </PrivateAuth>
    ),
  },
  {
    path: "/member/trainer-booking",
    element: (
      <PrivateAuth>
        <AllowRole allowedRoles={["member"]}>
          <TrainerBookingPage />
        </AllowRole>
      </PrivateAuth>
    ),
  },
  {
    path: "/member/workout-tracking",
    element: (
      <PrivateAuth>
        <AllowRole allowedRoles={["member"]}>
          <WorkoutTrackingPage />
        </AllowRole>
      </PrivateAuth>
    ),
  },
  {
    path: "/member/trainer-checkout",
    element: (
      <PrivateAuth>
        <AllowRole allowedRoles={["member"]}>
          <TrainerCheckoutPage />
        </AllowRole>
      </PrivateAuth>
    ),
  },
  {
    path: "/member/trainer-packages",
    element: <Navigate replace to="/member/trainer-booking" />,
  },
  {
    path: "/member/trainer-packages/:packageId",
    element: <Navigate replace to="/member/trainer-booking" />,
  },
  {
    path: "/member/profile",
    element: (
      <PrivateAuth>
        <AllowRole allowedRoles={["member"]}>
          <ProfilePage />
        </AllowRole>
      </PrivateAuth>
    ),
  },
  {
    path: "/member/profile/membership",
    element: (
      <PrivateAuth>
        <AllowRole allowedRoles={["member"]}>
          <ProfileMembershipPlanPage />
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
