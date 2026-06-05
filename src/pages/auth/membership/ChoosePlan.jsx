import { useEffect, useState } from "react";
import { Link } from "react-router";
import api from "../../../components/auth/authApi";
import { AuthFrame, MembershipPlanCards } from "../AuthFrame";
import { authMembershipPlans, mapCatalogsToMembershipPlans } from "./hooks/authPlans";

export default function ChoosePlan() {
  const [plans, setPlans] = useState(authMembershipPlans);

  useEffect(() => {
    let isMounted = true;

    const fetchCatalogPlans = async () => {
      try {
        const response = await api.get("/catalogs");
        if (isMounted) setPlans(mapCatalogsToMembershipPlans(response.data?.data || []));
      } catch {
        if (isMounted) setPlans(authMembershipPlans);
      }
    };

    fetchCatalogPlans();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AuthFrame currentStep={1} aside={null} contentClassName="auth-plan-page">
      <h1>Choose Your Member Plan</h1>
      <p className="auth-subtitle">
        Pick the membership that fits your training rhythm before creating your
        account.
      </p>

      <MembershipPlanCards plans={plans} />

      <p className="auth-footer">
        Already have an account? <Link to="/sign-in">Sign In</Link>
      </p>
    </AuthFrame>
  );
}
