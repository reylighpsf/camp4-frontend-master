import { useCallback, useEffect, useMemo, useState } from "react";
import MemberLayout from "../../../../components/member/MemberLayout";
import api from "../../../../components/auth/authApi";
import useMembershipPayment from "./hooks/useMembershipPayment";
import { authMembershipPlans } from "../../../auth/membership/hooks/authPlans";

const membershipPlans = [
  {
    id: "student",
    name: "Vocational Student Plan",
    price: "Rp 100.000",
    period: "Month",
    transactionType: "MEMBERSHIP_MONTHLY",
    description: "Plan pilihan siswa untuk akses gym selama 1 bulan.",
    benefits: [
      "1-month gym access",
      "Personal member QR Code",
      "Workout tracking dashboard",
      "Trainer booking access",
      "Live gym capacity information",
    ],
  },
  {
    id: "premium",
    name: "Premium Membership",
    price: "Rp 497.000",
    period: "Month",
    transactionType: "MEMBERSHIP_MONTHLY",
    description: "Akses penuh untuk latihan rutin dan bimbingan trainer.",
    benefits: [
      "Unlimited gym facilities",
      "Secure locker access",
      "Personal workout guidance",
      "Monthly fitness tracking",
      "Member event discounts",
    ],
  },
  {
    id: "daily",
    name: "Daily Membership",
    price: "Rp 15.000",
    period: "Day",
    transactionType: "MEMBERSHIP_DAILY",
    description: "Akses gym untuk satu hari.",
    benefits: [
      "One-day access to gym facilities",
      "Cardio and strength equipment access",
      "Check-in QR for same-day visit",
      "Locker access during active visit",
    ],
  },
];

const benefits = [
  "Unlimited access to all gym facilities",
  "Secure locker access at every visit",
  "Personalized workout guidance from trainers",
  "Exclusive discounts on merchandise and events",
  "Priority access to classes and special programs",
  "Member-only rewards and wellness perks",
  "Monthly body composition and fitness tracking",
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
  `Rp ${Number(value || 0).toLocaleString("id-ID", { maximumFractionDigits: 0 })}`;

const getFallbackEndDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString();
};

