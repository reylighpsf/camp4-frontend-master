import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import MemberLayout from "../../../../components/member/MemberLayout";
import MemberIcon from "../../../../components/member/MemberIcon";
import api from "../../../../components/auth/authApi";
import { authMembershipPlans, getAuthMembershipPlan } from "../../../auth/membership/hooks/authPlans";

const tabs = [
  { label: "Account Settings", icon: "profile", to: "/member/profile" },
  { label: "Membership Plan", icon: "check", active: true, to: "/member/profile/membership" },
  { label: "Security", icon: "check" },
  { label: "Notifications", icon: "bell" },
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

const formatDateTime = (value) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const formatTransactionType = (value) =>
  String(value || "-")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

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

const getActiveMembershipSnapshot = (transactions, catalogPlans) => {
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
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [error, setError] = useState("");
  const [registrationPlanId, setRegistrationPlanId] = useState("");

  const fetchTransactions = async () => {
    setTransactionsLoading(true);
    try {
      const response = await api.get("/transactions/history", {
        params: { page: 1, limit: 20 },
      });
      setTransactions(response.data?.data || []);
    } catch (err) {
      setError(getErrorMessage(err, "Gagal memuat riwayat transaksi."));
      setTransactions([]);
    } finally {
      setTransactionsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const [profileResult, catalogResult] = await Promise.allSettled([
          api.get("/users/me"),
          api.get("/catalogs"),
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
    () => getActiveMembershipSnapshot(transactions, catalogPlans),
    [catalogPlans, transactions],
  );
  const currentPlanId = getProfilePlanId(profile, registrationPlanId);
  const fallbackPlan = useMemo(() => getAuthMembershipPlan(currentPlanId), [currentPlanId]);
  const currentPlan = useMemo(() => {
    if (!membershipSnapshot?.catalog) return fallbackPlan;
    const price = membershipSnapshot.catalog.prices?.[0]?.price || membershipSnapshot.transaction?.amount || 0;
    return {
      description: membershipSnapshot.catalog.description || fallbackPlan.description,
      id: membershipSnapshot.catalog.code,
      name: membershipSnapshot.catalog.name,
      period: membershipSnapshot.catalog.duration_days ? `${membershipSnapshot.catalog.duration_days} hari` : fallbackPlan.period,
      price: formatCurrency(price),
    };
  }, [fallbackPlan, membershipSnapshot]);
  const status = membershipSnapshot?.status || getMembershipStatus(profile);
  const startDate = formatDate(
    membershipSnapshot?.start || profile?.membership_start_date || profile?.membership?.start_date || profile?.created_at,
  );
  const endDate = formatDate(membershipSnapshot?.end || profile?.membership_end_date || profile?.membership?.end_date);
  const availablePlans = useMemo(() => {
    if (catalogPlans.length === 0) {
      return authMembershipPlans.map((plan) => ({
        ...plan,
        prices: [{ tierCode: "DEFAULT", tierName: "Harga", price: plan.price }],
      }));
    }

    return catalogPlans.map((item) => {
      const price = item.prices?.[0]?.price || 0;
      return {
        benefits: [
          item.duration_days ? `${item.duration_days} hari akses gym` : "Akses gym sesuai katalog",
          "Harga mengikuti tier akun",
          item.is_active ? "Status aktif" : "Tidak aktif",
        ],
        description: item.description || "Membership plan dari katalog backend.",
        id: item.code,
        name: item.name,
        period: item.duration_days ? `${item.duration_days} hari` : "plan",
        price: formatCurrency(price),
        prices: (item.prices || []).map((priceItem) => ({
          price: formatCurrency(priceItem.price),
          tierCode: priceItem.tier_code,
          tierName: priceItem.tier_name || formatTierName(priceItem.tier_code),
        })),
      };
    });
  }, [catalogPlans]);

  const viewTransactionDetails = async (transactionId) => {
    setActionLoadingId(transactionId);
    setError("");
    try {
      const response = await api.get(`/transactions/${transactionId}`);
      setSelectedTransaction(response.data?.data || null);
    } catch (err) {
      setError(getErrorMessage(err, "Gagal memuat detail transaksi."));
    } finally {
      setActionLoadingId("");
    }
  };

  const cancelTransaction = async (transaction) => {
    if (!window.confirm(`Batalkan transaksi ${transaction.order_id || transaction.id}?`)) return;

    setActionLoadingId(transaction.id);
    setError("");
    try {
      const response = await api.post(`/transactions/${transaction.id}/cancel`);
      setSelectedTransaction(response.data?.data || null);
      await fetchTransactions();
    } catch (err) {
      setError(getErrorMessage(err, "Gagal membatalkan transaksi."));
    } finally {
      setActionLoadingId("");
    }
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
          display: flex;
          flex-direction: column;
          min-height: 310px;
          padding: 22px;
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

        .profile-transaction-panel {
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 14px 28px rgba(8, 4, 120, .08);
          padding: 22px;
        }

        .profile-transaction-head {
          align-items: center;
          display: flex;
          gap: 14px;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .profile-transaction-head h2 {
          color: #0b0871;
          font-size: 18px;
          font-weight: 900;
          margin: 0;
        }

        .profile-transaction-table-wrap {
          overflow-x: auto;
        }

        .profile-transaction-table {
          border-collapse: collapse;
          min-width: 760px;
          width: 100%;
        }

        .profile-transaction-table th {
          background: #f0f1f5;
          color: #30333d;
          font-size: 11px;
          padding: 12px;
          text-align: left;
          text-transform: uppercase;
        }

        .profile-transaction-table td {
          border-bottom: 1px solid #eceef3;
          color: #0b0871;
          font-size: 12px;
          font-weight: 800;
          padding: 12px;
        }

        .profile-transaction-badge {
          border-radius: 999px;
          display: inline-flex;
          font-size: 10px;
          font-weight: 900;
          padding: 5px 9px;
          text-transform: uppercase;
        }

        .profile-transaction-badge.pending {
          background: #fff4d8;
          color: #9a5a00;
        }

        .profile-transaction-badge.success {
          background: #edfdf3;
          color: #16794c;
        }

        .profile-transaction-badge.failed {
          background: #fff1f0;
          color: #c73822;
        }

        .profile-transaction-actions {
          display: flex;
          gap: 8px;
        }

        .profile-transaction-btn {
          border-radius: 8px;
          cursor: pointer;
          font: inherit;
          font-size: 11px;
          font-weight: 900;
          min-height: 32px;
          padding: 0 10px;
        }

        .profile-transaction-btn.detail {
          background: #0b0871;
          border: 1px solid #0b0871;
          color: #fff;
        }

        .profile-transaction-btn.cancel {
          background: #fff;
          border: 1px solid #c73822;
          color: #c73822;
        }

        .profile-transaction-btn:disabled {
          cursor: not-allowed;
          opacity: .62;
        }

        .profile-transaction-detail {
          background: #f7f8fb;
          border-radius: 8px;
          display: grid;
          gap: 8px;
          margin-bottom: 14px;
          padding: 14px;
        }

        .profile-transaction-detail strong {
          color: #0b0871;
          font-size: 13px;
        }

        .profile-transaction-detail span {
          color: #565a91;
          font-size: 12px;
          font-weight: 800;
        }

        @media (max-width: 1040px) {
          .profile-plan-hero,
          .profile-plan-stats,
          .profile-plan-grid {
            grid-template-columns: 1fr;
          }

          .profile-plan-price {
            text-align: left;
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

        <section className="profile-plan-hero">
          <div>
            <span className="profile-plan-label">Current Membership</span>
            <h2>{currentPlan.name}</h2>
            <p>{currentPlan.description}</p>
          </div>
          <div className="profile-plan-price">
            {currentPlan.price}
            <span>/ {currentPlan.period}</span>
          </div>
        </section>

        <section className="profile-plan-stats" aria-label="Membership details">
          <div className="profile-plan-stat">
            <span>Status</span>
            <strong>{status}</strong>
          </div>
          <div className="profile-plan-stat">
            <span>Start Date</span>
            <strong>{startDate}</strong>
          </div>
          <div className="profile-plan-stat">
            <span>Active Until</span>
            <strong>{endDate}</strong>
          </div>
        </section>

        <section className="profile-plan-grid" aria-label="Available membership plans">
          {availablePlans.map((plan) => (
            <article className={`profile-plan-card ${plan.id === currentPlan.id ? "is-active" : ""}`} key={plan.id}>
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
            </article>
          ))}
        </section>

        <section className="profile-transaction-panel">
          <div className="profile-transaction-head">
            <h2>Payment History</h2>
            <button className="profile-transaction-btn detail" disabled={transactionsLoading} onClick={fetchTransactions} type="button">
              {transactionsLoading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {selectedTransaction && (
            <div className="profile-transaction-detail">
              <strong>{selectedTransaction.order_id || selectedTransaction.id}</strong>
              <span>{formatTransactionType(selectedTransaction.transaction_type)} - {selectedTransaction.status}</span>
              <span>{formatCurrency(selectedTransaction.amount)} via {selectedTransaction.payment_method || "-"}</span>
            </div>
          )}

          <div className="profile-transaction-table-wrap">
            <table className="profile-transaction-table">
              <thead>
                <tr>
                  <th>Tipe</th>
                  <th>Metode</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Dibuat</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {transactionsLoading && (
                  <tr>
                    <td colSpan="6">Memuat riwayat transaksi...</td>
                  </tr>
                )}
                {!transactionsLoading && transactions.length === 0 && (
                  <tr>
                    <td colSpan="6">Belum ada transaksi.</td>
                  </tr>
                )}
                {!transactionsLoading && transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{formatTransactionType(transaction.transaction_type)}</td>
                    <td>{transaction.payment_method || "-"}</td>
                    <td>{formatCurrency(transaction.amount)}</td>
                    <td>
                      <span className={`profile-transaction-badge ${String(transaction.status || "").toLowerCase()}`}>
                        {transaction.status || "-"}
                      </span>
                    </td>
                    <td>{formatDateTime(transaction.created_at)}</td>
                    <td>
                      <div className="profile-transaction-actions">
                        <button
                          className="profile-transaction-btn detail"
                          disabled={actionLoadingId === transaction.id}
                          onClick={() => viewTransactionDetails(transaction.id)}
                          type="button"
                        >
                          Detail
                        </button>
                        {transaction.status === "PENDING" && (
                          <button
                            className="profile-transaction-btn cancel"
                            disabled={actionLoadingId === transaction.id}
                            onClick={() => cancelTransaction(transaction)}
                            type="button"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </MemberLayout>
  );
}
