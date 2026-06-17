import AdminLayout from "@/features/admin/components/AdminLayout";
import usePayments from "@/features/admin/pages/components/payments/hooks/usePayments";
import {
  formatCurrency,
  formatDateTime,
  formatTransactionType,
  paymentStyles,
} from "@/features/admin/pages/components/payments/hooks/paymentHelpers";
import { confirmAction } from "@/utils/sweetAlert";

export default function PaymentsPage() {
  const payments = usePayments();

  const handleConfirm = async (item, status) => {
    const actionText = status === "SUCCESS" ? "menerima" : "menolak";
    const confirmed = await confirmAction({
      confirmButtonColor: status === "SUCCESS" ? "#08a84f" : "#c73822",
      confirmButtonText: status === "SUCCESS" ? "Terima" : "Tolak",
      text: `Pembayaran dari ${item.full_name || "member ini"} akan ${actionText}.`,
      title: `${status === "SUCCESS" ? "Terima" : "Tolak"} Pembayaran?`,
    });
    if (!confirmed) return;

    const result = await payments.confirmPayment({ transactionId: item.id, status });
    if (result.ok) {
      payments.fetchPayments();
    }
  };

  const handleCancel = async (item) => {
    const confirmed = await confirmAction({
      confirmButtonColor: "#c73822",
      confirmButtonText: "Cancel",
      text: `Transaksi ${item.order_id || item.id} akan dibatalkan.`,
      title: "Cancel Transaksi?",
    });
    if (!confirmed) return;

    const result = await payments.cancelPayment(item.id);
    if (result.ok) {
      payments.fetchPayments();
    }
  };

  return (
    <AdminLayout title="Transaksi yang sedang diproses" subtitle="Pantau transaksi pending member dan transaksi gym.">
      <style>{paymentStyles}</style>

      <div className="payments-head">
        <div className="payments-head-main">
          <div>
            <h2>Transaksi yang sedang diproses</h2>
            <p>Menampilkan pembayaran cash dan QRIS/VA yang masih menunggu penyelesaian.</p>
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
              <th>Dibuat</th>
              <th>Expired</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {payments.listLoading && (
              <tr>
                <td className="payments-table-status" colSpan="8">
                  Memuat data pembayaran...
                </td>
              </tr>
            )}

            {!payments.listLoading && payments.listError && (
              <tr>
                <td className="payments-table-status error" colSpan="8">
                  {payments.listError}
                </td>
              </tr>
            )}

            {!payments.listLoading && !payments.listError && payments.payments.length === 0 && (
              <tr>
                <td className="payments-empty" colSpan="8">
                  Belum ada transaksi yang sedang diproses.
                </td>
              </tr>
            )}

            {!payments.listLoading &&
              !payments.listError &&
              payments.payments.map((item) => (
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
                    <td>{formatDateTime(item.created_at)}</td>
                    <td>{formatDateTime(item.expire_at)}</td>
                    <td>
                      <div className="payments-actions">
                        {item.payment_method === "CASH" ? (
                          <>
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
                          </>
                        ) : null}
                        <button
                          className="payments-action reject"
                          disabled={payments.actionLoadingId === item.id}
                          onClick={() => handleCancel(item)}
                          type="button"
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
              ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