const isMembershipActive = (profile) => {
  const status = String(profile?.membership_status || profile?.membership?.status || "").toLowerCase();
  if (status === "active" || status === "aktif") return true;
  if (profile?.active_membership) return true;
  const endDate = profile?.membership_end_date || profile?.membership?.end_date;
  return endDate ? new Date(endDate) >= new Date() : false;
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

const normalizePlanId = (planId) => {
  const id = String(planId || "").toLowerCase();
  if (id === "monthly") return "premium";
  return id;
};

export function MembershipPackagesContent() {
  const payment = useMembershipPayment();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [registrationPlanId, setRegistrationPlanId] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState("monthly");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [proofFileName, setProofFileName] = useState("");
  const [proofMessage, setProofMessage] = useState("");
  const [localMessage, setLocalMessage] = useState("");
  const [localError, setLocalError] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const fetchProfile = useCallback(async () => {
    setProfileLoading(true);
    try {
      const response = await api.get("/users/me");
      setProfile(response.data?.data || null);
    } catch {
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProfile();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [fetchProfile]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const storedPlanId = getStoredRegistrationPlanId(profile);
      if (!storedPlanId) return;

      const normalizedPlanId = normalizePlanId(storedPlanId);
      setRegistrationPlanId(normalizedPlanId);
      setSelectedPlanId(normalizedPlanId);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [profile]);

  const currentPlan = useMemo(() => {
    const backendType = String(profile?.membership_type || profile?.membership?.type || "").toLowerCase();
    const selectedType = backendType || registrationPlanId || "student";
    const normalizedType = normalizePlanId(selectedType);
    const authPlan = authMembershipPlans.find((plan) => plan.id === normalizedType);

    return (
      membershipPlans.find((plan) => plan.id === normalizedType) ||
      (authPlan
        ? {
            ...authPlan,
            period: authPlan.period.charAt(0).toUpperCase() + authPlan.period.slice(1),
            transactionType:
              authPlan.id === "daily" ? "MEMBERSHIP_DAILY" : "MEMBERSHIP_MONTHLY",
          }
        : membershipPlans[0])
    );
  }, [profile, registrationPlanId]);

  const selectedMembershipPlan = useMemo(
    () => membershipPlans.find((plan) => plan.id === selectedPlanId) || currentPlan,
    [currentPlan, selectedPlanId],
  );

  const memberId = profile?.id ? `VF-${String(profile.id).slice(0, 4).toUpperCase()}-${String(profile.id).slice(4, 8).toUpperCase()}` : "VF-2024-1234";
  const startDate = profile?.membership_start_date || profile?.membership?.start_date || profile?.created_at;
  const endDate = profile?.membership_end_date || profile?.membership?.end_date || getFallbackEndDate();
  const activeStatus = isMembershipActive(profile);
  const hasRegisteredPlan = Boolean(registrationPlanId);
  const shouldShowSelectedPlan = activeStatus || hasRegisteredPlan;
  const membershipStatusLabel = activeStatus ? "Active" : "Selected";
  const price = currentPlan.price || formatCurrency(profile?.monthly_price || 497000);

  const openPaymentModal = (plan = currentPlan) => {
    setSelectedPlan(plan);
    setPaymentMethod("CASH");
    setProofFileName("");
    setProofMessage("");
    setLocalMessage("");
    setLocalError("");
  };

  const handlePayment = async () => {
    if (!selectedPlan) return;
    setProofFileName("");
    setProofMessage("");
    setLocalMessage("");
    setLocalError("");

    const result = await payment.createPayment({
      packageId: selectedPlan.id,
      transactionType: selectedPlan.transactionType,
      paymentMethod,
    });

    if (result.ok && paymentMethod === "CASH") {
      setSelectedPlan(null);
      setIsProofModalOpen(true);
    }
  };

  const handleProofUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file || !payment.pendingTransaction?.id) return;

    const proof = {
      fileName: file.name,
      transactionId: payment.pendingTransaction.id,
      uploadedAt: new Date().toISOString(),
    };

    localStorage.setItem(`vocafit-payment-proof-${proof.transactionId}`, JSON.stringify(proof));
    setProofFileName(file.name);
    setProofMessage("Struk berhasil diupload. Pembayaran menunggu konfirmasi pengurus.");
  };

  const handleCancelPlan = async () => {
    setLocalMessage("");
    setLocalError("");

    if (!activeStatus) {
      setLocalError("Tidak ada membership aktif yang bisa dibatalkan.");
      return;
    }

    if (!window.confirm("Yakin ingin membatalkan membership aktif?")) return;

    setCancelling(true);
    try {
      await api.delete("/users/me/membership");
      setLocalMessage("Membership berhasil dibatalkan.");
      await fetchProfile();
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Gagal membatalkan membership.";
      setLocalError(message);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      <style>{`
        .membership-page {
          display: grid;
          gap: 34px;
        }

        .membership-hero {
          background: linear-gradient(115deg, #ff7a00 0%, #ff4f10 54%, #ec001d 100%);
          border-radius: 14px;
          box-shadow: 0 18px 34px rgba(255, 83, 0, .23);
          color: #ffffff;
          display: grid;
          gap: 28px;
          min-height: 206px;
          padding: 32px 38px 30px;
        }

        .membership-hero-head {
          align-items: start;
          display: flex;
          gap: 24px;
          justify-content: space-between;
        }

        .membership-hero h1 {
          color: #ffffff;
          font-size: 24px;
          font-weight: 900;
          margin: 0 0 8px;
        }

        .membership-hero p {
          color: rgba(255, 255, 255, .9);
          font-size: 16px;
          font-weight: 800;
          margin: 0;
        }

        .membership-price {
          color: #ffffff;
          font-size: 22px;
          font-weight: 900;
          padding-top: 12px;
          text-align: right;
          white-space: nowrap;
        }

        .membership-info-grid {
          display: grid;
          gap: 24px;
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }

        .membership-info {
          background: rgba(255, 255, 255, .13);
          border: 1px solid rgba(255, 255, 255, .1);
          border-radius: 12px;
          min-height: 94px;
          padding: 20px 22px;
        }

        .membership-info span {
          color: rgba(255, 255, 255, .76);
          display: block;
          font-size: 12px;
          font-weight: 900;
          margin-bottom: 8px;
        }

        .membership-info strong {
          color: #ffffff;
          display: block;
          font-size: 14px;
          font-weight: 900;
          line-height: 1.35;
          overflow-wrap: anywhere;
        }

        .membership-lower {
          align-items: start;
          display: grid;
          gap: 52px;
          grid-template-columns: minmax(0, 1fr) 380px;
        }

        .benefits-card {
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 14px 28px rgba(8, 4, 120, .08);
          padding: 30px 32px;
        }

        .benefits-card h2 {
          color: #0b0871;
          font-size: 17px;
          font-weight: 900;
          margin: 0 0 28px;
        }

        .benefits-grid {
          display: grid;
          gap: 20px 30px;
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .benefit-item {
          align-items: flex-start;
          color: #262084;
          display: flex;
          gap: 14px;
          font-size: 12px;
          font-weight: 800;
          line-height: 1.35;
        }

        .benefit-check {
          align-items: center;
          border: 2px solid #1ecf70;
          border-radius: 50%;
          color: #1ecf70;
          display: inline-flex;
          flex: 0 0 auto;
          height: 22px;
          justify-content: center;
          margin-top: -1px;
          width: 22px;
        }

        .benefit-check::before {
          content: "";
          border-bottom: 2px solid currentColor;
          border-right: 2px solid currentColor;
          height: 8px;
          transform: rotate(45deg) translate(-1px, -1px);
          width: 4px;
        }

        .membership-actions {
          display: grid;
          gap: 18px;
          padding-top: 54px;
        }

        .membership-action {
          border: 0;
          border-radius: 12px;
          box-shadow: 0 11px 20px rgba(8, 4, 120, .12);
          color: #ffffff;
          cursor: pointer;
          font: inherit;
          font-size: 14px;
          font-weight: 900;
          height: 50px;
          padding: 0 24px;
          width: 100%;
        }

        .membership-action.primary {
          background: #1f55ef;
        }

        .membership-action.secondary {
          background: #e9eef7;
          box-shadow: none;
          color: #3150a3;
        }

        .membership-action.danger {
          background: #ff2626;
        }

        .membership-action:disabled {
          cursor: not-allowed;
          opacity: .62;
        }

        .membership-message {
          border-radius: 10px;
          font-size: 13px;
          font-weight: 800;
          padding: 13px 16px;
        }

        .membership-message.error {
          background: #fff1f0;
          color: #c73822;
        }

        .membership-message.success {
          background: #edfdf3;
          color: #16794c;
        }

        .membership-loading {
          background: #ffffff;
          border-radius: 12px;
          color: #52558f;
          font-size: 13px;
          font-weight: 800;
          padding: 18px 20px;
        }

        .plan-section {
          display: grid;
          gap: 22px;
        }

        .plan-section-head h1 {
          color: #0b0871;
          font-family: 'Anton', sans-serif;
          font-size: 34px;
          font-weight: 400;
          letter-spacing: 0;
          line-height: 1;
          margin: 0 0 8px;
        }

        .plan-section-head p {
          color: #292782;
          font-size: 14px;
          font-weight: 800;
          margin: 0;
        }

        .plan-grid {
          display: grid;
          gap: 22px;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          max-width: 850px;
        }

        .plan-card {
          background: #ffffff;
          border: 2px solid transparent;
          border-radius: 14px;
          box-shadow: 0 14px 28px rgba(8, 4, 120, .1);
          cursor: pointer;
          display: grid;
          gap: 22px;
          min-height: 290px;
          padding: 26px;
          text-align: left;
          transition: border-color .16s, box-shadow .16s, transform .16s;
        }

        .plan-card.featured {
          border-color: #ff7a00;
        }

        .plan-card.is-selected {
          border-color: #1f55ef;
          box-shadow: 0 18px 34px rgba(31, 85, 239, .18);
          transform: translateY(-2px);
        }

        .plan-card:focus-visible {
          outline: 3px solid rgba(31, 85, 239, .25);
          outline-offset: 3px;
        }

        .plan-card h2 {
          color: #0b0871;
          font-size: 22px;
          font-weight: 900;
          margin: 0 0 8px;
        }

        .plan-card p {
          color: #52558f;
          font-size: 13px;
          font-weight: 800;
          margin: 0;
        }

        .plan-price {
          color: #ff7a00;
          font-size: 30px;
          font-weight: 900;
          line-height: 1;
        }

        .plan-price span {
          color: #52558f;
          display: block;
          font-size: 12px;
          font-weight: 900;
          margin-top: 8px;
        }

        .plan-benefits {
          display: grid;
          gap: 10px;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .plan-benefits li {
          align-items: flex-start;
          color: #262084;
          display: flex;
          gap: 10px;
          font-size: 12px;
          font-weight: 800;
          line-height: 1.35;
        }

        .plan-benefits li::before {
          color: #1ecf70;
          content: "✓";
          flex: 0 0 auto;
          font-weight: 900;
        }

        .payment-modal-backdrop {
          align-items: center;
          background: rgba(8, 4, 120, .54);
          display: flex;
          inset: 0;
          justify-content: center;
          padding: 28px;
          position: fixed;
          z-index: 1000;
        }

        .payment-modal {
          background: #f8f8fb;
          border-radius: 12px;
          box-shadow: 0 24px 80px rgba(0, 0, 0, .28);
          padding: 24px;
          width: min(100%, 520px);
        }

        .payment-modal-head {
          align-items: flex-start;
          display: flex;
          gap: 18px;
          justify-content: space-between;
          margin-bottom: 22px;
        }

        .payment-modal-head h2 {
          color: #0b0871;
          font-size: 20px;
          font-weight: 900;
          margin: 0 0 6px;
        }

        .payment-modal-head p {
          color: #52558f;
          font-size: 12px;
          font-weight: 700;
          margin: 0;
        }

        .payment-close-btn {
          background: #e4e4ef;
          border: 0;
          border-radius: 50%;
          color: #0b0871;
          cursor: pointer;
          font: inherit;
          font-weight: 900;
          height: 36px;
          width: 36px;
        }

        .payment-method-grid {
          display: grid;
          gap: 12px;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          margin-bottom: 22px;
        }

        .payment-method-card {
          background: #ffffff;
          border: 1.5px solid #e4e4ef;
          border-radius: 10px;
          color: #0b0871;
          cursor: pointer;
          font: inherit;
          min-height: 96px;
          padding: 16px;
          text-align: left;
        }

        .payment-method-card.is-active {
          border-color: #ff7a00;
          box-shadow: 0 10px 24px rgba(255, 122, 0, .16);
        }

        .payment-method-card strong {
          display: block;
          font-size: 16px;
          font-weight: 900;
          margin-bottom: 8px;
        }

        .payment-method-card span {
          color: #52558f;
          display: block;
          font-size: 12px;
          font-weight: 700;
          line-height: 1.35;
        }

        .payment-modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .payment-cancel-btn,
        .payment-submit-btn {
          border-radius: 8px;
          cursor: pointer;
          font: inherit;
          font-size: 13px;
          font-weight: 900;
          height: 42px;
          padding: 0 18px;
        }

        .payment-cancel-btn {
          background: #ffffff;
          border: 1px solid #0b0871;
          color: #0b0871;
        }

        .payment-submit-btn {
          background: #ff7a00;
          border: 0;
          color: #ffffff;
        }

        .payment-submit-btn:disabled {
          cursor: not-allowed;
          opacity: .58;
        }

        .proof-upload {
          align-items: center;
          background: #fff4d8;
          border: 1.5px dashed #0b0871;
          border-radius: 10px;
          color: #0b0871;
          cursor: pointer;
          display: flex;
          font-size: 13px;
          font-weight: 900;
          justify-content: center;
          min-height: 86px;
          padding: 18px;
          text-align: center;
        }

        .proof-upload input {
          height: 1px;
          opacity: 0;
          position: absolute;
          width: 1px;
        }

        @media (max-width: 1120px) {
          .membership-info-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .membership-lower {
            grid-template-columns: 1fr;
          }

          .membership-actions {
            padding-top: 0;
          }
        }

        @media (max-width: 720px) {
          .membership-hero {
            padding: 24px;
          }

          .membership-hero-head {
            display: grid;
          }

          .membership-price {
            padding-top: 0;
            text-align: left;
          }

          .membership-info-grid,
          .benefits-grid,
          .payment-method-grid,
          .plan-grid {
            grid-template-columns: 1fr;
          }

          .payment-modal-actions {
            flex-direction: column;
          }
        }
      `}</style>

      <section className="membership-page">
        {profileLoading && <div className="membership-loading">Memuat status membership...</div>}
        {payment.error && <div className="membership-message error">{payment.error}</div>}
        {payment.successMessage && <div className="membership-message success">{payment.successMessage}</div>}
        {proofMessage && <div className="membership-message success">{proofMessage}</div>}
        {localMessage && <div className="membership-message success">{localMessage}</div>}
        {localError && <div className="membership-message error">{localError}</div>}

        {!profileLoading && shouldShowSelectedPlan && (
          <>
            <section className="membership-hero">
              <div className="membership-hero-head">
                <div>
                  <h1>{currentPlan.name}</h1>
                  <p>{currentPlan.description || "Membership plan pilihan kamu saat mendaftar."}</p>
                </div>
                <div className="membership-price">{price} / {currentPlan.period}</div>
              </div>

              <div className="membership-info-grid">
                <div className="membership-info">
                  <span>Member ID</span>
                  <strong>{memberId}</strong>
                </div>
                <div className="membership-info">
                  <span>Start Date</span>
                  <strong>{formatDate(startDate)}</strong>
                </div>
                <div className="membership-info">
                  <span>Expiration</span>
                  <strong>{formatDate(endDate)}</strong>
                </div>
                <div className="membership-info">
                  <span>Status</span>
                  <strong>{membershipStatusLabel}</strong>
                </div>
              </div>
            </section>

            <section className="membership-lower">
              <article className="benefits-card">
                <h2>Membership Benefits</h2>
                <div className="benefits-grid">
                  {(currentPlan.benefits?.length ? currentPlan.benefits : benefits).map((benefit) => (
                    <div className="benefit-item" key={benefit}>
                      <span className="benefit-check" aria-hidden="true" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </article>

              <aside className="membership-actions" aria-label="Membership actions">
                <button
                  className="membership-action primary"
                  onClick={() =>
                    openPaymentModal(
                      membershipPlans.find((plan) => plan.id === "premium") || currentPlan,
                    )
                  }
                  type="button"
                >
                  Upgrade Plan
                </button>
                <button className="membership-action secondary" onClick={() => openPaymentModal(currentPlan)} type="button">
                  {activeStatus ? "Renew Membership" : "Continue Payment"}
                </button>
                {activeStatus && (
                  <button
                    className="membership-action danger"
                    disabled={cancelling}
                    onClick={handleCancelPlan}
                    type="button"
                  >
                    {cancelling ? "Cancelling..." : "Cancel Plan"}
                  </button>
                )}
              </aside>
            </section>
          </>
        )}

        {!profileLoading && !shouldShowSelectedPlan && (
          <section className="plan-section">
            <div className="plan-section-head">
              <h1>Membership Plan</h1>
              <p>Membership kamu tidak aktif. Pilih plan untuk mengaktifkan akses gym lagi.</p>
            </div>

            <div className="plan-grid">
              {membershipPlans.map((plan) => {
                const planPrice = plan.price || formatCurrency(profile?.monthly_price || 497000);
                const isSelected = selectedMembershipPlan.id === plan.id;
                return (
                  <article
                    className={`plan-card ${plan.id === "student" ? "featured" : ""} ${isSelected ? "is-selected" : ""}`}
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedPlanId(plan.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div>
                      <h2>{plan.name}</h2>
                      <p>{plan.description}</p>
                    </div>
                    <div className="plan-price">
                      {planPrice}
                      <span>/ {plan.period}</span>
                    </div>
                    <ul className="plan-benefits">
                      {plan.benefits.map((benefit) => (
                        <li key={benefit}>{benefit}</li>
                      ))}
                    </ul>
                    <button
                      className="membership-action primary"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedPlanId(plan.id);
                        openPaymentModal(plan);
                      }}
                      type="button"
                    >
                      {isSelected ? "Lanjut Pembayaran" : "Pilih Plan"}
                    </button>
                  </article>
                );
              })}
            </div>

            <article className="benefits-card">
              <h2>{selectedMembershipPlan.name} Benefits</h2>
              <div className="benefits-grid">
                {selectedMembershipPlan.benefits.map((benefit) => (
                  <div className="benefit-item" key={benefit}>
                    <span className="benefit-check" aria-hidden="true" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </article>
          </section>
        )}
      </section>

      {selectedPlan && (
        <div className="payment-modal-backdrop">
          <section className="payment-modal" role="dialog" aria-modal="true">
            <div className="payment-modal-head">
              <div>
                <h2>Pilih Metode Pembayaran</h2>
                <p>{selectedPlan.name} - {selectedPlan.price}</p>
              </div>
              <button className="payment-close-btn" onClick={() => setSelectedPlan(null)} type="button">x</button>
            </div>

            <div className="payment-method-grid">
              <button
                className={`payment-method-card ${paymentMethod === "CASH" ? "is-active" : ""}`}
                onClick={() => setPaymentMethod("CASH")}
                type="button"
              >
                <strong>CASH</strong>
                <span>Upload struk dan menunggu konfirmasi pengurus.</span>
              </button>
              <button
                className={`payment-method-card ${paymentMethod === "QRIS" ? "is-active" : ""}`}
                onClick={() => setPaymentMethod("QRIS")}
                type="button"
              >
                <strong>QRIS</strong>
                <span>Status pembayaran diproses otomatis.</span>
              </button>
            </div>

            <div className="payment-modal-actions">
              <button className="payment-cancel-btn" onClick={() => setSelectedPlan(null)} type="button">
                Batal
              </button>
              <button
                className="payment-submit-btn"
                disabled={payment.loadingPackageId === selectedPlan.id}
                onClick={handlePayment}
                type="button"
              >
                {payment.loadingPackageId === selectedPlan.id
                  ? "Memproses..."
                  : paymentMethod === "QRIS"
                    ? "Bayar QRIS"
                    : "Buat Transaksi Cash"}
              </button>
            </div>
          </section>
        </div>
      )}

      {isProofModalOpen && payment.pendingTransaction && (
        <div className="payment-modal-backdrop">
          <section className="payment-modal" role="dialog" aria-modal="true">
            <div className="payment-modal-head">
              <div>
                <h2>Upload Struk Pembayaran</h2>
                <p>ID transaksi: {payment.pendingTransaction.id}</p>
              </div>
              <button className="payment-close-btn" onClick={() => setIsProofModalOpen(false)} type="button">x</button>
            </div>

            <label className="proof-upload">
              <input accept="image/png,image/jpeg,application/pdf" onChange={handleProofUpload} type="file" />
              {proofFileName || "Klik untuk upload struk pembayaran"}
            </label>

            {proofMessage && <div className="membership-message success">{proofMessage}</div>}

            <div className="payment-modal-actions">
              <button className="payment-submit-btn" onClick={() => setIsProofModalOpen(false)} type="button">
                Selesai
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

export default function MembershipPackagesPage() {
  return (
    <MemberLayout active="Profile">
      <MembershipPackagesContent />
    </MemberLayout>
  );
}
