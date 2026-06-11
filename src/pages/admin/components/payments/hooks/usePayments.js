import { useCallback, useEffect, useState } from "react";
import api from "../../../../../components/auth/authApi";
import { enrichTransactionMembers } from "../paymentHelpers";

const getErrorMessage = (err, fallback) =>
  err.response?.data?.error || err.response?.data?.message || err.message || fallback;

const mergePendingTransactions = (cashTransactions = [], historyTransactions = []) => {
  const byId = new Map();

  cashTransactions.forEach((transaction) => {
    byId.set(transaction.id, transaction);
  });

  historyTransactions
    .filter((transaction) => transaction.status === "PENDING" && transaction.payment_method === "QRIS")
    .forEach((transaction) => {
      byId.set(transaction.id, transaction);
    });

  return Array.from(byId.values()).sort(
    (a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime(),
  );
};

export default function usePayments() {
  const [payments, setPayments] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionSuccessMessage, setActionSuccessMessage] = useState("");

  const fetchPayments = useCallback(async () => {
    setListLoading(true);
    setListError("");
    try {
      const [paymentResponse, historyResponse, usersResponse] = await Promise.all([
        api.get("/transactions/cash/pending"),
        api.get("/transactions/history", { params: { page: 1, limit: 100 } }),
        api.get("/admin/users"),
      ]);
      const pendingTransactions = mergePendingTransactions(
        paymentResponse.data?.data || [],
        historyResponse.data?.data || [],
      );
      setPayments(enrichTransactionMembers(pendingTransactions, usersResponse.data?.data || []));
    } catch (err) {
      setListError(getErrorMessage(err, "Gagal memuat data pembayaran."));
      setPayments([]);
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(fetchPayments, 0);
    return () => clearTimeout(timeoutId);
  }, [fetchPayments]);

  const confirmPayment = async ({ transactionId, status }) => {
    setActionLoadingId(transactionId);
    setActionError("");
    setActionSuccessMessage("");

    try {
      const response = await api.post("/transactions/cash/confirm", {
        transactionId,
        status,
      });
      setActionSuccessMessage(
        status === "SUCCESS" ? "Pembayaran berhasil diterima." : "Pembayaran berhasil ditolak."
      );
      return { ok: true, data: response.data?.data };
    } catch (err) {
      const message = getErrorMessage(err, "Gagal memproses pembayaran.");
      setActionError(message);
      return { ok: false, error: message };
    } finally {
      setActionLoadingId("");
    }
  };

  const cancelPayment = async (transactionId) => {
    setActionLoadingId(transactionId);
    setActionError("");
    setActionSuccessMessage("");

    try {
      const response = await api.post(`/transactions/${transactionId}/cancel`);
      setActionSuccessMessage("Transaksi berhasil dibatalkan.");
      return { ok: true, data: response.data?.data };
    } catch (err) {
      const message = getErrorMessage(err, "Gagal membatalkan transaksi.");
      setActionError(message);
      return { ok: false, error: message };
    } finally {
      setActionLoadingId("");
    }
  };

  return {
    payments,
    listLoading,
    listError,
    actionLoadingId,
    actionError,
    actionSuccessMessage,
    fetchPayments,
    confirmPayment,
    cancelPayment,
  };
}
