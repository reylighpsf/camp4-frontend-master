import { useState } from "react";
import { Link } from "react-router";
import AdminLayout from "../../../../components/admin/AdminLayout";
import {
  formatCurrency,
  formatDateTime,
  formatTransactionType,
  paymentHistoryStorageKey,
  paymentStyles,
} from "./paymentHelpers";

export default function PaymentHistoryPage() {
  const [paymentHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(paymentHistoryStorageKey) || "[]");
    } catch {
      return [];
    }
  });

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
      </div>

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
            </tr>
          </thead>
          <tbody>
            {paymentHistory.length === 0 && (
              <tr>
                <td className="payments-empty" colSpan="7">
                  Belum ada riwayat pembayaran yang diproses.
                </td>
              </tr>
            )}

            {paymentHistory.map((item) => (
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
