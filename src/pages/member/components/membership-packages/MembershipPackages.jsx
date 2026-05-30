import { useCallback, useEffect, useMemo, useState } from "react";
import MemberLayout from "../../../../components/member/MemberLayout";
import api from "../../../../components/auth/authApi";
import useMembershipPayment from "./hooks/useMembershipPayment";

const packages = [
  {
    id: "daily",
    name: "Harian",
    price: "Rp 15.000",
    period: "1 hari",
    transactionType: "MEMBERSHIP_DAILY",
    available: true,
    benefits: ["Akses gym 1 hari", "Bebas alat cardio", "Check in QR"],
  },
  {
    id: "weekly",
    name: "Mingguan",
    price: "Belum tersedia",
    period: "7 hari",
    transactionType: "MEMBERSHIP_WEEKLY",
    available: false,
    benefits: ["Akses 7 hari", "Cocok untuk trial", "Butuh endpoint backend"],
  },
  {
    id: "monthly",
    name: "Bulanan",
    price: "Harga akun",
    period: "30 hari",
    transactionType: "MEMBERSHIP_MONTHLY",
    available: true,
    benefits: ["Akses gym 30 hari", "Harga mengikuti akun member", "Termasuk pembayaran penalty"],
  },
];

const formatDate = (value) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const getRemainingDays = (endDate) => {
  if (!endDate) return 0;
  const diffMs = new Date(endDate).getTime() - Date.now();
  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

const getPackageByMembershipType = (type) => {
  const normalizedType = String(type || "").toLowerCase();
  if (normalizedType === "daily") return packages.find((item) => item.id === "daily");
  if (normalizedType === "monthly") return packages.find((item) => item.id === "monthly");
  return null;
};

const isProfileMembershipActive = (profile) => {
  const status = String(profile?.membership_status || profile?.membership?.status || "").toLowerCase();
  return Boolean(profile?.active_membership) || status === "active" || status === "aktif";
};

export default function MembershipPackagesPage() {
  const payment = useMembershipPayment();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showPackages, setShowPackages] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [proofFileName, setProofFileName] = useState("");
  const [proofMessage, setProofMessage] = useState("");

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
    fetchProfile();
  }, [fetchProfile]);

  const activePackage = useMemo(
    () => (
      isProfileMembershipActive(profile)
        ? getPackageByMembershipType(profile.membership_type || profile.membership?.type)
        : null
    ),
    [profile],
  );

  const remainingDays = getRemainingDays(profile?.membership_end_date || profile?.membership?.end_date);

  const handleSubscribe = (item) => {
    if (!item.available) return;
    setSelectedPackage(item);
    setPaymentMethod("CASH");
    setProofFileName("");
    setProofMessage("");
  };

  const handlePayment = async () => {
    if (!selectedPackage) return;
    setProofFileName("");
    setProofMessage("");
    const result = await payment.createPayment({
      packageId: selectedPackage.id,
      transactionType: selectedPackage.transactionType,
      paymentMethod,
    });

    if (result.ok && paymentMethod === "CASH") {
      setSelectedPackage(null);
      setIsProofModalOpen(true);
    }
  };

  const handleClosePaymentModal = () => {
    setSelectedPackage(null);
  };

  const handleCloseProofModal = () => {
    setIsProofModalOpen(false);
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

  return (
    <MemberLayout active="Membership">
      <style>{`
        .membership-title {
          color: #0b0871;
          font-family: 'Anton', sans-serif;
          font-size: 34px;
          font-weight: 400;
          letter-spacing: 0;
          line-height: 1;
          margin: 0 0 8px;
        }

        .membership-subtitle {
          color: #292782;
          font-size: 14px;
          font-weight: 700;
          margin: 0 0 24px;
        }

        .package-grid {
          display: grid;
          gap: 18px;
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .active-membership-wrap {
          display: flex;
          justify-content: center;
          margin: 8px 0 26px;
        }

        .active-membership-card {
          background: #0b0871;
          border-radius: 14px;
          box-shadow: 0 18px 34px rgba(8,4,120,.22);
          color: #fff;
          display: grid;
          gap: 20px;
          max-width: 720px;
          overflow: hidden;
          padding: 28px;
          position: relative;
          width: min(720px, 100%);
        }

        .active-membership-card::after {
          background: rgba(255,255,255,.08);
          border-radius: 50%;
          content: "";
          height: 180px;
          position: absolute;
          right: -54px;
          top: -64px;
          width: 180px;
        }

        .active-membership-label {
          color: #ffdc7f;
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .active-membership-card h2 {
          color: #fff;
          font-size: 30px;
          font-weight: 900;
          margin: 0;
          position: relative;
          z-index: 1;
        }

        .active-membership-meta {
          display: grid;
          gap: 14px;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          position: relative;
          z-index: 1;
        }

        .active-membership-meta div {
          background: rgba(255,255,255,.16);
          border-radius: 8px;
          padding: 14px;
        }

        .active-membership-meta span {
          color: rgba(255,255,255,.78);
          display: block;
          font-size: 11px;
          font-weight: 800;
          margin-bottom: 7px;
          text-transform: uppercase;
        }

        .active-membership-meta strong {
          color: #fff;
          display: block;
          font-size: 18px;
          font-weight: 900;
        }

        .active-membership-action {
          justify-self: start;
          position: relative;
          z-index: 1;
        }

        .membership-loading {
          background: #f8f8fb;
          border-radius: 12px;
          color: #52558f;
          font-size: 13px;
          font-weight: 800;
          padding: 24px;
        }

        .package-card {
          background: #f8f8fb;
          border-radius: 12px;
          box-shadow: 0 14px 28px rgba(8,4,120,.12);
          display: grid;
          gap: 18px;
          min-height: 360px;
          padding: 24px;
        }

        .package-card.is-featured {
          border: 2px solid #ff7a00;
        }

        .package-card.is-disabled {
          opacity: .72;
        }

        .package-card h2 {
          color: #0b0871;
          font-size: 22px;
          font-weight: 900;
          margin: 0;
        }

        .package-price {
          color: #ff7a00;
          font-size: 28px;
          font-weight: 900;
          line-height: 1;
        }

        .package-period {
          color: #52558f;
          display: block;
          font-size: 12px;
          font-weight: 800;
          margin-top: 6px;
        }

        .package-benefits {
          display: grid;
          gap: 10px;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .package-benefits li {
          color: #292782;
          font-size: 13px;
          font-weight: 700;
        }

        .package-benefits li::before {
          color: #ff7a00;
          content: "✓";
          font-weight: 900;
          margin-right: 8px;
        }

        .package-button {
          align-self: end;
          background: #0b0871;
          border: 0;
          border-radius: 8px;
          color: #fff;
          cursor: pointer;
          font: inherit;
          font-size: 13px;
          font-weight: 900;
          height: 44px;
          width: 100%;
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
          box-shadow: 0 24px 80px rgba(0,0,0,.28);
          padding: 24px;
          width: min(100%, 520px);
        }

        .proof-modal {
          width: min(100%, 560px);
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
          background: #fff;
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
          box-shadow: 0 10px 24px rgba(255,122,0,.16);
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

        .payment-cancel-btn {
          background: #fff;
          border: 1px solid #0b0871;
          border-radius: 8px;
          color: #0b0871;
          cursor: pointer;
          font: inherit;
          font-size: 13px;
          font-weight: 900;
          height: 42px;
          padding: 0 18px;
        }

        .package-button:disabled {
          cursor: not-allowed;
          opacity: .58;
        }

        .membership-message {
          border-radius: 8px;
          font-size: 13px;
          font-weight: 800;
          margin-bottom: 18px;
          padding: 12px 14px;
        }

        .membership-message.error {
          background: #fff1f0;
          color: #c73822;
        }

        .membership-message.success {
          background: #edfdf3;
          color: #16794c;
        }

        .proof-panel {
          background: #f8f8fb;
          border-radius: 12px;
          box-shadow: 0 14px 28px rgba(8,4,120,.12);
          margin-bottom: 24px;
          padding: 20px 22px;
        }

        .proof-panel h2 {
          color: #0b0871;
          font-size: 18px;
          font-weight: 900;
          margin: 0 0 6px;
        }

        .proof-panel p {
          color: #52558f;
          font-size: 12px;
          font-weight: 700;
          margin: 0 0 14px;
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

        @media (max-width: 1040px) {
          .package-grid {
            grid-template-columns: 1fr;
          }

          .active-membership-meta {
            grid-template-columns: 1fr;
          }

          .payment-method-grid,
          .payment-modal-actions {
            grid-template-columns: 1fr;
          }

          .payment-modal-actions {
            flex-direction: column;
          }

          .payment-cancel-btn,
          .package-button {
            width: 100%;
          }
        }

      `}</style>

      <h1 className="membership-title">Paket Gym</h1>
      <p className="membership-subtitle">Pilih paket membership dan lanjutkan langsung ke pembayaran.</p>

      {payment.error && <div className="membership-message error">{payment.error}</div>}
      {payment.successMessage && <div className="membership-message success">{payment.successMessage}</div>}
      {proofMessage && <div className="membership-message success">{proofMessage}</div>}

      {profileLoading && <div className="membership-loading">Memuat status membership...</div>}

      {!profileLoading && activePackage && (
        <div className="active-membership-wrap">
          <section className="active-membership-card">
            <span className="active-membership-label">Membership Aktif</span>
            <h2>{activePackage.name}</h2>
            <div className="active-membership-meta">
              <div>
                <span>Paket</span>
                <strong>{activePackage.period}</strong>
              </div>
              <div>
                <span>Sisa Waktu</span>
                <strong>{remainingDays} hari</strong>
              </div>
              <div>
                <span>Berakhir</span>
                <strong>{formatDate(profile?.membership_end_date || profile?.membership?.end_date)}</strong>
              </div>
            </div>
            <button
              className="package-button active-membership-action"
              onClick={() => setShowPackages((value) => !value)}
              type="button"
            >
              {showPackages ? "Tutup Paket" : "Tambah / Ganti Membership"}
            </button>
          </section>
        </div>
      )}

      {!profileLoading && (!activePackage || showPackages) && (
        <section className="package-grid">
          {packages.map((item) => (
            <article
              className={`package-card ${item.id === "monthly" ? "is-featured" : ""} ${!item.available ? "is-disabled" : ""}`}
              key={item.id}
            >
              <div>
                <h2>{item.name}</h2>
                <div className="package-price">
                  {item.price}
                  <span className="package-period">{item.period}</span>
                </div>
              </div>

              <ul className="package-benefits">
                {item.benefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>

              <button
                className="package-button"
                disabled={!item.available || payment.loadingPackageId === item.id}
                onClick={() => handleSubscribe(item)}
                type="button"
              >
                {!item.available
                  ? "Belum Tersedia"
                  : "Berlangganan"}
              </button>
            </article>
          ))}
        </section>
      )}

      {selectedPackage && (
        <div className="payment-modal-backdrop">
          <section className="payment-modal" role="dialog" aria-modal="true">
            <div className="payment-modal-head">
              <div>
                <h2>Pilih Metode Pembayaran</h2>
                <p>{selectedPackage.name} - {selectedPackage.price}</p>
              </div>
              <button className="payment-close-btn" onClick={handleClosePaymentModal} type="button">x</button>
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
                <span>status diproses otomatis.</span>
              </button>
            </div>

            <div className="payment-modal-actions">
              <button className="payment-cancel-btn" onClick={handleClosePaymentModal} type="button">
                Batal
              </button>
              <button
                className="package-button"
                disabled={payment.loadingPackageId === selectedPackage.id}
                onClick={handlePayment}
                type="button"
              >
                {payment.loadingPackageId === selectedPackage.id
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
          <section className="payment-modal proof-modal" role="dialog" aria-modal="true">
            <div className="payment-modal-head">
              <div>
                <h2>Upload Struk Pembayaran</h2>
                <p>ID transaksi: {payment.pendingTransaction.id}</p>
              </div>
              <button className="payment-close-btn" onClick={handleCloseProofModal} type="button">x</button>
            </div>

            <label className="proof-upload">
              <input accept="image/png,image/jpeg,application/pdf" onChange={handleProofUpload} type="file" />
              {proofFileName || "Klik untuk upload struk pembayaran"}
            </label>

            {proofMessage && <div className="membership-message success">{proofMessage}</div>}

            <div className="payment-modal-actions">
              <button className="package-button" onClick={handleCloseProofModal} type="button">
                Selesai
              </button>
            </div>
          </section>
        </div>
      )}
    </MemberLayout>
  );
}
