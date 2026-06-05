import { useEffect, useState } from "react";
import { Link } from "react-router";
import AdminLayout from "../../../../components/admin/AdminLayout";
import api from "../../../../components/auth/authApi";
import {
  formatCurrency,
  formatDateTime,
  formatTransactionType,
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
      const response = await api.get("/transactions/history", {
        params: { page: 1, limit: 100 },
      });
      setPaymentHistory(response.data?.data || []);
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

      {selectedTransaction && (
        <section className="payments-detail">
          <div>
            <h3>Detail Transaksi</h3>
            <p>{selectedTransaction.order_id || selectedTransaction.id}</p>
          </div>
          <dl>
            <div><dt>Member</dt><dd>{selectedTransaction.full_name || selectedTransaction.email || "-"}</dd></div>
            <div><dt>Tipe</dt><dd>{formatTransactionType(selectedTransaction.transaction_type)}</dd></div>
            <div><dt>Status</dt><dd>{selectedTransaction.status || "-"}</dd></div>
            <div><dt>Total</dt><dd>{formatCurrency(selectedTransaction.amount)}</dd></div>
          </dl>
        </section>
      )}

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
    </AdminLayout>
  );
}
