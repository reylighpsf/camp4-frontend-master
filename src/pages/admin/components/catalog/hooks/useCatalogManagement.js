import { useCallback, useEffect, useMemo, useState } from "react";
import api from "@/components/auth/hooks/authApi";
import { confirmAction } from "@/utils/sweetAlert";
import {
  accountTiers,
  buildPricesPayload,
  catalogListEndpoints,
  emptyForm,
  familyLabels,
  normalizeCatalogToForm,
} from "./catalogConstants";

const getErrorMessage = (err, fallback) =>
  err.response?.data?.error || err.response?.data?.message || err.message || fallback;

const toNullableNumber = (value) => {
  if (value === "" || value === null || value === undefined) return null;
  return Number(value);
};

const buildCreatePayload = (values) => ({
  code: values.code.trim().toUpperCase(),
  family: values.family,
  name: values.name.trim(),
  description: values.description.trim() || null,
  groupSize: toNullableNumber(values.groupSize),
  sessionCount: toNullableNumber(values.sessionCount),
  durationDays: toNullableNumber(values.durationDays),
  isActive: values.isActive,
  prices: buildPricesPayload(values.prices),
});

const buildUpdatePayload = (values) => ({
  family: values.family,
  name: values.name.trim(),
  description: values.description.trim() || null,
  groupSize: toNullableNumber(values.groupSize),
  sessionCount: toNullableNumber(values.sessionCount),
  durationDays: toNullableNumber(values.durationDays),
  isActive: values.isActive,
  prices: buildPricesPayload(values.prices),
});

const getEmptyForm = (family) => ({
  ...emptyForm,
  family,
  prices: accountTiers.map((tier) => ({ tierCode: tier.code, tierName: tier.name, price: "" })),
});

export default function useCatalogManagement(family = "MEMBERSHIP") {
  const page = familyLabels[family] || familyLabels.MEMBERSHIP;
  const [catalogs, setCatalogs] = useState([]);
  const [form, setForm] = useState(() => getEmptyForm(family));
  const [editingCode, setEditingCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);

  const familyCatalogs = useMemo(
    () =>
      catalogs
        .filter((item) => item.family === family)
        .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0)),
    [catalogs, family],
  );

  const fetchCatalogs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get(catalogListEndpoints[family] || "/catalogs/membership");
      setCatalogs(response.data?.data || []);
    } catch (err) {
      setError(getErrorMessage(err, "Gagal memuat catalog."));
      setCatalogs([]);
    } finally {
      setLoading(false);
    }
  }, [family]);

  useEffect(() => {
    const timeoutId = setTimeout(fetchCatalogs, 0);
    return () => clearTimeout(timeoutId);
  }, [fetchCatalogs]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
    setMessage("");
  };

  const updatePrice = (tierCode, value) => {
    setForm((current) => ({
      ...current,
      prices: current.prices.map((price) =>
        price.tierCode === tierCode ? { ...price, price: value } : price,
      ),
    }));
    setError("");
    setMessage("");
  };

  const resetForm = () => {
    setForm(getEmptyForm(family));
    setEditingCode("");
    setError("");
    setIsFormOpen(false);
  };

  const startEdit = (item) => {
    setForm(normalizeCatalogToForm(item));
    setEditingCode(item.code);
    setError("");
    setMessage("");
    setIsFormOpen(true);
  };

  const openCreateForm = () => {
    setForm(getEmptyForm(family));
    setEditingCode("");
    setError("");
    setMessage("");
    setIsFormOpen(true);
  };

  const validateForm = () => {
    if (form.code.trim().length < 2) return "Code minimal 2 karakter.";
    if (form.name.trim().length < 2) return "Name minimal 2 karakter.";
    const prices = buildPricesPayload(form.prices);
    if (prices.length === 0) return "Minimal satu harga tier wajib diisi.";
    if (prices.some((item) => Number.isNaN(item.price) || item.price < 0)) {
      return "Harga tier harus berupa angka 0 atau lebih.";
    }
    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitLoading(true);
    setError("");
    setMessage("");

    try {
      const successMessage = editingCode ? "Catalog berhasil diperbarui." : "Catalog berhasil ditambahkan.";
      if (editingCode) {
        await api.put(`/catalogs/${editingCode}`, buildUpdatePayload(form));
      } else {
        await api.post("/catalogs", buildCreatePayload(form));
      }
      resetForm();
      await fetchCatalogs();
      setMessage(successMessage);
    } catch (err) {
      setError(getErrorMessage(err, "Gagal menyimpan catalog."));
    } finally {
      setSubmitLoading(false);
    }
  };

  const deleteCatalog = async (item) => {
    const confirmed = await confirmAction({
      confirmButtonColor: "#c73822",
      confirmButtonText: "Hapus",
      text: `Catalog ${item.code} akan dihapus.`,
      title: "Hapus Catalog?",
    });
    if (!confirmed) return;

    setActionLoading(`delete-${item.code}`);
    setError("");
    setMessage("");

    try {
      await api.delete(`/catalogs/${item.code}`);
      setMessage("Catalog berhasil dihapus.");
      await fetchCatalogs();
      if (editingCode === item.code) resetForm();
    } catch (err) {
      setError(getErrorMessage(err, "Gagal menghapus catalog."));
    } finally {
      setActionLoading("");
    }
  };

  const moveCatalog = async (item, direction) => {
    const currentIndex = familyCatalogs.findIndex((catalog) => catalog.code === item.code);
    const targetIndex = currentIndex + direction;
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= familyCatalogs.length) return;

    const reorderedCatalogs = [...familyCatalogs];
    [reorderedCatalogs[currentIndex], reorderedCatalogs[targetIndex]] = [
      reorderedCatalogs[targetIndex],
      reorderedCatalogs[currentIndex],
    ];

    setActionLoading(`reorder-${item.code}`);
    setError("");
    setMessage("");

    try {
      const response = await api.patch("/catalogs/reorder", {
        family,
        orderedCodes: reorderedCatalogs.map((catalog) => catalog.code),
      });
      setCatalogs(response.data?.data || reorderedCatalogs);
      setMessage("Urutan catalog berhasil diperbarui.");
    } catch (err) {
      setError(getErrorMessage(err, "Gagal mengubah urutan catalog."));
    } finally {
      setActionLoading("");
    }
  };

  return {
    actionLoading,
    deleteCatalog,
    editingCode,
    error,
    familyCatalogs,
    fetchCatalogs,
    form,
    handleSubmit,
    isFormOpen,
    loading,
    message,
    moveCatalog,
    openCreateForm,
    page,
    resetForm,
    startEdit,
    submitLoading,
    updateField,
    updatePrice,
  };
}
