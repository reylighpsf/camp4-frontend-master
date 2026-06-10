import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

export const confirmAction = async ({
  cancelButtonText = "Batal",
  confirmButtonColor = "#ff6b20",
  confirmButtonText = "Ya, lanjutkan",
  icon = "warning",
  text,
  title = "Apakah kamu yakin?",
} = {}) => {
  const result = await Swal.fire({
    cancelButtonText,
    confirmButtonColor,
    confirmButtonText,
    icon,
    reverseButtons: true,
    showCancelButton: true,
    text,
    title,
  });

  return result.isConfirmed;
};
