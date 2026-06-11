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
import NewsDetailPage from "../pages/news/NewsDetail";
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

const publicOnly = (element) => <PublicAuth>{element}</PublicAuth>;

const privateRole = (allowedRoles, element) => (
  <PrivateAuth>
    <AllowRole allowedRoles={allowedRoles}>{element}</AllowRole>
  </PrivateAuth>
);

const adminOnly = (element) => privateRole(["pengurus"], element);
const memberOnly = (element) => privateRole(["member"], element);
const redirectTo = (to) => <Navigate replace to={to} />;

const publicRoutes = [
  {
    path: "/choose-plan",
    element: publicOnly(<ChoosePlanPage />),
  },
  {
    path: "/sign-in",
    element: publicOnly(<SigninPage />),
  },
  {
    path: "/sign-up",
    element: publicOnly(<SignupPage />),
  },
  {
    path: "/forgot-password",
    element: publicOnly(<ForgotPasswordPage />),
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
    path: "/news/:id",
    element: <NewsDetailPage />,
  },
  {
    path: "/membership",
    element: <MembershipPage />,
  },
];

const adminRoutes = [
  {
    path: "/admin",
    element: adminOnly(<AdminPage />),
  },
  {
    path: "/admin/news-update",
    element: adminOnly(<NewsUpdatePage />),
  },
  {
    path: "/admin/payments",
    element: adminOnly(<PaymentsPage />),
  },
  {
    path: "/admin/payments/history",
    element: adminOnly(<PaymentHistoryPage />),
  },
  {
    path: "/admin/active-member",
    element: adminOnly(<ActiveMemberPage />),
  },
  {
    path: "/admin/trainer",
    element: adminOnly(<TrainerPage />),
  },
  {
    path: "/admin/catalogs",
    element: redirectTo("/admin/catalogs/membership"),
  },
  {
    path: "/admin/catalogs/membership",
    element: adminOnly(<MembershipCatalogPage />),
  },
  {
    path: "/admin/catalogs/trainer",
    element: adminOnly(<TrainerCatalogPage />),
  },
];

const memberRoutes = [
  {
    path: "/member",
    element: memberOnly(<MemberDashboard />),
  },
  {
    path: "/member/check-in",
    element: memberOnly(<CheckInOutPage />),
  },
  {
    path: "/member/trainer-booking",
    element: memberOnly(<TrainerBookingPage />),
  },
  {
    path: "/member/workout-tracking",
    element: memberOnly(<WorkoutTrackingPage />),
  },
  {
    path: "/member/trainer-checkout",
    element: memberOnly(<TrainerCheckoutPage />),
  },
  {
    path: "/member/trainer-packages",
    element: redirectTo("/member/trainer-booking"),
  },
  {
    path: "/member/trainer-packages/:packageId",
    element: redirectTo("/member/trainer-booking"),
  },
  {
    path: "/member/profile",
    element: memberOnly(<ProfilePage />),
  },
  {
    path: "/member/profile/membership",
    element: memberOnly(<ProfileMembershipPlanPage />),
  },
];

export const router = createBrowserRouter([
  ...publicRoutes,
  ...adminRoutes,
  ...memberRoutes,
  {
    path: "/unauthorized",
    element: <UnauthorizedPage />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
