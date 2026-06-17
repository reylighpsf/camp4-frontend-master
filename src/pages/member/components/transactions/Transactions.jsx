import { useCallback, useEffect, useState } from "react";
import MemberLayout from "@/components/member/MemberLayout";
import api from "@/components/auth/hooks/authApi";
import { confirmAction } from "@/utils/sweetAlert";

const getErrorMessage = (err, fallback) =>
  err.response?.data?.error || err.response?.data?.message || err.message || fallback;

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

const formatCurrency = (value) =>
  new Intl.NumberFormat("id-ID", {
    currency: "IDR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(Number(value || 0));

const formatTransactionType = (value) =>
  String(value || "-")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const getPaymentUrl = (transaction) =>
  transaction?.paymentUrl ||
  transaction?.payment_url ||
  transaction?.redirect_url ||
  transaction?.snap_redirect_url ||
  transaction?.midtrans_redirect_url ||
  transaction?.invoice_url ||
  "";

const getReceiptUrl = (transaction) =>
  transaction?.receiptUrl ||
  transaction?.receipt_url ||
  transaction?.invoice_url ||
  transaction?.settlement_url ||
  "";

const getTransactionEmail = (transaction) =>
  transaction?.user_email ||
  transaction?.email ||
  transaction?.user?.email ||
  transaction?.member?.email ||
  "-";

const getTrainerName = (transaction) =>
  transaction?.trainer_name ||
  transaction?.trainer?.name ||
  transaction?.trainer?.full_name ||
  transaction?.package?.trainer?.name ||
  "-";

const getPackageName = (transaction) =>
  transaction?.package_name ||
  transaction?.item_name ||
  transaction?.catalog_name ||
  transaction?.package?.name ||
  formatTransactionType(transaction?.transaction_type);

const getDetailRows = (transaction) => [
  ["Transaction ID", transaction?.order_id || transaction?.id || "-"],
  ["Date", formatDateTime(transaction?.created_at)],
  ["User Email", getTransactionEmail(transaction)],
  ["Type", formatTransactionType(transaction?.transaction_family || transaction?.type || transaction?.transaction_type)],
  ["Package/Item", getPackageName(transaction)],
  ["Trainer", getTrainerName(transaction)],
  ["Payment Method", transaction?.payment_method || "-"],
  ["Amount", formatCurrency(transaction?.amount)],
  ["Status", transaction?.status || "-"],
  ["Deadline", transaction?.expired_at ? formatDateTime(transaction.expired_at) : transaction?.deadline || "-"],
];

export default function MemberTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detailLoadingId, setDetailLoadingId] = useState("");
  const [cancelLoadingId, setCancelLoadingId] = useState("");

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/transactions/history", {
        params: { page: 1, limit: 100 },
      });
      setTransactions(response.data?.data || []);
    } catch (err) {
      setError(getErrorMessage(err, "Gagal memuat payment history."));
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(fetchTransactions, 0);
    return () => clearTimeout(timeoutId);
  }, [fetchTransactions]);

  const viewDetails = async (transactionId) => {
    setDetailLoadingId(transactionId);
    setError("");

    try {
      const response = await api.get(`/transactions/${transactionId}`);
      setSelectedTransaction(response.data?.data || null);
    } catch (err) {
      setError(getErrorMessage(err, "Gagal memuat detail transaksi."));
    } finally {
      setDetailLoadingId("");
    }
  };

  const continuePayment = (transaction) => {
    const paymentUrl = getPaymentUrl(transaction);
    if (paymentUrl) {
      window.open(paymentUrl, "_blank", "noopener,noreferrer");
      return;
    }
    setError("Link pembayaran tidak tersedia untuk transaksi ini.");
  };

  const cancelTransaction = async (transaction) => {
    const transactionId = transaction?.id;
    if (!transactionId) {
      setError("ID transaksi tidak tersedia.");
      return;
    }

    const confirmed = await confirmAction({
      confirmButtonText: "Ya, batalkan",
      text: "Transaksi pending akan dibatalkan dan tidak bisa dilanjutkan.",
      title: "Batalkan transaksi?",
    });

    if (!confirmed) return;

    setCancelLoadingId(transactionId);
    setError("");

    try {
      const response = await api.post(`/transactions/${transactionId}/cancel`);
      const cancelledTransaction = response.data?.data || { ...transaction, status: "FAILED" };

      setTransactions((currentTransactions) =>
        currentTransactions.map((item) =>
          item.id === transactionId ? { ...item, ...cancelledTransaction } : item
        )
      );
      setSelectedTransaction((currentTransaction) =>
        currentTransaction?.id === transactionId
          ? { ...currentTransaction, ...cancelledTransaction }
          : currentTransaction
      );
    } catch (err) {
      setError(getErrorMessage(err, "Gagal membatalkan transaksi."));
    } finally {
      setCancelLoadingId("");
      fetchTransactions();
    }
  };

  const downloadReceipt = (transaction) => {
    const receiptUrl = getReceiptUrl(transaction);
    if (receiptUrl) {
      window.open(receiptUrl, "_blank", "noopener,noreferrer");
      return;
    }
    window.print();
  };

  return (
    <MemberLayout active="Transactions">
      <style>{`
        .transactions-page {
          color: #0b0871;
        }

        .transactions-head {
          margin-bottom: 24px;
        }

        .transactions-head h1 {
          font-family: 'Anton', sans-serif;
          font-size: 34px;
          font-weight: 400;
          line-height: 1;
          margin: 0 0 8px;
        }

        .transactions-head p {
          color: #292782;
          font-size: 13px;
          font-weight: 700;
          margin: 0;
        }

        .transactions-card {
          background: #f8f8fb;
          border-radius: 12px;
          padding: 18px;
        }

        .transactions-table-wrap {
          overflow-x: auto;
        }

        .transactions-table {
          border-collapse: collapse;
          min-width: 900px;
          width: 100%;
        }

        .transactions-table th {
          background: #eef0fb;
          color: #0b0871;
          font-size: 12px;
          font-weight: 900;
          padding: 13px 14px;
          text-align: left;
        }

        .transactions-table td {
          border-bottom: 1px solid #e3e6f1;
          color: #11131d;
          font-size: 12px;
          font-weight: 700;
          padding: 14px;
          vertical-align: middle;
        }

        .transactions-status {
          border-radius: 999px;
          display: inline-flex;
          font-size: 10px;
          font-weight: 900;
          min-width: 92px;
          justify-content: center;
          padding: 5px 10px;
          text-transform: capitalize;
        }

        .transactions-status.success,
        .transactions-status.completed {
          background: #dcfce7;
          color: #15803d;
        }

        .transactions-status.pending {
          background: #fff4d8;
          color: #b45309;
        }

        .transactions-status.failed,
        .transactions-status.cancelled,
        .transactions-status.canceled,
        .transactions-status.expired {
          background: #fee2e2;
          color: #b91c1c;
        }

        .transactions-detail-btn {
          background: #ffffff;
          border: 1px solid #0b0871;
          border-radius: 999px;
          color: #0b0871;
          cursor: pointer;
          font: inherit;
          font-size: 11px;
          font-weight: 900;
          min-height: 28px;
          padding: 0 14px;
        }

        .transactions-row-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .transactions-detail-btn:disabled,
        .transactions-primary-btn:disabled,
        .transactions-danger-btn:disabled {
          cursor: not-allowed;
          opacity: .62;
        }

        .transactions-empty,
        .transactions-alert {
          background: #fff;
          border-radius: 10px;
          color: #6f72a6;
          font-size: 13px;
          font-weight: 800;
          padding: 22px;
          text-align: center;
        }

        .transactions-alert {
          background: #fff1f0;
          color: #c73822;
          margin-bottom: 14px;
        }

        .transactions-modal-backdrop {
          align-items: center;
          background: rgba(0, 0, 0, .62);
          display: flex;
          inset: 0;
          justify-content: center;
          padding: 20px;
          position: fixed;
          z-index: 1000;
        }

        .transactions-modal {
          background: #fff;
          border-radius: 8px;
          color: #0b0871;
          max-width: 640px;
          overflow: hidden;
          padding: 0;
          width: 100%;
        }

        .transactions-modal-head {
          align-items: center;
          border-bottom: 1px solid #b8bde0;
          display: flex;
          justify-content: space-between;
          padding: 18px 22px;
        }

        .transactions-modal-head h2 {
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 4px;
          margin: 0;
          text-transform: uppercase;
        }

        .transactions-modal-close {
          align-items: center;
          background: transparent;
          border: 0;
          color: #0b0871;
          cursor: pointer;
          display: inline-flex;
          font-size: 28px;
          height: 28px;
          justify-content: center;
          line-height: 1;
          padding: 0;
          width: 28px;
        }

        .transactions-modal-body {
          display: grid;
          gap: 16px;
          padding: 18px 22px;
        }

        .transactions-pending-banner {
          align-items: center;
          background: #ffc5c5;
          color: #ef2626;
          display: grid;
          gap: 10px;
          grid-template-columns: 24px minmax(0, 1fr);
          margin: 0 -22px;
          padding: 14px 28px;
        }

        .transactions-pending-banner strong {
          display: block;
          font-size: 13px;
          font-weight: 900;
        }

        .transactions-pending-banner span {
          display: block;
          font-size: 10px;
          font-weight: 700;
          margin-top: 2px;
        }

        .transactions-detail-panel {
          border: 1px solid #bfc3d6;
          border-radius: 10px;
          overflow: hidden;
        }

        .transactions-detail-row {
          align-items: center;
          border-bottom: 1px solid #d9dbe8;
          display: grid;
          gap: 18px;
          grid-template-columns: minmax(120px, 1fr) minmax(0, 1.35fr);
          min-height: 34px;
          padding: 0 14px;
        }

        .transactions-detail-row:last-child {
          border-bottom: 0;
        }

        .transactions-detail-row span,
        .transactions-detail-row strong {
          color: #0b0871;
          font-size: 12px;
          line-height: 1.25;
        }

        .transactions-detail-row span {
          font-weight: 700;
        }

        .transactions-detail-row strong {
          font-weight: 800;
          text-align: right;
          word-break: break-word;
        }

        .transactions-detail-row .transactions-status {
          justify-self: end;
          min-width: 88px;
        }

        .transactions-modal-note {
          color: #0b0871;
          font-size: 10px;
          font-weight: 700;
          margin: 0;
          padding: 0 6px;
        }

        .transactions-modal-actions {
          border-top: 1px solid #b8bde0;
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          padding: 14px 22px;
        }

        .transactions-modal-actions .transactions-detail-btn {
          border-radius: 4px;
          min-height: 30px;
          min-width: 170px;
        }

        .transactions-primary-btn {
          background: #0b0871;
          border: 1px solid #0b0871;
          border-radius: 4px;
          color: #ffffff;
          cursor: pointer;
          font: inherit;
          font-size: 11px;
          font-weight: 900;
          min-height: 30px;
          min-width: 210px;
          padding: 0 16px;
        }

        .transactions-danger-btn {
          background: #c73822;
          border: 1px solid #c73822;
          border-radius: 4px;
          color: #ffffff;
          cursor: pointer;
          font: inherit;
          font-size: 11px;
          font-weight: 900;
          min-height: 30px;
          min-width: 170px;
          padding: 0 16px;
        }

        @media (max-width: 760px) {
          .transactions-modal-actions {
            flex-direction: column;
          }

          .transactions-modal-actions .transactions-detail-btn,
          .transactions-danger-btn,
          .transactions-primary-btn {
            width: 100%;
          }

          .transactions-detail-row {
            grid-template-columns: 1fr;
            gap: 4px;
            padding: 9px 12px;
          }

          .transactions-detail-row strong {
            text-align: left;
          }
        }
      `}</style>

      <section className="transactions-page">
        <div className="transactions-head">
          <h1>Transactions</h1>
          <p>Choose a package, trainer, and payment method.</p>
        </div>

        {error && <div className="transactions-alert">{error}</div>}

        <div className="transactions-card">
          <div className="transactions-table-wrap">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Transaction ID</th>
                  <th>Package/Item</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="6"><div className="transactions-empty">Memuat payment history...</div></td>
                  </tr>
                )}
                {!loading && transactions.length === 0 && (
                  <tr>
                    <td colSpan="6"><div className="transactions-empty">Belum ada transaksi.</div></td>
                  </tr>
                )}
                {!loading && transactions.map((transaction) => {
                  const status = String(transaction.status || "").toLowerCase();
                  return (
                    <tr key={transaction.id || transaction.order_id}>
                      <td>{formatDateTime(transaction.created_at)}</td>
                      <td>{transaction.order_id || transaction.id || "-"}</td>
                      <td>{formatTransactionType(transaction.transaction_type)}</td>
                      <td>{transaction.payment_method || "-"}</td>
                      <td><span className={`transactions-status ${status}`}>{status || "-"}</span></td>
                      <td>
                        <div className="transactions-row-actions">
                          <button
                            className="transactions-detail-btn"
                            disabled={detailLoadingId === transaction.id}
                            onClick={() => viewDetails(transaction.id)}
                            type="button"
                          >
                            {detailLoadingId === transaction.id ? "Loading..." : "Detail"}
                          </button>
                          {status === "pending" && (
                            <button
                              className="transactions-detail-btn"
                              disabled={cancelLoadingId === transaction.id}
                              onClick={() => cancelTransaction(transaction)}
                              type="button"
                            >
                              {cancelLoadingId === transaction.id ? "Canceling..." : "Cancel"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {selectedTransaction && (
        <div className="transactions-modal-backdrop">
          <section className="transactions-modal" role="dialog" aria-modal="true">
            <div className="transactions-modal-head">
              <h2>Transaction Detail</h2>
              <button className="transactions-modal-close" onClick={() => setSelectedTransaction(null)} type="button" aria-label="Close">
                x
              </button>
            </div>
            <div className="transactions-modal-body">
              {String(selectedTransaction.status || "").toLowerCase() === "pending" && (
                <div className="transactions-pending-banner">
                  <span>!</span>
                  <div>
                    <strong>Pending Payment</strong>
                    <span>Complete your payment before the session is cancelled.</span>
                  </div>
                </div>
              )}

              <div className="transactions-detail-panel">
                {getDetailRows(selectedTransaction).map(([label, value]) => {
                  const isStatus = label === "Status";
                  const status = String(value || "").toLowerCase();
                  return (
                    <div className="transactions-detail-row" key={label}>
                      <span>{label}</span>
                      {isStatus ? (
                        <strong className={`transactions-status ${status}`}>{status || "-"}</strong>
                      ) : (
                        <strong>{value}</strong>
                      )}
                    </div>
                  );
                })}
              </div>

              {String(selectedTransaction.status || "").toLowerCase() === "pending" && (
                <p className="transactions-modal-note">Complete your payment before the session is automatically cancelled.</p>
              )}
              {String(selectedTransaction.status || "").toLowerCase() === "expired" && (
                <p className="transactions-modal-note">This transaction has expired. Please re-order to continue.</p>
              )}
            </div>
            <div className="transactions-modal-actions">
              <button className="transactions-detail-btn" onClick={() => setSelectedTransaction(null)} type="button">
                Close
              </button>
              {String(selectedTransaction.status || "").toLowerCase() === "pending" && (
                <>
                  <button
                    className="transactions-danger-btn"
                    disabled={cancelLoadingId === selectedTransaction.id}
                    onClick={() => cancelTransaction(selectedTransaction)}
                    type="button"
                  >
                    {cancelLoadingId === selectedTransaction.id ? "Canceling..." : "Cancel Transaction"}
                  </button>
                  <button className="transactions-primary-btn" onClick={() => continuePayment(selectedTransaction)} type="button">
                    Continue Payment
                  </button>
                </>
              )}
              {["success", "completed"].includes(String(selectedTransaction.status || "").toLowerCase()) && (
                <button className="transactions-primary-btn" onClick={() => downloadReceipt(selectedTransaction)} type="button">
                  Download Receipt
                </button>
              )}
            </div>
          </section>
        </div>
      )}
    </MemberLayout>
  );
}
