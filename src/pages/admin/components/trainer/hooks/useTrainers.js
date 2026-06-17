import { useCallback, useEffect, useState } from "react";
import api from "@/components/auth/hooks/authApi";
import { getResponseList } from "@/utils/responseData";

const getErrorMessage = (err, fallback) =>
  err.response?.data?.error || err.response?.data?.message || err.message || fallback;

const buildTrainerPayload = ({ values, image }) => {
  const payload = new FormData();
  payload.append("name", values.name.trim());
  payload.append("email", values.email.trim());
  payload.append("phoneNumber", values.phoneNumber.trim());
  payload.append("bio", values.bio.trim());
  payload.append("specialties", values.specialties.trim());
  if (image) payload.append("image", image);
  return payload;
};

export default function useTrainers() {
  const [trainers, setTrainers] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccessMessage, setSubmitSuccessMessage] = useState("");
  const [deleteLoadingId, setDeleteLoadingId] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionError, setSessionError] = useState("");
  const [sessions, setSessions] = useState([]);
  const [sessionMeta, setSessionMeta] = useState(null);

  const fetchTrainers = useCallback(async () => {
    setListLoading(true);
    setListError("");

    try {
      const response = await api.get("/trainers", { params: { page: 1, limit: 100 } });
      setTrainers(getResponseList(response));
    } catch (err) {
      setListError(getErrorMessage(err, "Gagal memuat data trainer."));
      setTrainers([]);
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(fetchTrainers, 0);
    return () => clearTimeout(timeoutId);
  }, [fetchTrainers]);

  const createTrainer = async ({ values, image }) => {
    setSubmitLoading(true);
    setSubmitError("");
    setSubmitSuccessMessage("");

    try {
      const response = await api.post("/trainers", buildTrainerPayload({ values, image }), {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSubmitSuccessMessage("Trainer berhasil ditambahkan.");
      return { ok: true, data: response.data?.data };
    } catch (err) {
      const message = getErrorMessage(err, "Gagal menambahkan trainer.");
      setSubmitError(message);
      return { ok: false, error: message };
    } finally {
      setSubmitLoading(false);
    }
  };

  const updateTrainer = async (trainerId, { values, image }) => {
    setSubmitLoading(true);
    setSubmitError("");
    setSubmitSuccessMessage("");

    try {
      const response = await api.put(`/trainers/${trainerId}`, buildTrainerPayload({ values, image }), {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSubmitSuccessMessage("Trainer berhasil diperbarui.");
      return { ok: true, data: response.data?.data };
    } catch (err) {
      const message = getErrorMessage(err, "Gagal memperbarui trainer.");
      setSubmitError(message);
      return { ok: false, error: message };
    } finally {
      setSubmitLoading(false);
    }
  };

  const deleteTrainer = async (trainerId) => {
    setDeleteLoadingId(trainerId);
    setDeleteError("");

    try {
      await api.delete(`/trainers/${trainerId}`);
      return { ok: true };
    } catch (err) {
      const message = getErrorMessage(err, "Gagal menghapus trainer.");
      setDeleteError(message);
      return { ok: false, error: message };
    } finally {
      setDeleteLoadingId("");
    }
  };

  const fetchTrainerSessions = async (trainerId, params = {}) => {
    setSessionLoading(true);
    setSessionError("");
    setSessions([]);
    setSessionMeta(null);

    try {
      const response = await api.get(`/trainers/admin/sessions/${trainerId}`, {
        params: { page: 1, limit: 100, ...params },
      });
      setSessions(getResponseList(response));
      setSessionMeta(response.data?.meta || null);
      return { ok: true, data: response.data?.data || [] };
    } catch (err) {
      const message = getErrorMessage(err, "Gagal memuat sesi trainer.");
      setSessionError(message);
      return { ok: false, error: message };
    } finally {
      setSessionLoading(false);
    }
  };

  const fetchAllSessions = async (params = {}) => {
    setSessionLoading(true);
    setSessionError("");
    setSessions([]);
    setSessionMeta(null);

    try {
      const response = await api.get("/trainers/admin/sessions", {
        params: { page: 1, limit: 100, ...params },
      });
      setSessions(getResponseList(response));
      setSessionMeta(response.data?.meta || null);
      return { ok: true, data: response.data?.data || [] };
    } catch (err) {
      const message = getErrorMessage(err, "Gagal memuat semua sesi trainer.");
      setSessionError(message);
      return { ok: false, error: message };
    } finally {
      setSessionLoading(false);
    }
  };

  const cancelTrainerSession = async (sessionId, reason = "Cancelled by admin") => {
    setSessionError("");

    try {
      const response = await api.post(`/trainers/sessions/${sessionId}/cancel`, { reason });
      return { ok: true, data: response.data?.data };
    } catch (err) {
      const message = getErrorMessage(err, "Gagal cancel sesi trainer.");
      setSessionError(message);
      return { ok: false, error: message };
    }
  };

  return {
    trainers,
    listLoading,
    listError,
    submitLoading,
    submitError,
    submitSuccessMessage,
    deleteLoadingId,
    deleteError,
    sessionLoading,
    sessionError,
    sessions,
    sessionMeta,
    fetchTrainers,
    fetchTrainerSessions,
    fetchAllSessions,
    cancelTrainerSession,
    createTrainer,
    updateTrainer,
    deleteTrainer,
  };
}
