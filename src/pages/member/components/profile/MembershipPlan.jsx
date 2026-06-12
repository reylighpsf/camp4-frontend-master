import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import MemberLayout from "../../../../components/member/MemberLayout";
import MemberIcon from "../../../../components/member/MemberIcon";
import api from "../../../../components/auth/hooks/authApi";
import { requestTurnstileToken } from "../../../../components/auth/hooks/turnstileToken";
import {
  authMembershipPlans,
  getCatalogPrice,
  getCatalogPriceItem,
  getAuthMembershipPlan,
  getPlanIdFromCatalogCode,
  getTransactionTypeFromPlanId,
  getUserTierCode,
} from "../../../auth/membership/hooks/authPlans";
import useTurnstile from "../../../auth/sign/hooks/useTurnstile";

const tabs = [
  { label: "Account Settings", icon: "profile", to: "/member/profile" },
  { label: "Membership Plan", icon: "check", active: true, to: "/member/profile/membership" },
  { label: "Security", icon: "check", to: "/member/profile?tab=security" },
  { label: "Notifications", icon: "bell" },
];

const membershipBenefits = [
  "Unlimited access to all gym facilities",
  "Personalized workout guidance from trainers",
  "Priority access to classes and special programs",
  "Monthly body composition and fitness tracking",
  "Secure locker access at every visit",
  "Exclusive discounts on merchandise and events",
  "Member-only rewards and wellness perks",
  "Seamless activity tracking through VocaFit",
];

