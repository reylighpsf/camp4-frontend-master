import AdminLayout from "../../../components/AdminLayout";
import usePaymentHistory from "./hooks/usePaymentHistory";
import {
  formatCurrency,
  formatDateTime,
  formatTransactionType,
  paymentStyles,
} from "./hooks/paymentHelpers";

export default function PaymentHistoryPage() {
  const history = usePaymentHistory();

  return (
    <AdminLayout title="Payment History" subtitle="Riwayat pembayaran yang sudah diproses.">
      <style>{paymentStyles}</style>

      <div className="payments-head">
        <div className="payments-head-main">
          <div>
            <h2>Riwayat Pembayaran</h2>
            <p>Pembayaran cash yang sudah diterima atau ditolak oleh pengurus.</p>
          </div>
        </div>
        <div className="payments-nav">
          <button className="payments-refresh" disabled={history.loading} onClick={history.fetchHistory} type="button">
            {history.loading ? "Memuat..." : "Refresh"}
          </button>
        </div>
      </div>

      {history.error && <div className="payments-alert error">{history.error}</div>}
      {history.actionMessage && <div className="payments-alert success">{history.actionMessage}</div>}

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
              <th>Diproses</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {history.loading && (
              <tr>
                <td className="payments-empty" colSpan="8">
                  Memuat riwayat transaksi...
                </td>
              </tr>
            )}

            {!history.loading && history.paymentHistory.length === 0 && (
              <tr>
                <td className="payments-empty" colSpan="8">
                  Belum ada riwayat transaksi.
                </td>
              </tr>
            )}

            {!history.loading && history.paymentHistory.map((item) => (
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
                  <span className={`payments-badge ${item.status === "SUCCESS" ? "success" : "failed"}`}>
                    {item.status}
                  </span>
                </td>
                <td>{formatDateTime(item.created_at)}</td>
                <td>{formatDateTime(item.confirmed_at)}</td>
                <td>
                  <div className="payments-actions">
                    <button
                      className="payments-action accept"
                      disabled={history.actionLoadingId === item.id}
                      onClick={() => history.viewDetails(item.id)}
                      type="button"
                    >
                      Detail
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {history.selectedTransaction && (
        <div className="payments-modal-backdrop">
          <section className="payments-modal" role="dialog" aria-modal="true" aria-labelledby="payment-detail-title">
            <div className="payments-modal-head">
              <div>
                <h3 id="payment-detail-title">Detail Transaksi</h3>
                <p>{history.selectedTransaction.order_id || history.selectedTransaction.id}</p>
              </div>
              <button
                className="payments-modal-close"
                onClick={() => history.setSelectedTransaction(null)}
                type="button"
                aria-label="Tutup detail transaksi"
              >
                x
              </button>
            </div>

            <dl className="payments-detail-list">
              <div><dt>Member</dt><dd>{history.selectedTransaction.full_name || "-"}</dd></div>
              <div><dt>Email</dt><dd>{history.selectedTransaction.email || "-"}</dd></div>
              <div><dt>Tipe Pembayaran</dt><dd>{formatTransactionType(history.selectedTransaction.transaction_type)}</dd></div>
              <div><dt>Metode</dt><dd>{history.selectedTransaction.payment_method || "-"}</dd></div>
              <div><dt>Status</dt><dd>{history.selectedTransaction.status || "-"}</dd></div>
              <div><dt>Total</dt><dd>{formatCurrency(history.selectedTransaction.amount)}</dd></div>
              <div><dt>Penalty</dt><dd>{formatCurrency(history.selectedTransaction.penalty_amount)}</dd></div>
              <div><dt>Dibuat</dt><dd>{formatDateTime(history.selectedTransaction.created_at)}</dd></div>
              <div><dt>Expired</dt><dd>{formatDateTime(history.selectedTransaction.expire_at)}</dd></div>
              <div><dt>Settled</dt><dd>{formatDateTime(history.selectedTransaction.settled_at)}</dd></div>
            </dl>

            <div className="payments-modal-actions">
              <button className="payments-action accept" onClick={() => history.setSelectedTransaction(null)} type="button">
                Tutup
              </button>
            </div>
          </section>
        </div>
      )}
    </AdminLayout>
  );
}
