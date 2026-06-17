import { useCallback, useEffect, useState } from "react";
import api from "../../../../../services/authApi.js";
import { getResponseList } from "../../../../../utils/responseData.js";
import { enrichTransactionMembers } from "./paymentHelpers";

const getErrorMessage = (err, fallback) =>
  err.response?.data?.error || err.response?.data?.message || err.message || fallback;

const mergePendingTransactions = (...transactionGroups) => {
  const byId = new Map();

  transactionGroups.flat().forEach((transaction) => {
    if (transaction?.id) {
      byId.set(transaction.id, transaction);
    }
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
      const [cashResponse, qrisResponse, usersResponse] = await Promise.all([
        api.get("/transactions/history", { params: { method: "cash", page: 1, limit: 100, status: "pending" } }),
        api.get("/transactions/history", { params: { method: "qris", page: 1, limit: 100, status: "pending" } }),
        api.get("/admin/users", { params: { page: 1, limit: 100 } }),
      ]);
      const pendingTransactions = mergePendingTransactions(
        getResponseList(cashResponse),
        getResponseList(qrisResponse),
      );
      setPayments(enrichTransactionMembers(pendingTransactions, getResponseList(usersResponse)));
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
      const response = await api.post("/transactions/confirm", {
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
