import { useState } from "react";
import api from "../../../../../components/auth/authApi";

const getErrorMessage = (err, fallback) =>
  err.response?.data?.error || err.response?.data?.message || err.message || fallback;

export default function useMembershipPayment() {
  const [loadingPackageId, setLoadingPackageId] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [pendingTransaction, setPendingTransaction] = useState(null);

  const createPayment = async ({ packageId, transactionType, paymentMethod }) => {
    setLoadingPackageId(packageId);
    setError("");
    setSuccessMessage("");

    try {
      const response = await api.post("/transactions/create", {
        transactionType,
        paymentMethod,
      });

      const data = response.data?.data || {};
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return { ok: true, data };
      }

      setPendingTransaction(data.transaction || null);
      setSuccessMessage(data.message || "Transaksi dibuat. Upload struk untuk menunggu konfirmasi pengurus.");
      return { ok: true, data };
    } catch (err) {
      const message = getErrorMessage(err, "Gagal membuat pembayaran.");
      setError(message);
      return { ok: false, error: message };
    } finally {
      setLoadingPackageId("");
    }
  };

  return {
    loadingPackageId,
    error,
    successMessage,
    pendingTransaction,
    createPayment,
  };
}
