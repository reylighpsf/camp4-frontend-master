import { useCallback, useEffect, useState } from "react";
import api from "@/components/auth/hooks/authApi";
import { getResponseList } from "@/utils/responseData";
import { enrichTransactionMembers } from "./paymentHelpers";

const getErrorMessage = (err, fallback) =>
  err.response?.data?.error || err.response?.data?.message || err.message || fallback;

export default function usePaymentHistory() {
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [historyResponse, usersResponse] = await Promise.all([
        api.get("/transactions/history", {
          params: { page: 1, limit: 100 },
        }),
        api.get("/admin/users", { params: { page: 1, limit: 100 } }),
      ]);
      setPaymentHistory(enrichTransactionMembers(getResponseList(historyResponse), getResponseList(usersResponse)));
    } catch (err) {
      setError(getErrorMessage(err, "Gagal memuat riwayat transaksi."));
      setPaymentHistory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(fetchHistory, 0);
    return () => clearTimeout(timeoutId);
  }, [fetchHistory]);

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

  return {
    actionLoadingId,
    actionMessage,
    error,
    fetchHistory,
    loading,
    paymentHistory,
    selectedTransaction,
    setSelectedTransaction,
    viewDetails,
  };
}
