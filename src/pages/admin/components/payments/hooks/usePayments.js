import { useCallback, useEffect, useState } from "react";
import api from "../../../../../components/auth/authApi";

const getErrorMessage = (err, fallback) =>
  err.response?.data?.error || err.response?.data?.message || err.message || fallback;

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
      const response = await api.get("/transactions/cash/pending");
      setPayments(response.data?.data || []);
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

  return {
    payments,
    listLoading,
    listError,
    actionLoadingId,
    actionError,
    actionSuccessMessage,
    fetchPayments,
    confirmPayment,
  };
}