const formatDate = (value) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("id-ID", {
    currency: "IDR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(Number(value || 0));

const openPaymentInNewTab = (paymentUrl) => {
  window.open(paymentUrl, "_blank", "noopener,noreferrer");
};

const openBlankPaymentTab = () => {
  const paymentTab = window.open("", "_blank");
  if (paymentTab) {
    paymentTab.opener = null;
    paymentTab.document.title = "Opening Midtrans...";
    paymentTab.document.body.innerHTML = "<p style=\"font-family:Arial,sans-serif;padding:24px;\">Opening Midtrans payment...</p>";
  }
  return paymentTab;
};

const getPaymentUrlFromResponse = (responseData) => {
  const data = responseData?.data || responseData || {};
  const transaction = data.transaction || data;
  return (
    data.paymentUrl ||
    data.payment_url ||
    data.redirect_url ||
    data.snap_redirect_url ||
    data.midtrans_redirect_url ||
    transaction?.paymentUrl ||
    transaction?.payment_url ||
    transaction?.redirect_url ||
    transaction?.snap_redirect_url ||
    transaction?.midtrans_redirect_url ||
    ""
  );
};

const formatTierName = (value) =>
  String(value || "-")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const getErrorMessage = (err, fallback) =>
  err.response?.data?.error || err.response?.data?.message || err.message || fallback;

const normalizePlanId = (planId) => {
  const id = String(planId || "").toLowerCase();
  if (id === "monthly" || id === "bulanan") return "premium";
  if (id === "harian") return "daily";
  return id;
};

const getStoredRegistrationPlanId = (profile) => {
  const email = profile?.email;
  if (email) {
    try {
      const savedPlan = JSON.parse(
        localStorage.getItem(`vocafit-registration-plan-${email}`) || "null",
      );
      if (savedPlan?.planId) return savedPlan.planId;
    } catch {
      return "";
    }
  }

  return localStorage.getItem("vocafit-selected-plan") || "";
};

const getProfilePlanId = (profile, registrationPlanId) =>
  normalizePlanId(
    profile?.membership_plan_id ||
      profile?.membership_plan ||
      profile?.membership_type ||
      profile?.membership?.plan_id ||
      profile?.membership?.plan ||
      profile?.membership?.type ||
      registrationPlanId ||
      "student",
  );

const getMembershipStatus = (profile) => {
  const status = String(profile?.membership_status || profile?.membership?.status || "").toLowerCase();
  if (status === "active" || status === "aktif" || profile?.active_membership) return "Active";
  if (profile?.membership_end_date || profile?.membership?.end_date) return "Pending";
  return "Selected";
};

const getActiveMembershipSnapshot = (profile, transactions, catalogPlans) => {
  const profileMembership = profile?.membership;
  const profileMembershipEnd = profile?.membership_end_date || profileMembership?.end_date;
  const profileMembershipStatus = String(profile?.membership_status || profileMembership?.status || "").toUpperCase();
  const hasActiveProfileMembership =
    profileMembershipEnd &&
    new Date(profileMembershipEnd).getTime() > Date.now() &&
    (!profileMembershipStatus || profileMembershipStatus === "ACTIVE");

  if (hasActiveProfileMembership) {
    const planCode = profile?.membership_plan_id || profileMembership?.plan_code || profileMembership?.plan;
    return {
      catalog: catalogPlans.find((item) => item.code === planCode),
      end: new Date(profileMembershipEnd),
      start: profile?.membership_start_date || profileMembership?.start_date
        ? new Date(profile?.membership_start_date || profileMembership?.start_date)
        : null,
      status: "Active",
      transaction: null,
    };
  }

  const membershipTransactions = transactions
    .filter((transaction) => {
      const family = String(transaction.transaction_family || "").toUpperCase();
      const type = String(transaction.transaction_type || "").toUpperCase();
      return transaction.status === "SUCCESS" && (family === "MEMBERSHIP" || type.startsWith("MEMBERSHIP_"));
    })
    .sort((a, b) => new Date(b.settled_at || b.created_at).getTime() - new Date(a.settled_at || a.created_at).getTime());

  for (const transaction of membershipTransactions) {
    const catalog = catalogPlans.find((item) => item.code === transaction.transaction_type);
    const start = new Date(transaction.settled_at || transaction.created_at);
    const durationDays =
      Number(catalog?.duration_days) ||
      (String(transaction.transaction_type || "").includes("DAILY") ? 1 : 30);
    const end = new Date(start.getTime() + durationDays * 24 * 60 * 60 * 1000);

    if (end.getTime() > Date.now()) {
      return { catalog, end, start, status: "Active", transaction };
    }
  }

  const latestPending = transactions.find((transaction) => {
    const family = String(transaction.transaction_family || "").toUpperCase();
    const type = String(transaction.transaction_type || "").toUpperCase();
    return transaction.status === "PENDING" && (family === "MEMBERSHIP" || type.startsWith("MEMBERSHIP_"));
  });

  if (latestPending) {
    return {
      catalog: catalogPlans.find((item) => item.code === latestPending.transaction_type),
      end: null,
      start: new Date(latestPending.created_at),
      status: "Pending",
      transaction: latestPending,
    };
  }

  return null;
};

export default function ProfileMembershipPlanPage() {
  const [profile, setProfile] = useState(null);
  const [catalogPlans, setCatalogPlans] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentPlan, setPaymentPlan] = useState(null);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("QRIS");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState("");
  const [registrationPlanId, setRegistrationPlanId] = useState("");
  const {
    containerRef: turnstileRef,
    error: turnstileError,
    reset: resetTurnstile,
    token: turnstileToken,
  } = useTurnstile();

  const fetchTransactions = async () => {
    try {
      const response = await api.get("/transactions/history", {
        params: { page: 1, limit: 20 },
      });
      setTransactions(response.data?.data || []);
    } catch (err) {
      setError(getErrorMessage(err, "Gagal memuat riwayat transaksi."));
      setTransactions([]);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const [profileResult, catalogResult] = await Promise.allSettled([
          api.get("/users/me"),
          api.get("/catalogs/membership"),
        ]);

        if (profileResult.status === "fulfilled") {
          setProfile(profileResult.value.data?.data || null);
        } else {
          setProfile(null);
        }

        if (catalogResult.status === "fulfilled") {
          const catalogs = catalogResult.value.data?.data || [];
          setCatalogPlans(catalogs.filter((item) => item.family === "MEMBERSHIP" && item.is_active !== false));
        } else {
          setCatalogPlans([]);
        }
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(fetchTransactions, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setRegistrationPlanId(normalizePlanId(getStoredRegistrationPlanId(profile)));
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [profile]);

  const membershipSnapshot = useMemo(
    () => getActiveMembershipSnapshot(profile, transactions, catalogPlans),
    [catalogPlans, profile, transactions],
  );
  const currentPlanId = getProfilePlanId(profile, registrationPlanId);
  const profileTierCode = getUserTierCode(profile);
  const fallbackPlan = useMemo(() => getAuthMembershipPlan(currentPlanId), [currentPlanId]);
  const currentPlan = useMemo(() => {
    if (!membershipSnapshot?.catalog) return fallbackPlan;
    const price = getCatalogPrice(membershipSnapshot.catalog, profileTierCode) || membershipSnapshot.transaction?.amount || 0;
    return {
      description: membershipSnapshot.catalog.description || fallbackPlan.description,
      id: membershipSnapshot.catalog.code,
      name: membershipSnapshot.catalog.name,
      period: membershipSnapshot.catalog.duration_days ? `${membershipSnapshot.catalog.duration_days} hari` : fallbackPlan.period,
      price: formatCurrency(price),
    };
  }, [fallbackPlan, membershipSnapshot, profileTierCode]);
  const status = membershipSnapshot?.status || getMembershipStatus(profile);
  const startDate = formatDate(
    membershipSnapshot?.start || profile?.membership_start_date || profile?.membership?.start_date || profile?.created_at,
  );
  const endDate = formatDate(membershipSnapshot?.end || profile?.membership_end_date || profile?.membership?.end_date);
  const availablePlans = useMemo(() => {
    if (catalogPlans.length === 0) {
      return authMembershipPlans.map((plan) => ({
        ...plan,
        paymentPlanId: plan.id,
        prices: [{ tierCode: "DEFAULT", tierName: "Harga", price: plan.price }],
      }));
    }

    return catalogPlans.map((item) => {
      const selectedPrice = getCatalogPriceItem(item, profileTierCode);
      const price = selectedPrice?.price || 0;
      return {
        benefits: [
          item.duration_days ? `${item.duration_days} hari akses gym` : "Akses gym sesuai katalog",
          "Harga mengikuti tier akun",
          item.is_active ? "Status aktif" : "Tidak aktif",
        ],
        description: item.description || "Membership plan dari katalog backend.",
        id: item.code,
        catalogCode: item.code,
        name: item.name,
        paymentPlanId: getPlanIdFromCatalogCode(item.code),
        period: item.duration_days ? `${item.duration_days} hari` : "plan",
        price: formatCurrency(price),
        selectedTierCode: selectedPrice?.tier_code,
        prices: (item.prices || []).map((priceItem) => ({
          price: formatCurrency(priceItem.price),
          tierCode: priceItem.tier_code,
          tierName: priceItem.tier_name || formatTierName(priceItem.tier_code),
        })),
      };
    });
  }, [catalogPlans, profileTierCode]);
  const currentPaymentPlan =
    availablePlans.find((plan) => plan.id === currentPlan.id || plan.catalogCode === currentPlan.id) ||
    availablePlans[0] ||
    null;
  const memberId = profile?.id ? `VF-${String(profile.id).slice(0, 8).toUpperCase()}` : "VF-2024-1234";

  const createMembershipPayment = async () => {
    if (!paymentPlan) return;

    const paymentTab = paymentMethod === "QRIS" ? openBlankPaymentTab() : null;
    setPaymentLoading(true);
    setError("");
    try {
      const nextTurnstileToken = turnstileToken || await requestTurnstileToken();
      if (!nextTurnstileToken) {
        setError(turnstileError || "Selesaikan verifikasi captcha terlebih dahulu.");
        paymentTab?.close();
        return;
      }

      const response = await api.post("/transactions/create", {
        paymentMethod,
        transactionType: paymentPlan.catalogCode || getTransactionTypeFromPlanId(paymentPlan.paymentPlanId || paymentPlan.id),
      }, {
        headers: { "X-Turnstile-Token": nextTurnstileToken },
      });
      const paymentUrl = getPaymentUrlFromResponse(response.data);

      if (paymentMethod === "QRIS" && paymentUrl) {
        if (paymentTab) {
          paymentTab.location.assign(paymentUrl);
        } else {
          openPaymentInNewTab(paymentUrl);
        }
        return;
      }

      if (paymentMethod === "QRIS" && !paymentUrl) {
        if (paymentTab) {
          paymentTab.document.body.innerHTML =
            "<p style=\"font-family:Arial,sans-serif;padding:24px;\">Link pembayaran Midtrans tidak tersedia. Silakan kembali ke VocaFit.</p>";
        }
        setError("Link pembayaran Midtrans tidak tersedia.");
        return;
      }

      paymentTab?.close();
      setPaymentPlan(null);
      await fetchTransactions();
    } catch (err) {
      paymentTab?.close();
      setError(getErrorMessage(err, "Gagal membuat pembayaran membership."));
    } finally {
      resetTurnstile();
      setPaymentLoading(false);
    }
  };

  const returnToMembershipPlans = () => {
    if (paymentLoading) return;
    setPaymentPlan(null);
    setIsUpgradeOpen(true);
  };

  return (
    <MemberLayout active="Profile">
      <style>{`
        .profile-plan-page {
          display: grid;
          gap: 22px;
        }

        .profile-plan-title {
          color: #0b0871;
          font-family: 'Anton', sans-serif;
          font-size: 34px;
          font-weight: 400;
          letter-spacing: 0;
          line-height: 1;
          margin: 0;
        }

        .profile-tabs {
          align-items: center;
          border-bottom: 1px solid rgba(11, 8, 113, .36);
          display: flex;
          gap: 22px;
          overflow-x: auto;
          padding: 0 4px 10px;
        }

        .profile-tab {
          align-items: center;
          background: transparent;
          border: 0;
          color: #514da5;
          cursor: pointer;
          display: inline-flex;
          flex: 0 0 auto;
          gap: 9px;
          font: inherit;
          font-size: 14px;
          font-weight: 900;
          min-height: 32px;
          padding: 0;
          text-decoration: none;
        }

        .profile-tab svg {
          height: 18px;
          width: 18px;
        }

        .profile-tab.is-active {
          color: #ff7a00;
          position: relative;
        }

        .profile-tab.is-active::after {
          background: #ff7a00;
          border-radius: 999px;
          bottom: -11px;
          content: "";
          height: 3px;
          left: 0;
          position: absolute;
          right: 0;
        }

        .profile-plan-hero {
          background: #0b0871;
          border-radius: 12px;
          box-shadow: 0 18px 38px rgba(8, 4, 120, .18);
          color: #ffffff;
          display: grid;
          gap: 22px;
          grid-template-columns: minmax(0, 1fr) auto;
          padding: 28px;
        }

        .profile-plan-label {
          color: #ffe08d;
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .profile-plan-hero h2 {
          color: #ffffff;
          font-size: clamp(26px, 4vw, 42px);
          font-weight: 900;
          margin: 8px 0;
        }

        .profile-plan-hero p {
          color: #dfe4ff;
          font-size: 13px;
          font-weight: 800;
          line-height: 1.45;
          margin: 0;
          max-width: 620px;
        }

        .profile-plan-price {
          align-self: center;
          color: #ff7a00;
          font-size: clamp(24px, 4vw, 38px);
          font-weight: 900;
          text-align: right;
          white-space: nowrap;
        }

        .profile-plan-price span {
          color: #dfe4ff;
          display: block;
          font-size: 13px;
          margin-top: 6px;
        }

        .profile-plan-stats {
          display: grid;
          gap: 14px;
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .profile-plan-stat {
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 14px 28px rgba(8, 4, 120, .08);
          padding: 18px;
        }

        .profile-plan-stat span {
          color: #8a8cbe;
          display: block;
          font-size: 11px;
          font-weight: 900;
          margin-bottom: 7px;
          text-transform: uppercase;
        }

        .profile-plan-stat strong {
          color: #0b0871;
          font-size: 17px;
          font-weight: 900;
        }

        .profile-plan-grid {
          display: grid;
          gap: 16px;
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .profile-plan-card {
          background: #ffffff;
          border: 2px solid transparent;
          border-radius: 12px;
          box-shadow: 0 14px 28px rgba(8, 4, 120, .08);
          cursor: pointer;
          display: flex;
          flex-direction: column;
          min-height: 310px;
          padding: 22px;
          transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
          will-change: transform;
        }

        .profile-plan-card:hover {
          box-shadow: 0 22px 42px rgba(8, 4, 120, .16);
          transform: translateY(-5px);
        }

        .profile-plan-card:active {
          transform: translateY(-1px) scale(.992);
        }

        .profile-plan-card:focus-visible {
          border-color: #0b0871;
          outline: none;
          box-shadow: 0 0 0 4px rgba(11, 8, 113, .14), 0 22px 42px rgba(8, 4, 120, .16);
        }

        .profile-plan-card.is-active {
          border-color: #ff7a00;
        }

        .profile-plan-card h3 {
          color: #0b0871;
          font-size: 17px;
          font-weight: 900;
          margin: 0 0 8px;
        }

        .profile-plan-card p {
          color: #565a91;
          font-size: 12px;
          font-weight: 800;
          line-height: 1.4;
          margin: 0 0 14px;
        }

        .profile-plan-card strong {
          color: #ff7a00;
          display: block;
          font-size: 21px;
          font-weight: 900;
          margin-bottom: 14px;
        }

        .profile-plan-card strong span {
          color: #565a91;
          font-size: 12px;
        }

        .profile-plan-price-list {
          border: 1px solid #eceef3;
          border-radius: 8px;
          display: grid;
          gap: 0;
          margin: 0 0 14px;
          overflow: hidden;
        }

        .profile-plan-price-row {
          align-items: center;
          background: #f8f8fb;
          display: grid;
          gap: 10px;
          grid-template-columns: minmax(0, 1fr) auto;
          min-height: 38px;
          padding: 8px 10px;
        }

        .profile-plan-price-row + .profile-plan-price-row {
          border-top: 1px solid #eceef3;
        }

        .profile-plan-price-row span {
          color: #565a91;
          font-size: 11px;
          font-weight: 900;
          line-height: 1.2;
        }

        .profile-plan-price-row b {
          color: #ff7a00;
          font-size: 12px;
          font-weight: 900;
          white-space: nowrap;
        }

        .profile-plan-card ul {
          display: grid;
          gap: 9px;
          flex: 1;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .profile-plan-card li {
          color: #292782;
          font-size: 12px;
          font-weight: 800;
          line-height: 1.35;
          padding-left: 18px;
          position: relative;
        }

        .profile-plan-card li::before {
          background: #24c870;
          border-radius: 50%;
          content: "";
          height: 8px;
          left: 0;
          position: absolute;
          top: 5px;
          width: 8px;
        }

        .profile-plan-pay-btn {
          align-items: center;
          background: #ff7a00;
          border: 0;
          border-radius: 8px;
          color: #ffffff;
          cursor: pointer;
          display: inline-flex;
          font: inherit;
          font-size: 12px;
          font-weight: 900;
          justify-content: center;
          margin-top: 18px;
          min-height: 40px;
          padding: 0 14px;
          text-decoration: none;
          text-transform: uppercase;
        }

        .profile-plan-pay-btn:hover {
          box-shadow: 0 10px 20px rgba(255, 122, 0, .18);
          transform: translateY(-1px);
        }

        .profile-payment-backdrop {
          align-items: center;
          background: rgba(8, 4, 120, .54);
          display: flex;
          inset: 0;
          justify-content: center;
          padding: 24px;
          position: fixed;
          z-index: 1000;
        }

        .profile-payment-modal {
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 24px 80px rgba(0,0,0,.28);
          padding: 24px;
          width: min(100%, 520px);
        }

        .profile-payment-modal h2 {
          color: #0b0871;
          font-size: 22px;
          font-weight: 900;
          margin: 0 0 6px;
        }

        .profile-payment-modal p {
          color: #565a91;
          font-size: 13px;
          font-weight: 800;
          line-height: 1.4;
          margin: 0 0 18px;
        }

        .profile-payment-summary {
          background: #f8f8fb;
          border: 1px solid #eceef3;
          border-radius: 8px;
          display: grid;
          gap: 8px;
          margin-bottom: 16px;
          padding: 14px;
        }

        .profile-payment-summary span {
          color: #565a91;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .profile-payment-summary strong {
          color: #0b0871;
          font-size: 16px;
          font-weight: 900;
        }

        .profile-payment-methods {
          display: grid;
          gap: 10px;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          margin-bottom: 18px;
        }

        .profile-payment-methods button {
          background: #ffffff;
          border: 1px solid #0b0871;
          border-radius: 8px;
          color: #0b0871;
          cursor: pointer;
          font: inherit;
          font-size: 12px;
          font-weight: 900;
          min-height: 42px;
          text-transform: uppercase;
        }

        .profile-payment-methods button.active {
          background: #0b0871;
          color: #ffffff;
        }

        .profile-payment-turnstile {
          display: grid;
          justify-items: center;
          margin: 0;
          min-height: 0;
          width: 100%;
        }

        .profile-payment-turnstile span {
          color: #c73822;
          font-size: 12px;
          font-weight: 800;
          margin-top: 6px;
          text-align: center;
        }

        .profile-payment-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }

        .profile-payment-actions button {
          border-radius: 8px;
          cursor: pointer;
          font: inherit;
          font-size: 12px;
          font-weight: 900;
          min-height: 40px;
          padding: 0 14px;
          text-transform: uppercase;
        }

        .profile-payment-cancel {
          background: #ffffff;
          border: 1px solid #c73822;
          color: #c73822;
        }

        .profile-payment-submit {
          background: #ff7a00;
          border: 1px solid #ff7a00;
          color: #ffffff;
        }

        .profile-payment-actions button:disabled {
          cursor: not-allowed;
          opacity: .62;
        }

        .upgrade-plan-modal {
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 24px 80px rgba(0,0,0,.28);
          max-height: calc(100vh - 48px);
          overflow-y: auto;
          padding: 24px;
          width: min(100%, 980px);
        }

        .upgrade-plan-head {
          align-items: start;
          border-bottom: 1px solid #eceef3;
          display: flex;
          gap: 16px;
          justify-content: space-between;
          margin-bottom: 18px;
          padding-bottom: 14px;
        }

        .upgrade-plan-head h2 {
          color: #0b0871;
          font-size: 22px;
          font-weight: 900;
          margin: 0 0 6px;
        }

        .upgrade-plan-head p {
          color: #565a91;
          font-size: 13px;
          font-weight: 800;
          margin: 0;
        }

        .upgrade-plan-close {
          background: #f4f5f8;
          border: 1px solid #d8dbe6;
          border-radius: 8px;
          color: #11131d;
          cursor: pointer;
          font: inherit;
          font-size: 16px;
          font-weight: 900;
          height: 34px;
          width: 34px;
        }

        .membership-overview {
          display: grid;
          gap: 26px;
        }

        .membership-hero-card {
          background: linear-gradient(115deg, #ff7a00 0%, #ff4b16 52%, #ec001e 100%);
          border-radius: 12px;
          color: #ffffff;
          display: grid;
          gap: 20px;
          padding: 26px 28px 22px;
        }

        .membership-hero-top {
          align-items: start;
          display: flex;
          gap: 18px;
          justify-content: space-between;
        }

        .membership-hero-top h2 {
          color: #ffffff;
          font-size: 22px;
          font-weight: 900;
          margin: 0 0 6px;
        }

        .membership-hero-top p {
          color: #ffffff;
          font-size: 14px;
          font-weight: 700;
          margin: 0;
        }

        .membership-hero-price {
          color: #ffffff;
          font-size: 20px;
          font-weight: 900;
          white-space: nowrap;
        }

        .membership-hero-facts {
          display: grid;
          gap: 16px;
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }

        .membership-fact {
          background: rgba(255, 255, 255, .12);
          border: 1px solid rgba(255, 255, 255, .18);
          border-radius: 8px;
          min-height: 64px;
          padding: 13px;
        }

        .membership-fact span {
          color: rgba(255,255,255,.78);
          display: block;
          font-size: 12px;
          font-weight: 800;
          margin-bottom: 7px;
        }

        .membership-fact strong {
          color: #ffffff;
          display: block;
          font-size: 13px;
          font-weight: 800;
          line-height: 1.25;
        }

        .membership-content-grid {
          align-items: start;
          display: grid;
          gap: 24px;
          grid-template-columns: minmax(0, 1fr) 272px;
        }

        .membership-benefits-card {
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 14px 28px rgba(8, 4, 120, .08);
          padding: 22px;
        }

        .membership-benefits-card h2 {
          color: #0b0871;
          font-size: 15px;
          font-weight: 900;
          margin: 0 0 18px;
        }

        .membership-benefit-grid {
          display: grid;
          gap: 14px 20px;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .membership-benefit-grid li {
          align-items: start;
          color: #0b0871;
          display: grid;
          font-size: 12px;
          font-weight: 700;
          gap: 10px;
          grid-template-columns: 20px minmax(0, 1fr);
          line-height: 1.25;
        }

        .membership-benefit-grid span {
          align-items: center;
          border: 2px solid #24c870;
          border-radius: 50%;
          color: #24c870;
          display: inline-flex;
          font-size: 11px;
          font-weight: 900;
          height: 18px;
          justify-content: center;
          width: 18px;
        }

        .membership-action-stack {
          display: grid;
          gap: 12px;
        }

        .membership-action-stack button {
          border: 0;
          border-radius: 10px;
          cursor: pointer;
          font: inherit;
          font-size: 13px;
          font-weight: 900;
          min-height: 42px;
        }

        .membership-upgrade-btn {
          background: #1f55f2;
          box-shadow: 0 10px 18px rgba(31, 85, 242, .28);
          color: #ffffff;
        }

        .membership-renew-btn {
          background: #edf4ff;
          color: #25399a;
        }

        .profile-plan-loading {
          color: #565a91;
          font-size: 13px;
          font-weight: 800;
        }

        .profile-plan-alert {
          background: #fff1f0;
          border-radius: 8px;
          color: #c73822;
          font-size: 13px;
          font-weight: 800;
          padding: 12px 14px;
        }

        @media (max-width: 1040px) {
          .profile-plan-hero,
          .profile-plan-stats,
          .profile-plan-grid,
          .membership-content-grid,
          .membership-hero-facts {
            grid-template-columns: 1fr;
          }

          .profile-plan-price {
            text-align: left;
          }
        }

        @media (max-width: 680px) {
          .membership-hero-top {
            flex-direction: column;
          }

          .membership-benefit-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <section className="profile-plan-page">
        <h1 className="profile-plan-title">Profile</h1>

        <nav className="profile-tabs" aria-label="Profile settings">
          {tabs.map((tab) => (
            tab.to ? (
              <Link className={`profile-tab ${tab.active ? "is-active" : ""}`} key={tab.label} to={tab.to}>
                <MemberIcon name={tab.icon} />
                <span>{tab.label}</span>
              </Link>
            ) : (
              <button className="profile-tab" key={tab.label} type="button">
                <MemberIcon name={tab.icon} />
                <span>{tab.label}</span>
              </button>
            )
          ))}
        </nav>

        {loading && <p className="profile-plan-loading">Memuat membership plan...</p>}
        {error && <div className="profile-plan-alert">{error}</div>}

        <section className="membership-overview">
          <article className="membership-hero-card">
            <div className="membership-hero-top">
              <div>
                <h2>{currentPlan.name}</h2>
                <p>{currentPlan.description}</p>
              </div>
              <strong className="membership-hero-price">
                {currentPlan.price} / {currentPlan.period}
              </strong>
            </div>

            <div className="membership-hero-facts">
              <div className="membership-fact">
                <span>Member ID</span>
                <strong>{memberId}</strong>
              </div>
              <div className="membership-fact">
                <span>Start Date</span>
                <strong>{startDate}</strong>
              </div>
              <div className="membership-fact">
                <span>Expiration</span>
                <strong>{endDate}</strong>
              </div>
              <div className="membership-fact">
                <span>Status</span>
                <strong>{status}</strong>
              </div>
            </div>
          </article>

          <div className="membership-content-grid">
            <section className="membership-benefits-card">
              <h2>Membership Benefits</h2>
              <ul className="membership-benefit-grid">
                {membershipBenefits.map((benefit) => (
                  <li key={benefit}>
                    <span>✓</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </section>

            <aside className="membership-action-stack">
              <button className="membership-upgrade-btn" onClick={() => setIsUpgradeOpen(true)} type="button">
                Upgrade Plan
              </button>
              <button className="membership-renew-btn" onClick={() => currentPaymentPlan && setPaymentPlan(currentPaymentPlan)} type="button">
                Renew Membership
              </button>
            </aside>
          </div>
        </section>

      </section>

      {paymentPlan && (
        <div className="profile-payment-backdrop">
          <section className="profile-payment-modal" role="dialog" aria-modal="true">
            <h2>Payment Membership</h2>
            <p>Pilih metode pembayaran untuk memperpanjang membership.</p>

            <div className="profile-payment-summary">
              <span>Membership Plan</span>
              <strong>{paymentPlan.name}</strong>
              <span>Durasi</span>
              <strong>{paymentPlan.period}</strong>
            </div>

            <div className="profile-payment-methods">
              {["QRIS", "CASH"].map((method) => (
                <button
                  className={paymentMethod === method ? "active" : ""}
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  type="button"
                >
                  {method}
                </button>
              ))}
            </div>

            <div className="profile-payment-turnstile">
              <div ref={turnstileRef} />
              {turnstileError && <span>{turnstileError}</span>}
            </div>

            <div className="profile-payment-actions">
              <button className="profile-payment-cancel" onClick={returnToMembershipPlans} type="button">
                Batal
              </button>
              <button
                className="profile-payment-submit"
                disabled={paymentLoading}
                onClick={createMembershipPayment}
                type="button"
              >
                {paymentLoading ? "Memproses..." : "Buat Payment"}
              </button>
            </div>
          </section>
        </div>
      )}

      {isUpgradeOpen && (
        <div className="profile-payment-backdrop">
          <section className="upgrade-plan-modal" role="dialog" aria-modal="true">
            <div className="upgrade-plan-head">
              <div>
                <h2>Choose Membership Plan</h2>
                <p>Pilih membership yang ingin digunakan untuk upgrade atau perpanjangan.</p>
              </div>
              <button className="upgrade-plan-close" onClick={() => setIsUpgradeOpen(false)} type="button" aria-label="Tutup">
                x
              </button>
            </div>

            <section className="profile-plan-grid" aria-label="Available membership plans">
              {availablePlans.map((plan) => (
                <article
                  className={`profile-plan-card ${plan.id === currentPlan.id ? "is-active" : ""}`}
                  key={plan.id}
                  onClick={() => {
                    setIsUpgradeOpen(false);
                    setPaymentPlan(plan);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setIsUpgradeOpen(false);
                      setPaymentPlan(plan);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <h3>{plan.name}</h3>
                  <p>{plan.description}</p>
                  <strong>
                    {plan.price} <span>/ {plan.period}</span>
                  </strong>
                  <div className="profile-plan-price-list" aria-label={`Harga ${plan.name}`}>
                    {plan.prices.map((price) => (
                      <div className="profile-plan-price-row" key={`${plan.id}-${price.tierCode}`}>
                        <span>{price.tierName}</span>
                        <b>{price.price}</b>
                      </div>
                    ))}
                  </div>
                  <ul>
                    {plan.benefits.map((benefit) => (
                      <li key={benefit}>{benefit}</li>
                    ))}
                  </ul>
                  <button
                    className="profile-plan-pay-btn"
                    onClick={(event) => {
                      event.stopPropagation();
                      setIsUpgradeOpen(false);
                      setPaymentPlan(plan);
                    }}
                    type="button"
                  >
                    Pilih Plan
                  </button>
                </article>
              ))}
            </section>
          </section>
        </div>
      )}
    </MemberLayout>
  );
}
