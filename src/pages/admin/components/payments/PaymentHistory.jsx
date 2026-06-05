import { useEffect, useState } from "react";
import { Link } from "react-router";
import AdminLayout from "../../../../components/admin/AdminLayout";
import api from "../../../../components/auth/authApi";
import {
  formatCurrency,
  formatDateTime,
  formatTransactionType,
  enrichTransactionMembers,
  paymentStyles,
} from "./paymentHelpers";

const getErrorMessage = (err, fallback) =>
  err.response?.data?.error || err.response?.data?.message || err.message || fallback;

export default function PaymentHistoryPage() {
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const fetchHistory = async () => {
    setLoading(true);
    setError("");
    try {
      const [historyResponse, usersResponse] = await Promise.all([
        api.get("/transactions/history", {
          params: { page: 1, limit: 100 },
        }),
        api.get("/admin/users"),
      ]);
      setPaymentHistory(enrichTransactionMembers(historyResponse.data?.data || [], usersResponse.data?.data || []));
    } catch (err) {
      setError(getErrorMessage(err, "Gagal memuat riwayat transaksi."));
      setPaymentHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(fetchHistory, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  const viewDetails = async (transactionId) => {
    setActionLoadingId(transactionId);
    setActionMessage("");
    setError("");
    try {
      const response = await api.get(`/transactions/${transactionId}`);
      const transaction = response.data?.data || null;
      const matched = paymentHistory.find((item) => item.id === transaction?.id);
      setSelectedTransaction(
        transaction
          ? {
              ...transaction,
              email: transaction.email || matched?.email || "",
              full_name: transaction.full_name || matched?.full_name || "",
            }
          : null,
      );
    } catch (err) {
      setError(getErrorMessage(err, "Gagal memuat detail transaksi."));
    } finally {
      setActionLoadingId("");
    }
  };

  const cancelTransaction = async (transaction) => {
    if (!window.confirm(`Batalkan transaksi ${transaction.order_id || transaction.id}?`)) return;

    setActionLoadingId(transaction.id);
    setActionMessage("");
    setError("");
    try {
      const response = await api.post(`/transactions/${transaction.id}/cancel`);
      setSelectedTransaction(response.data?.data || null);
      setActionMessage("Transaksi berhasil dibatalkan.");
      await fetchHistory();
    } catch (err) {
      setError(getErrorMessage(err, "Gagal membatalkan transaksi."));
    } finally {
      setActionLoadingId("");
    }
  };

  return (
    <AdminLayout title="Payment History" subtitle="Riwayat pembayaran yang sudah diproses.">
      <style>{paymentStyles}</style>

      <div className="payments-head">
        <div className="payments-head-main">
          <div>
            <h2>Riwayat Pembayaran</h2>
            <p>Pembayaran cash yang sudah diterima atau ditolak oleh pengurus.</p>
          </div>
          <Link className="payments-link secondary" to="/admin/payments">
            Pending Cash
          </Link>
        </div>
        <div className="payments-nav">
          <button className="payments-refresh" disabled={loading} onClick={fetchHistory} type="button">
            {loading ? "Memuat..." : "Refresh"}
          </button>
        </div>
      </div>

      {error && <div className="payments-alert error">{error}</div>}
      {actionMessage && <div className="payments-alert success">{actionMessage}</div>}

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
            {loading && (
              <tr>
                <td className="payments-empty" colSpan="8">
                  Memuat riwayat transaksi...
                </td>
              </tr>
            )}

            {!loading && paymentHistory.length === 0 && (
              <tr>
                <td className="payments-empty" colSpan="8">
                  Belum ada riwayat transaksi.
                </td>
              </tr>
            )}

            {!loading && paymentHistory.map((item) => (
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
                      disabled={actionLoadingId === item.id}
                      onClick={() => viewDetails(item.id)}
                      type="button"
                    >
                      Detail
                    </button>
                    {item.status === "PENDING" && (
                      <button
                        className="payments-action reject"
                        disabled={actionLoadingId === item.id}
                        onClick={() => cancelTransaction(item)}
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

      {selectedTransaction && (
        <div className="payments-modal-backdrop">
          <section className="payments-modal" role="dialog" aria-modal="true" aria-labelledby="payment-detail-title">
            <div className="payments-modal-head">
              <div>
                <h3 id="payment-detail-title">Detail Transaksi</h3>
                <p>{selectedTransaction.order_id || selectedTransaction.id}</p>
              </div>
              <button
                className="payments-modal-close"
                onClick={() => setSelectedTransaction(null)}
                type="button"
                aria-label="Tutup detail transaksi"
              >
                x
              </button>
            </div>

            <dl className="payments-detail-list">
              <div><dt>Member</dt><dd>{selectedTransaction.full_name || "-"}</dd></div>
              <div><dt>Email</dt><dd>{selectedTransaction.email || "-"}</dd></div>
              <div><dt>Tipe Pembayaran</dt><dd>{formatTransactionType(selectedTransaction.transaction_type)}</dd></div>
              <div><dt>Metode</dt><dd>{selectedTransaction.payment_method || "-"}</dd></div>
              <div><dt>Status</dt><dd>{selectedTransaction.status || "-"}</dd></div>
              <div><dt>Total</dt><dd>{formatCurrency(selectedTransaction.amount)}</dd></div>
              <div><dt>Penalty</dt><dd>{formatCurrency(selectedTransaction.penalty_amount)}</dd></div>
              <div><dt>Dibuat</dt><dd>{formatDateTime(selectedTransaction.created_at)}</dd></div>
              <div><dt>Expired</dt><dd>{formatDateTime(selectedTransaction.expire_at)}</dd></div>
              <div><dt>Settled</dt><dd>{formatDateTime(selectedTransaction.settled_at)}</dd></div>
            </dl>

            <div className="payments-modal-actions">
              {selectedTransaction.status === "PENDING" && (
                <button
                  className="payments-action reject"
                  disabled={actionLoadingId === selectedTransaction.id}
                  onClick={() => cancelTransaction(selectedTransaction)}
                  type="button"
                >
                  Cancel Transaction
                </button>
              )}
              <button className="payments-action accept" onClick={() => setSelectedTransaction(null)} type="button">
                Tutup
              </button>
            </div>
          </section>
        </div>
      )}
    </AdminLayout>
  );
}
