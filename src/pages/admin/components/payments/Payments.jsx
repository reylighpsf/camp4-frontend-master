import AdminLayout from "../../../../components/admin/AdminLayout";
import usePayments from "./hooks/usePayments";

const paymentStyles = `
  .payments-head {
    align-items: center;
    display: flex;
    justify-content: space-between;
    gap: 18px;
    margin-bottom: 22px;
  }

  .payments-head h2 {
    font-size: 20px;
    margin: 0 0 6px;
  }

  .payments-head p,
  .payments-muted {
    color: #6b7280;
    font-size: 13px;
    margin: 0;
  }

  .payments-refresh {
    background: #11131d;
    border: 1px solid #11131d;
    border-radius: 8px;
    color: #fff;
    cursor: pointer;
    font: inherit;
    font-size: 12px;
    font-weight: 800;
    height: 40px;
    padding: 0 16px;
    text-transform: uppercase;
  }

  .payments-refresh:disabled,
  .payments-action:disabled {
    cursor: not-allowed;
    opacity: 0.62;
  }

  .payments-alert {
    border-radius: 8px;
    font-size: 13px;
    margin-bottom: 16px;
    padding: 12px 14px;
  }

  .payments-alert.error {
    background: #fff1f0;
    color: #c73822;
  }

  .payments-alert.success {
    background: #edfdf3;
    color: #16794c;
  }

  .payments-table-wrap {
    overflow-x: auto;
  }

  .payments-table {
    border-collapse: collapse;
    min-width: 980px;
    width: 100%;
  }

  .payments-table th {
    background: #f0f1f5;
    color: #30333d;
    font-size: 11px;
    padding: 14px;
    text-align: left;
    text-transform: uppercase;
  }

  .payments-table td {
    border-bottom: 1px solid #eceef3;
    font-size: 13px;
    padding: 14px;
    vertical-align: middle;
  }

  .payments-member strong {
    display: block;
    margin-bottom: 4px;
  }

  .payments-badge {
    border-radius: 999px;
    display: inline-flex;
    font-size: 11px;
    font-weight: 800;
    padding: 6px 10px;
    text-transform: uppercase;
  }

  .payments-badge.pending {
    background: #fff4d8;
    color: #9a5a00;
  }

  .payments-method {
    background: #eef2ff;
    color: #080478;
  }

  .payments-proof {
    color: #16794c;
    font-size: 12px;
    font-weight: 800;
  }

  .payments-actions {
    display: flex;
    gap: 8px;
  }

  .payments-action {
    border-radius: 8px;
    cursor: pointer;
    font: inherit;
    font-size: 12px;
    font-weight: 800;
    height: 34px;
    padding: 0 12px;
    text-transform: uppercase;
  }

  .payments-action.accept {
    background: #16794c;
    border: 1px solid #16794c;
    color: #fff;
  }

  .payments-action.reject {
    background: #fff;
    border: 1px solid #c73822;
    color: #c73822;
  }

  .payments-table-status,
  .payments-empty {
    color: #6b7280;
    padding: 28px;
    text-align: center;
  }

  .payments-table-status.error {
    color: #c73822;
  }

  @media (max-width: 680px) {
    .payments-head {
      align-items: stretch;
      flex-direction: column;
    }

    .payments-refresh {
      width: 100%;
    }
  }
`;

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

export default function PaymentsPage() {
  const payments = usePayments();

  const handleConfirm = async (item, status) => {
    const actionText = status === "SUCCESS" ? "menerima" : "menolak";
    if (!window.confirm(`Yakin ingin ${actionText} pembayaran dari ${item.full_name || "member ini"}?`)) return;

    const result = await payments.confirmPayment({ transactionId: item.id, status });
    if (result.ok) payments.fetchPayments();
  };

  const getProof = (transactionId) => {
    try {
      return JSON.parse(localStorage.getItem(`vocafit-payment-proof-${transactionId}`) || "null");
    } catch {
      return null;
    }
  };

  return (
    <AdminLayout title="Payments" subtitle="Kelola pembayaran member dan transaksi gym.">
      <style>{paymentStyles}</style>

      <div className="payments-head">
        <div>
          <h2>Daftar Pembayaran Cash</h2>
          <p>Konfirmasi pembayaran member berdasarkan struk yang diupload.</p>
        </div>
        <button
          className="payments-refresh"
          disabled={payments.listLoading}
          onClick={payments.fetchPayments}
          type="button"
        >
          {payments.listLoading ? "Memuat..." : "Refresh"}
        </button>
      </div>

      {payments.actionError && <div className="payments-alert error">{payments.actionError}</div>}
      {payments.actionSuccessMessage && <div className="payments-alert success">{payments.actionSuccessMessage}</div>}

      <div className="payments-table-wrap">
        <table className="payments-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Tipe Pembayaran</th>
              <th>Metode</th>
              <th>Total</th>
              <th>Status</th>
              <th>Struk</th>
              <th>Dibuat</th>
              <th>Expired</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {payments.listLoading && (
              <tr>
                <td className="payments-table-status" colSpan="9">
                  Memuat data pembayaran...
                </td>
              </tr>
            )}

            {!payments.listLoading && payments.listError && (
              <tr>
                <td className="payments-table-status error" colSpan="9">
                  {payments.listError}
                </td>
              </tr>
            )}

            {!payments.listLoading && !payments.listError && payments.payments.length === 0 && (
              <tr>
                <td className="payments-empty" colSpan="9">
                  Belum ada pembayaran cash yang menunggu konfirmasi.
                </td>
              </tr>
            )}

            {!payments.listLoading &&
              !payments.listError &&
              payments.payments.map((item) => {
                const proof = getProof(item.id);
                return (
                  <tr key={item.id}>
                    <td className="payments-member">
                      <strong>{item.full_name || "-"}</strong>
                      <span className="payments-muted">{item.email || "-"}</span>
                    </td>
                    <td>{formatTransactionType(item.transaction_type)}</td>
                    <td>
                      <span className="payments-badge payments-method">{item.payment_method || "-"}</span>
                    </td>
                    <td>{formatCurrency(item.amount)}</td>
                    <td>
                      <span className="payments-badge pending">{item.status || "PENDING"}</span>
                    </td>
                    <td className="payments-proof">{proof?.fileName || "Belum upload"}</td>
                    <td>{formatDateTime(item.created_at)}</td>
                    <td>{formatDateTime(item.expire_at)}</td>
                    <td>
                      <div className="payments-actions">
                        <button
                          className="payments-action accept"
                          disabled={payments.actionLoadingId === item.id}
                          onClick={() => handleConfirm(item, "SUCCESS")}
                          type="button"
                        >
                          {payments.actionLoadingId === item.id ? "..." : "Terima"}
                        </button>
                        <button
                          className="payments-action reject"
                          disabled={payments.actionLoadingId === item.id}
                          onClick={() => handleConfirm(item, "FAILED")}
                          type="button"
                        >
                          Tolak
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
