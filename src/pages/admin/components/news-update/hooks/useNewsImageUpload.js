import { useEffect, useMemo, useState } from "react";

const maxFileSize = 2 * 1024 * 1024;
const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];

export default function useNewsImageUpload() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  const previewUrl = useMemo(() => {
    if (!file) return "";
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const selectFile = (nextFile) => {
    if (!nextFile) return false;
    if (!allowedTypes.includes(nextFile.type)) {
      setError("Format gambar harus PNG atau JPG.");
      return false;
    }
    if (nextFile.size > maxFileSize) {
      setError("Ukuran gambar maksimal 2MB.");
      return false;
    }
    setFile(nextFile);
    setError("");
    return true;
  };

  return {
    file,
    previewUrl,
    error,
    handleInputChange: (event) => selectFile(event.target.files?.[0]),
    handleDragOver: (event) => event.preventDefault(),
    handleDrop: (event) => {
      event.preventDefault();
      selectFile(event.dataTransfer.files?.[0]);
    },
    resetImage: () => {
      setFile(null);
      setError("");
    },
  };
}
