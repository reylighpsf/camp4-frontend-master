import { Navigate, createBrowserRouter } from "react-router";

import PrivateAuth from "@/features/auth/components/PrivateAuth";
import PublicAuth from "@/features/auth/components/PublicAuth";
import AllowRole from "@/features/auth/components/AllowRole";
import LandingPage from "../pages/landing";
import MembershipPage from "@/features/landing/membership/Membership";
import ChoosePlanPage from "@/features/auth/pages/membership/ChoosePlan";
import SigninPage from "@/features/auth/pages/sign/Signin";
import SignupPage from "@/features/auth/pages/sign/Signup";
import ForgotPasswordPage from "@/features/auth/pages/forgot/ForgotPassword";
import VerifyEmailPage from "@/features/auth/pages/verify/VerifyEmail";
import VerifyEmailResultPage from "@/features/auth/pages/verify/VerifyEmailResult";
import PaymentPage from "@/features/auth/pages/pay/Payment";
import PaymentSuccessPage from "@/features/auth/pages/pay/PaymentSuccess";
import NewsDetailPage from "@/features/landing/explore/NewsDetailPage";
import AdminPage from "@/features/admin/pages/Dashboard";
import ActivityManagement from "@/features/admin/pages/components/activities/ActivityManagement";
import ActiveMemberPage from "@/features/admin/pages/components/active-member/ActiveMember";
import {
  MembershipCatalogPage,
  TrainerCatalogPage,
} from "@/features/admin/pages/components/catalog/CatalogManagement";
import NewsUpdatePage from "@/features/admin/pages/components/news-update/NewsUpdate";
import PaymentHistoryPage from "@/features/admin/pages/components/payments/PaymentHistory";
import PaymentsPage from "@/features/admin/pages/components/payments/Payments";
import BroadcastNotificationPage from "@/features/admin/pages/components/notifications/BroadcastNotification";
import TrainerPage from "@/features/admin/pages/components/trainer/Trainer";
import MemberDashboard from "@/features/member/pages/Dashboard";
import CheckInOutPage from "@/features/member/pages/components/check-in-out/CheckInOut";
import ProfilePage from "@/features/member/pages/components/profile/Profile";
import ProfileMembershipPlanPage from "@/features/member/pages/components/profile/MembershipPlan";
import MemberTransactionsPage from "@/features/member/pages/components/transactions/Transactions";
import TrainerBookingPage from "@/features/member/pages/components/trainer-booking/TrainerBooking";
import TrainerCheckoutPage from "@/features/member/pages/components/trainer-packages/TrainerCheckout";
import WorkoutTrackingPage from "@/features/member/pages/components/workout-tracking/WorkoutTracking";
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
    path: "/admin/notifications",
    element: adminOnly(<BroadcastNotificationPage />),
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
    path: "/admin/activities",
    element: adminOnly(<ActivityManagement />),
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
    path: "/member/transactions",
    element: memberOnly(<MemberTransactionsPage />),
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
