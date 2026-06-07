import AdminLayout from "../../../../components/admin/AdminLayout";
import usePayments from "./hooks/usePayments";
import {
  formatCurrency,
  formatDateTime,
  formatTransactionType,
  paymentStyles,
} from "./paymentHelpers";

export default function PaymentsPage() {
  const payments = usePayments();

  const handleConfirm = async (item, status) => {
    const actionText = status === "SUCCESS" ? "menerima" : "menolak";
    if (!window.confirm(`Yakin ingin ${actionText} pembayaran dari ${item.full_name || "member ini"}?`)) return;

    const result = await payments.confirmPayment({ transactionId: item.id, status });
    if (result.ok) {
      payments.fetchPayments();
    }
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
        <div className="payments-head-main">
          <div>
            <h2>Daftar Pembayaran Cash</h2>
            <p>Konfirmasi pembayaran member berdasarkan struk yang diupload.</p>
          </div>
        </div>
        <div className="payments-nav">
          <button
            className="payments-refresh"
            disabled={payments.listLoading}
            onClick={payments.fetchPayments}
            type="button"
          >
            {payments.listLoading ? "Memuat..." : "Refresh"}
          </button>
        </div>
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
