import { useState } from "react";

const initialValues = {
  title: "Promo Spesial Bulan Mei!",
  description:
    "Dapatkan potongan harga 20 % untuk semua paket membership selama bulan mei.",
};

export default function useNewsForm() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const updateField = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!values.title.trim()) nextErrors.title = "Judul berita wajib diisi.";
    if (!values.description.trim()) nextErrors.description = "Deskripsi wajib diisi.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const resetForm = (nextValues = initialValues) => {
    setValues(nextValues);
    setErrors({});
  };

  return { values, errors, updateField, validate, resetForm };
}
