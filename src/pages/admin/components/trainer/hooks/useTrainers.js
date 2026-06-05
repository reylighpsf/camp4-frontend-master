import { useCallback, useEffect, useState } from "react";
import api from "../../../../../components/auth/authApi";

const getErrorMessage = (err, fallback) =>
  err.response?.data?.error || err.response?.data?.message || err.message || fallback;

const buildTrainerPayload = ({ values, image }) => {
  const payload = new FormData();
  payload.append("name", values.name.trim());
  payload.append("email", values.email.trim());
  payload.append(
    "bio",
    `Spesialis: ${values.specialization.trim()}\nHarga per sesi: ${values.price.trim()}`
  );
  payload.append("specialties", values.specialization.trim());
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

  const fetchTrainers = useCallback(async () => {
    setListLoading(true);
    setListError("");

    try {
      const response = await api.get("/trainers");
      setTrainers(response.data?.data || []);
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

  return {
    trainers,
    listLoading,
    listError,
    submitLoading,
    submitError,
    submitSuccessMessage,
    deleteLoadingId,
    deleteError,
    fetchTrainers,
    createTrainer,
    updateTrainer,
    deleteTrainer,
  };
}
