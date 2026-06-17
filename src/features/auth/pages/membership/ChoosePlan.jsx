import { useEffect, useState } from "react";
import { Link } from "react-router";
import api from "../../../../services/authApi";
import { useAuth } from "../../../../hooks/useAuth";
import { AuthFrame, MembershipPlanCards } from "../AuthFrame";
import { authMembershipPlans, getUserTierCode, mapCatalogsToMembershipPlans } from "./hooks/authPlans";

export default function ChoosePlan() {
  const { user } = useAuth();
  const [plans, setPlans] = useState(authMembershipPlans);

  useEffect(() => {
    let isMounted = true;

    const fetchCatalogPlans = async () => {
      try {
        const response = await api.get("/catalogs/membership");
        if (isMounted) setPlans(mapCatalogsToMembershipPlans(response.data?.data || [], getUserTierCode(user)));
      } catch {
        if (isMounted) setPlans(authMembershipPlans);
      }
    };

    fetchCatalogPlans();
    return () => {
      isMounted = false;
    };
  }, [user]);

  return (
    <AuthFrame currentStep={3} aside={null} contentClassName="auth-plan-page">
      <h1>Choose Your Member Plan</h1>
      <p className="auth-subtitle">
        Email kamu sudah diverifikasi. Pilih membership yang sesuai, lalu lanjutkan ke pembayaran.
      </p>

      <MembershipPlanCards plans={plans} />

      <p className="auth-footer">
        Already have an account? <Link to="/sign-in">Sign In</Link>
      </p>
    </AuthFrame>
  );
}
