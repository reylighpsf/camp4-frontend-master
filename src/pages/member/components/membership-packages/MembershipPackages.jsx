import { useState } from "react";
import MemberLayout from "../../../../components/member/MemberLayout";
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

export default function MembershipPackagesPage() {
  const payment = useMembershipPayment();
  const [paymentMethod, setPaymentMethod] = useState("QRIS");
  const [proofFileName, setProofFileName] = useState("");
  const [proofMessage, setProofMessage] = useState("");

  const handlePayment = (item) => {
    if (!item.available) return;
    setProofFileName("");
    setProofMessage("");
    payment.createPayment({
      packageId: item.id,
      transactionType: item.transactionType,
      paymentMethod,
    });
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

        .payment-method-panel {
          align-items: center;
          background: #f8f8fb;
          border-radius: 12px;
          box-shadow: 0 14px 28px rgba(8,4,120,.12);
          display: flex;
          gap: 16px;
          justify-content: space-between;
          margin-bottom: 24px;
          padding: 18px 22px;
        }

        .payment-method-panel h2 {
          color: #0b0871;
          font-size: 18px;
          font-weight: 900;
          margin: 0 0 4px;
        }

        .payment-method-panel p {
          color: #52558f;
          font-size: 12px;
          font-weight: 700;
          margin: 0;
        }

        .method-toggle {
          background: #e4e4ef;
          border-radius: 999px;
          display: inline-flex;
          padding: 5px;
        }

        .method-toggle button {
          background: transparent;
          border: 0;
          border-radius: 999px;
          color: #0b0871;
          cursor: pointer;
          font: inherit;
          font-size: 12px;
          font-weight: 900;
          height: 34px;
          min-width: 72px;
          padding: 0 14px;
        }

        .method-toggle button.is-active {
          background: #0b0871;
          color: #fff;
        }

        .package-grid {
          display: grid;
          gap: 18px;
          grid-template-columns: repeat(3, minmax(0, 1fr));
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
        }

        @media (max-width: 680px) {
          .payment-method-panel {
            align-items: stretch;
            flex-direction: column;
          }

          .method-toggle {
            width: 100%;
          }

          .method-toggle button {
            flex: 1;
          }
        }
      `}</style>

      <h1 className="membership-title">Paket Gym</h1>
      <p className="membership-subtitle">Pilih paket membership dan lanjutkan langsung ke pembayaran.</p>

      <section className="payment-method-panel">
        <div>
          <h2>Metode Pembayaran</h2>
          <p>QRIS diproses otomatis oleh Midtrans. CASH perlu upload struk dan konfirmasi pengurus.</p>
        </div>
        <div className="method-toggle" aria-label="Metode pembayaran">
          {["QRIS", "CASH"].map((method) => (
            <button
              className={paymentMethod === method ? "is-active" : ""}
              key={method}
              onClick={() => setPaymentMethod(method)}
              type="button"
            >
              {method}
            </button>
          ))}
        </div>
      </section>

      {payment.error && <div className="membership-message error">{payment.error}</div>}
      {payment.successMessage && <div className="membership-message success">{payment.successMessage}</div>}
      {proofMessage && <div className="membership-message success">{proofMessage}</div>}

      {paymentMethod === "CASH" && payment.pendingTransaction && (
        <section className="proof-panel">
          <h2>Upload Struk Pembayaran</h2>
          <p>
            ID transaksi: {payment.pendingTransaction.id}. Upload bukti pembayaran agar pengurus dapat melakukan konfirmasi.
          </p>
          <label className="proof-upload">
            <input accept="image/png,image/jpeg,application/pdf" onChange={handleProofUpload} type="file" />
            {proofFileName || "Klik untuk upload struk pembayaran"}
          </label>
        </section>
      )}

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
              onClick={() => handlePayment(item)}
              type="button"
            >
              {!item.available
                ? "Belum Tersedia"
                : payment.loadingPackageId === item.id
                  ? "Memproses..."
                  : paymentMethod === "QRIS"
                    ? "Bayar QRIS"
                    : "Buat Transaksi Cash"}
            </button>
          </article>
        ))}
      </section>
    </MemberLayout>
  );
}
