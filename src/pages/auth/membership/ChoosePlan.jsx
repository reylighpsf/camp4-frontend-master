import { Link } from "react-router";
import { AuthFrame, MembershipPlanCards } from "../AuthFrame";

export default function ChoosePlan() {
  return (
    <AuthFrame currentStep={1} aside={null} contentClassName="auth-plan-page">
      <h1>Choose Your Member Plan</h1>
      <p className="auth-subtitle">
        Pick the membership that fits your training rhythm before creating your
        account.
      </p>

      <MembershipPlanCards />

      <p className="auth-footer">
        Already have an account? <Link to="/sign-in">Sign In</Link>
      </p>
    </AuthFrame>
  );
}
