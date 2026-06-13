import { useMemo, useState } from "react";
import AdminLayout from "../../../../components/admin/AdminLayout";
import gymImage from "../../../../assets/auth/signup-gym.jpg";
import useTrainers from "./hooks/useTrainers";
import { confirmAction } from "../../../../utils/sweetAlert";

const trainerStyles = `
  .trainer-head {
    align-items: center;
    display: flex;
    gap: 18px;
    justify-content: space-between;
    margin-bottom: 22px;
  }

  .trainer-head h2 {
    font-size: 20px;
    margin: 0 0 6px;
  }

  .trainer-head p,
  .trainer-muted {
    color: #6b7280;
    font-size: 13px;
    margin: 0;
  }

  .trainer-panel {
    background: #fff;
    border: 0;
    border-radius: 10px;
    color: #05050c;
    overflow: hidden;
    padding: 24px;
  }

  .trainer-panel-title {
    color: #05050c;
    font-size: 22px;
    font-weight: 800;
    margin: 0;
    padding: 0 0 18px;
    text-transform: none;
  }

  .trainer-add-btn,
  .trainer-action-btn {
    align-items: center;
    border-radius: 8px;
    cursor: pointer;
    display: inline-flex;
    font: inherit;
    font-size: 12px;
    font-weight: 800;
    justify-content: center;
    text-transform: uppercase;
  }

  .trainer-add-btn,
  .trainer-action-btn.save {
    background: #ff7314;
    border: 1px solid #ff7314;
    color: #fff;
  }

  .trainer-add-btn {
    height: 42px;
    padding: 0 18px;
  }

  .trainer-table-wrap {
    overflow-x: auto;
  }

  .trainer-session-section {
    display: grid;
    gap: 12px;
    margin-top: 18px;
  }

  .trainer-session-section h3 {
    color: #080478;
    font-size: 18px;
    font-weight: 900;
    margin: 0;
  }

  .trainer-session-section .trainer-table {
    min-width: 780px;
  }

  .trainer-session-calendar-layout {
    display: grid;
    gap: 18px;
    grid-template-columns: minmax(360px, 1fr) minmax(280px, 0.75fr);
  }

  .trainer-session-calendar,
  .trainer-session-detail {
    background: #f7f8fc;
    border: 1px solid #e1e4f0;
    border-radius: 12px;
    padding: 18px;
  }

  .trainer-calendar-head {
    align-items: center;
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .trainer-calendar-head h3 {
    color: #080478;
    font-size: 18px;
    font-weight: 900;
    margin: 0;
  }

  .trainer-calendar-nav {
    display: flex;
    gap: 8px;
  }

  .trainer-calendar-nav button {
    background: #fff;
    border: 1px solid #d7dced;
    border-radius: 8px;
    color: #080478;
    cursor: pointer;
    font: inherit;
    font-weight: 900;
    height: 34px;
    width: 38px;
  }

  .trainer-calendar-weekdays,
  .trainer-calendar-grid {
    display: grid;
    gap: 8px;
    grid-template-columns: repeat(7, minmax(0, 1fr));
  }

  .trainer-calendar-weekdays {
    color: #565c7c;
    font-size: 12px;
    font-weight: 900;
    margin-bottom: 8px;
    text-align: center;
  }

  .trainer-calendar-day {
    align-items: center;
    background: #fff;
    border: 1px solid #e1e4f0;
    border-radius: 10px;
    color: #080478;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    font: inherit;
    font-size: 13px;
    font-weight: 900;
    gap: 6px;
    justify-content: center;
    min-height: 58px;
    padding: 8px 4px;
  }

  .trainer-calendar-day.outside {
    color: #a3a8bd;
    opacity: .55;
  }

  .trainer-calendar-day.has-session {
    border-color: #ff7314;
  }

  .trainer-calendar-day.selected {
    background: #080478;
    border-color: #080478;
    color: #fff;
  }

  .trainer-day-badges {
    display: flex;
    gap: 4px;
  }

  .trainer-day-badge {
    border-radius: 999px;
    height: 7px;
    width: 7px;
  }

  .trainer-day-badge.booked {
    background: #16a34a;
  }

  .trainer-day-badge.cancelled {
    background: #dc2626;
  }

  .trainer-detail-title {
    color: #080478;
    font-size: 18px;
    font-weight: 900;
    margin: 0 0 14px;
  }

  .trainer-session-list {
    display: grid;
    gap: 10px;
  }

  .trainer-session-card {
    background: #fff;
    border: 1px solid #e1e4f0;
    border-radius: 10px;
    padding: 12px;
  }

  .trainer-session-card strong {
    color: #080478;
    display: block;
    font-size: 13px;
    margin-bottom: 5px;
  }

  .trainer-session-card span {
    color: #4b5563;
    display: block;
    font-size: 12px;
    line-height: 1.45;
  }

  .trainer-session-label {
    border-radius: 999px;
    display: inline-flex;
    font-size: 11px;
    font-weight: 900;
    margin-bottom: 8px;
    padding: 4px 8px;
  }

  .trainer-session-label.booked {
    background: #dcfce7;
    color: #166534;
  }

  .trainer-session-label.cancelled {
    background: #fee2e2;
    color: #991b1b;
  }

  .trainer-session-cancel {
    background: #fff;
    border: 1px solid #dc2626;
    border-radius: 999px;
    color: #dc2626;
    cursor: pointer;
    font: inherit;
    font-size: 11px;
    font-weight: 900;
    margin-top: 10px;
    min-height: 30px;
    padding: 0 12px;
  }

  .trainer-session-cancel:disabled {
    cursor: not-allowed;
    opacity: .62;
  }

  .trainer-table {
    border-collapse: collapse;
    min-width: 1120px;
    width: 100%;
  }

  .trainer-table th {
    background: #ffe08d;
    color: #111111;
    font-size: 14px;
    font-weight: 700;
    padding: 16px 18px;
    text-align: center;
    text-transform: none;
  }

  .trainer-table td {
    border-top: 0;
    color: #111111;
    font-size: 13px;
    font-weight: 500;
    padding: 18px;
    text-align: center;
    vertical-align: middle;
  }

  .trainer-table tbody tr {
    height: 58px;
  }

  .trainer-table th:first-child,
  .trainer-table td:first-child {
    padding-left: 16px;
    width: 70px;
  }

  .trainer-table th:last-child,
  .trainer-table td:last-child {
    padding-right: 14px;
    width: 160px;
  }

  .trainer-thumb {
    background: #eceef3;
    border-radius: 50%;
    display: block;
    height: 40px;
    object-fit: cover;
    width: 40px;
    margin: 0 auto;
  }

  .trainer-bio {
    max-width: 280px;
    white-space: normal;
  }

  .trainer-cell-muted {
    color: #6b7280;
    font-size: 12px;
  }

  .trainer-status {
    color: #6b7280;
    padding: 28px;
    text-align: center;
  }

  .trainer-status.error,
  .trainer-field-error {
    color: #c73822;
  }

  .trainer-success {
    color: #16794c;
    font-size: 13px;
    text-align: right;
  }

  .trainer-row-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    justify-content: center;
  }

  .trainer-row-action {
    border-radius: 999px;
    cursor: pointer;
    font: inherit;
    font-size: 11px;
    font-weight: 900;
    min-height: 30px;
    padding: 0 10px;
    text-transform: none;
  }

  .trainer-row-action.edit {
    background: #080478;
    border: 1px solid #080478;
    color: #fff;
  }

  .trainer-row-action.delete {
    background: #fff;
    border: 1px solid #c73822;
    color: #c73822;
  }

  .trainer-row-action:disabled {
    cursor: not-allowed;
    opacity: .62;
  }

  .trainer-modal-backdrop {
    align-items: center;
    background: rgba(8, 4, 120, 0.54);
    display: flex;
    inset: 0;
    justify-content: center;
    padding: 28px;
    position: fixed;
    z-index: 1000;
  }

  .trainer-modal {
    background: #fff;
    border-radius: 14px;
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.28);
    color: #05050c;
    font-family: 'DM Sans', Arial, sans-serif;
    max-height: calc(100vh - 56px);
    overflow: auto;
    padding: 24px;
    width: min(100%, 900px);
  }

  .trainer-modal-head {
    align-items: center;
    display: flex;
    justify-content: space-between;
    margin-bottom: 22px;
  }

  .trainer-modal-head h2 {
    font-size: 24px;
    font-weight: 800;
    line-height: 1.15;
    margin: 0 0 6px;
  }

  .trainer-close-btn {
    border: 0;
    border-radius: 50%;
    font: inherit;
    font-size: 14px;
    font-weight: 800;
    cursor: pointer;
    height: 36px;
    width: 36px;
  }

  .trainer-form-grid {
    display: grid;
    gap: 18px;
    grid-template-columns: minmax(0, 1fr) minmax(280px, 0.85fr);
  }

  .trainer-field {
    display: grid;
    gap: 10px;
    margin-bottom: 18px;
  }

  .trainer-field span,
  .trainer-media-title {
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0;
    text-transform: uppercase;
  }

  .trainer-input {
    background: #f4f5f8;
    border: 0;
    border-radius: 8px;
    box-shadow: 0 4px 5px rgba(17, 18, 26, 0.18);
    font: inherit;
    font-size: 13px;
    height: 52px;
    outline: 0;
    padding: 0 16px;
    width: 100%;
  }

  .trainer-textarea {
    height: 104px;
    padding-bottom: 14px;
    padding-top: 14px;
    resize: vertical;
  }

  .trainer-phone-shell {
    align-items: center;
    background: #f4f5f8;
    border-radius: 8px;
    box-shadow: 0 4px 5px rgba(17, 18, 26, 0.18);
    display: flex;
    height: 52px;
    overflow: hidden;
  }

  .trainer-phone-prefix {
    color: #11131d;
    flex: 0 0 auto;
    font-size: 13px;
    font-weight: 900;
    padding-left: 16px;
  }

  .trainer-phone-shell .trainer-input {
    background: transparent;
    box-shadow: none;
    height: 100%;
    padding-left: 5px;
  }

  .trainer-upload-box {
    align-items: center;
    background: #fff4d8;
    border: 1.5px dashed #080478;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    height: 220px;
    justify-content: center;
    position: relative;
    text-align: center;
  }

  .trainer-upload-box strong {
    font-size: 14px;
    font-weight: 900;
    line-height: 1.2;
  }

  .trainer-upload-box span {
    font-size: 13px;
    font-weight: 700;
    line-height: 1.35;
  }

  .trainer-upload-box input {
    height: 1px;
    opacity: 0;
    position: absolute;
    width: 1px;
  }

  .trainer-preview {
    background: #0c0d14;
    border-radius: 12px;
    height: 220px;
    overflow: hidden;
  }

  .trainer-preview img {
    height: 100%;
    object-fit: cover;
    width: 100%;
  }

  .trainer-form-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 22px;
  }

  .trainer-action-btn {
    height: 46px;
    min-width: 130px;
    padding: 0 16px;
  }

  .trainer-action-btn.cancel {
    background: #fff;
    border: 1px solid #11131d;
    color: #11131d;
  }

  .trainer-action-btn:disabled {
    cursor: not-allowed;
    opacity: 0.62;
  }

  @media (max-width: 760px) {
    .trainer-head,
    .trainer-form-actions {
      align-items: stretch;
      flex-direction: column;
    }

    .trainer-add-btn,
    .trainer-action-btn {
      width: 100%;
    }

    .trainer-form-grid {
      grid-template-columns: 1fr;
    }

    .trainer-session-calendar-layout {
      grid-template-columns: 1fr;
    }
  }
`;

const emptyForm = {
  name: "",
  email: "",
  phoneNumber: "",
  bio: "",
  specialties: "",
};

const getPhoneInputDigits = (phoneNumber = "") =>
  phoneNumber.replace(/^\+62/, "").replace(/^0/, "");

const normalizeIndonesianPhone = (value) => {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("62")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = digits.slice(1);
  return digits ? `+62${digits}` : "";
};

const formatTime = (value) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

const formatDateKey = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatReadableDate = (dateKey) => {
  if (!dateKey) return "Pilih tanggal";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "full",
  }).format(new Date(`${dateKey}T00:00:00`));
};

const buildCalendarDays = (monthDate) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const startDate = new Date(year, month, 1 - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    return {
      date,
      key: formatDateKey(date),
      isCurrentMonth: date.getMonth() === month,
    };
  });
};

const validateForm = (values) => {
  const errors = {};
  if (values.name.trim().length < 2) errors.name = "Nama trainer minimal 2 karakter.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = "Email trainer tidak valid.";
  if (!/^\+628[1-9][0-9]{6,9}$/.test(values.phoneNumber.trim())) {
    errors.phoneNumber = "No. HP harus format +628xxxxxxxx.";
  }
  if (values.bio.trim().length < 10) errors.bio = "Bio minimal 10 karakter.";
  if (values.bio.trim().length > 200) errors.bio = "Bio maksimal 200 karakter.";
  if (values.specialties.trim().length < 5) errors.specialties = "Spesialisasi minimal 5 karakter.";
  if (values.specialties.trim().length > 100) errors.specialties = "Spesialisasi maksimal 100 karakter.";
  return errors;
};

export default function TrainerPage() {
  const trainers = useTrainers();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState(null);
  const [values, setValues] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [image, setImage] = useState(null);
  const [imageError, setImageError] = useState("");
  const [sessionTrainer, setSessionTrainer] = useState(null);
  const [sessionCalendarMonth, setSessionCalendarMonth] = useState(() => new Date());
  const [selectedSessionDate, setSelectedSessionDate] = useState(formatDateKey(new Date()));

  const previewUrl = useMemo(() => {
    if (!image) return gymImage;
    return URL.createObjectURL(image);
  }, [image]);

  const displayedPreviewUrl = image ? previewUrl : editingTrainer?.image_url || gymImage;
  const sessionsByDate = useMemo(() => (
    trainers.sessions.reduce((grouped, session) => {
      const key = formatDateKey(session.start_time || session.startTime);
      if (!key) return grouped;
      return {
        ...grouped,
        [key]: [...(grouped[key] || []), session],
      };
    }, {})
  ), [trainers.sessions]);
  const calendarDays = useMemo(() => buildCalendarDays(sessionCalendarMonth), [sessionCalendarMonth]);
  const selectedDaySessions = sessionsByDate[selectedSessionDate] || [];
  const selectedBookedSessions = selectedDaySessions.filter((session) => String(session.status || "").toUpperCase() === "BOOKED");
  const selectedCancelledSessions = selectedDaySessions.filter((session) => String(session.status || "").toUpperCase() === "CANCELLED");
  const sessionMonthLabel = useMemo(() => (
    new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(sessionCalendarMonth)
  ), [sessionCalendarMonth]);

  const updateField = (field, value) => {
    if (field === "phoneNumber") {
      setValues((current) => ({ ...current, phoneNumber: normalizeIndonesianPhone(value) }));
      setErrors((current) => ({ ...current, phoneNumber: "" }));
      return;
    }

    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const resetForm = () => {
    setValues(emptyForm);
    setEditingTrainer(null);
    setErrors({});
    setImage(null);
    setImageError("");
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    setImageError("");
    if (!file) return;
    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
      setImageError("Foto harus JPG, PNG, atau WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError("Ukuran foto maksimal 5MB.");
      return;
    }
    setImage(file);
  };

  const handleOpenForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (trainer) => {
    setEditingTrainer(trainer);
    setValues({
      name: trainer.name || "",
      email: trainer.email || "",
      phoneNumber: trainer.phone_number || trainer.phoneNumber || "",
      bio: trainer.bio || "",
      specialties: trainer.specialties || "",
    });
    setErrors({});
    setImage(null);
    setImageError("");
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    resetForm();
  };

  const handleSubmit = async () => {
    const nextErrors = validateForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || imageError) return;

    const result = editingTrainer
      ? await trainers.updateTrainer(editingTrainer.id, { values, image })
      : await trainers.createTrainer({ values, image });
    if (result.ok) {
      handleCloseForm();
      trainers.fetchTrainers();
    }
  };

  const handleDelete = async (trainer) => {
    const confirmed = await confirmAction({
      confirmButtonColor: "#c73822",
      confirmButtonText: "Hapus",
      text: `Trainer "${trainer.name}" akan dihapus.`,
      title: "Hapus Trainer?",
    });
    if (!confirmed) return;
    const result = await trainers.deleteTrainer(trainer.id);
    if (result.ok) trainers.fetchTrainers();
  };

  const handleOpenSessions = async (trainer) => {
    setSessionTrainer(trainer);
    const result = await trainers.fetchTrainerSessions(trainer.id);
    const firstSession = result?.data?.[0];
    const firstSessionDate = firstSession?.start_time || firstSession?.startTime;
    if (firstSessionDate) {
      const date = new Date(firstSessionDate);
      setSessionCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1));
      setSelectedSessionDate(formatDateKey(date));
    } else {
      const now = new Date();
      setSessionCalendarMonth(new Date(now.getFullYear(), now.getMonth(), 1));
      setSelectedSessionDate(formatDateKey(now));
    }
  };

  const handleAdminCancelSession = async (session) => {
    const confirmed = await confirmAction({
      confirmButtonColor: "#c73822",
      confirmButtonText: "Cancel Booking",
      text: `Booking ${session.booked_by_name || session.member_name || session.user_name || "member"} akan dicancel oleh admin.`,
      title: "Cancel Booking Trainer?",
    });
    if (!confirmed) return;

    const result = await trainers.cancelTrainerSession(session.id);
    if (result.ok && sessionTrainer?.id) {
      await trainers.fetchTrainerSessions(sessionTrainer.id);
    }
  };

  return (
    <>
      <AdminLayout title="Trainer" subtitle="Kelola trainer dan jadwal sesi.">
        <style>{trainerStyles}</style>

        <div className="trainer-head">
          <div>
            <h2>Daftar Trainer</h2>
            <p>Tambah trainer, kontak, bio, spesialisasi, dan foto profil.</p>
          </div>
          <button className="trainer-add-btn" onClick={handleOpenForm} type="button">
            Tambah Trainer
          </button>
        </div>

        <div className="trainer-panel">
          <h2 className="trainer-panel-title">Daftar Trainer</h2>
          <div className="trainer-table-wrap">
            <table className="trainer-table">
              <thead>
                <tr>
                  <th>Foto</th>
                  <th>Nama</th>
                  <th>Email</th>
                  <th>No. HP</th>
                  <th>Bio</th>
                  <th>Spesialisasi</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {trainers.listLoading && (
                  <tr>
                    <td className="trainer-status" colSpan="7">Memuat data trainer...</td>
                  </tr>
                )}
                {!trainers.listLoading && trainers.listError && (
                  <tr>
                    <td className="trainer-status error" colSpan="7">{trainers.listError}</td>
                  </tr>
                )}
                {!trainers.listLoading && !trainers.listError && trainers.trainers.length === 0 && (
                  <tr>
                    <td className="trainer-status" colSpan="7">Belum ada trainer.</td>
                  </tr>
                )}
                {!trainers.listLoading && !trainers.listError && trainers.trainers.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <img className="trainer-thumb" src={item.image_url || gymImage} alt="" />
                    </td>
                    <td>{item.name}</td>
                    <td className="trainer-cell-muted">{item.email || "-"}</td>
                    <td>{item.phone_number || item.phoneNumber || "-"}</td>
                    <td className="trainer-bio">{item.bio || "-"}</td>
                    <td>{item.specialties || "-"}</td>
                    <td>
                      <div className="trainer-row-actions">
                        <button
                          className="trainer-row-action edit"
                          onClick={() => handleOpenSessions(item)}
                          type="button"
                        >
                          Detail
                        </button>
                        <button
                          className="trainer-row-action edit"
                          onClick={() => handleOpenEditForm(item)}
                          type="button"
                        >
                          Edit
                        </button>
                        <button
                          className="trainer-row-action delete"
                          disabled={trainers.deleteLoadingId === item.id}
                          onClick={() => handleDelete(item)}
                          type="button"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </AdminLayout>

      {isFormOpen && (
        <div className="trainer-modal-backdrop">
          <section className="trainer-modal" role="dialog" aria-modal="true">
            <div className="trainer-modal-head">
              <div>
                <h2>{editingTrainer ? "Edit Trainer" : "Tambah Trainer"}</h2>
                <p className="trainer-muted">
                  {editingTrainer ? "Perbarui data trainer." : "Lengkapi data trainer baru."}
                </p>
              </div>
              <button className="trainer-close-btn" onClick={handleCloseForm} type="button">x</button>
            </div>

            <div className="trainer-form-grid">
              <div>
                <label className="trainer-field">
                  <span>Nama Trainer</span>
                  <input
                    className="trainer-input"
                    value={values.name}
                    onChange={(event) => updateField("name", event.target.value)}
                  />
                </label>
                {errors.name && <p className="trainer-field-error">{errors.name}</p>}

                <label className="trainer-field">
                  <span>Email Trainer</span>
                  <input
                    className="trainer-input"
                    placeholder="trainer@example.com"
                    value={values.email}
                    onChange={(event) => updateField("email", event.target.value)}
                  />
                </label>
                {errors.email && <p className="trainer-field-error">{errors.email}</p>}

                <label className="trainer-field">
                  <span>No. HP</span>
                  <span className="trainer-phone-shell">
                    <span className="trainer-phone-prefix">+62</span>
                    <input
                      className="trainer-input"
                      placeholder="8123456789"
                      value={getPhoneInputDigits(values.phoneNumber)}
                      onChange={(event) => updateField("phoneNumber", event.target.value)}
                    />
                  </span>
                </label>
                {errors.phoneNumber && <p className="trainer-field-error">{errors.phoneNumber}</p>}

                <label className="trainer-field">
                  <span>Bio</span>
                  <textarea
                    className="trainer-input trainer-textarea"
                    placeholder="Coach berpengalaman untuk program strength dan conditioning."
                    value={values.bio}
                    onChange={(event) => updateField("bio", event.target.value)}
                  />
                </label>
                {errors.bio && <p className="trainer-field-error">{errors.bio}</p>}

                <label className="trainer-field">
                  <span>Spesialisasi</span>
                  <input
                    className="trainer-input"
                    placeholder="Strength training, fat loss, boxing"
                    value={values.specialties}
                    onChange={(event) => updateField("specialties", event.target.value)}
                  />
                </label>
                {errors.specialties && <p className="trainer-field-error">{errors.specialties}</p>}
              </div>

              <div>
                <p className="trainer-media-title">Foto Trainer</p>
                <label className="trainer-upload-box">
                  <input accept="image/png,image/jpeg,image/webp" onChange={handleImageChange} type="file" />
                  <strong>Klik untuk upload foto</strong>
                  <span>{editingTrainer ? "Kosongkan jika tidak diganti" : "PNG / JPG / WebP max 5MB"}</span>
                </label>
                {imageError && <p className="trainer-field-error">{imageError}</p>}

                <p className="trainer-media-title">Preview</p>
                <div className="trainer-preview">
                  <img src={displayedPreviewUrl} alt="" />
                </div>
              </div>
            </div>

            {(trainers.submitError || trainers.submitSuccessMessage || trainers.deleteError) && (
              <p className={trainers.submitError || trainers.deleteError ? "trainer-field-error" : "trainer-success"}>
                {trainers.submitError || trainers.deleteError || trainers.submitSuccessMessage}
              </p>
            )}

            <div className="trainer-form-actions">
              <button className="trainer-action-btn cancel" onClick={handleCloseForm} type="button">
                Batal
              </button>
              <button
                className="trainer-action-btn save"
                disabled={trainers.submitLoading}
                onClick={handleSubmit}
                type="button"
              >
                  {trainers.submitLoading ? "Menyimpan..." : editingTrainer ? "Simpan Perubahan" : "Simpan Trainer"}
              </button>
            </div>
          </section>
        </div>
      )}
      {sessionTrainer && (
        <div className="trainer-modal-backdrop">
          <section className="trainer-modal" role="dialog" aria-modal="true">
            <div className="trainer-modal-head">
              <div>
                <h2>Session Trainer</h2>
                <p className="trainer-muted">
                  {sessionTrainer.name} - daftar member yang booking trainer ini.
                </p>
              </div>
              <button className="trainer-close-btn" onClick={() => setSessionTrainer(null)} type="button">x</button>
            </div>

            {trainers.sessionLoading && <p className="trainer-status">Memuat sesi trainer...</p>}
            {!trainers.sessionLoading && trainers.sessionError && (
              <p className="trainer-status error">{trainers.sessionError}</p>
            )}
            {!trainers.sessionLoading && !trainers.sessionError && trainers.sessions.length === 0 && (
              <p className="trainer-status">Belum ada booking untuk trainer ini.</p>
            )}
            {!trainers.sessionLoading && !trainers.sessionError && trainers.sessions.length > 0 && (
              <div className="trainer-session-calendar-layout">
                <section className="trainer-session-calendar">
                  <div className="trainer-calendar-head">
                    <h3>{sessionMonthLabel}</h3>
                    <div className="trainer-calendar-nav">
                      <button
                        aria-label="Bulan sebelumnya"
                        onClick={() => setSessionCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
                        type="button"
                      >
                        ‹
                      </button>
                      <button
                        aria-label="Bulan berikutnya"
                        onClick={() => setSessionCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
                        type="button"
                      >
                        ›
                      </button>
                    </div>
                  </div>

                  <div className="trainer-calendar-weekdays">
                    {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((day) => (
                      <span key={day}>{day}</span>
                    ))}
                  </div>
                  <div className="trainer-calendar-grid">
                    {calendarDays.map((day) => {
                      const daySessions = sessionsByDate[day.key] || [];
                      const hasBooked = daySessions.some((session) => String(session.status || "").toUpperCase() === "BOOKED");
                      const hasCancelled = daySessions.some((session) => String(session.status || "").toUpperCase() === "CANCELLED");
                      const className = [
                        "trainer-calendar-day",
                        !day.isCurrentMonth ? "outside" : "",
                        daySessions.length > 0 ? "has-session" : "",
                        selectedSessionDate === day.key ? "selected" : "",
                      ].filter(Boolean).join(" ");

                      return (
                        <button
                          className={className}
                          key={day.key}
                          onClick={() => {
                            setSelectedSessionDate(day.key);
                            setSessionCalendarMonth(new Date(day.date.getFullYear(), day.date.getMonth(), 1));
                          }}
                          type="button"
                        >
                          <span>{day.date.getDate()}</span>
                          {(hasBooked || hasCancelled) && (
                            <span className="trainer-day-badges">
                              {hasBooked && <span className="trainer-day-badge booked" />}
                              {hasCancelled && <span className="trainer-day-badge cancelled" />}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section className="trainer-session-detail">
                  <h3 className="trainer-detail-title">{formatReadableDate(selectedSessionDate)}</h3>

                  <div className="trainer-session-section">
                    <h3>Booked</h3>
                    {selectedBookedSessions.length === 0 ? (
                      <p className="trainer-status">Tidak ada session booked di tanggal ini.</p>
                    ) : (
                      <div className="trainer-session-list">
                        {selectedBookedSessions.map((session) => (
                          <article className="trainer-session-card" key={session.id}>
                            <span className="trainer-session-label booked">BOOKED</span>
                            <strong>{formatTime(session.start_time || session.startTime)} - {formatTime(session.end_time || session.endTime)}</strong>
                            <span>Member: {session.booked_by_name || session.member_name || session.user_name || "-"}</span>
                            <span>Package: {session.catalog_name || session.package_name || session.catalog_code || "-"}</span>
                            <button
                              className="trainer-session-cancel"
                              onClick={() => handleAdminCancelSession(session)}
                              type="button"
                            >
                              Cancel Booking
                            </button>
                          </article>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="trainer-session-section">
                    <h3>Cancelled</h3>
                    {selectedCancelledSessions.length === 0 ? (
                      <p className="trainer-status">Tidak ada session cancelled di tanggal ini.</p>
                    ) : (
                      <div className="trainer-session-list">
                        {selectedCancelledSessions.map((session) => (
                          <article className="trainer-session-card" key={session.id}>
                            <span className="trainer-session-label cancelled">CANCELLED</span>
                            <strong>{formatTime(session.start_time || session.startTime)} - {formatTime(session.end_time || session.endTime)}</strong>
                            <span>Member: {session.booked_by_name || session.member_name || session.user_name || "-"}</span>
                            <span>Package: {session.catalog_name || session.package_name || session.catalog_code || "-"}</span>
                          </article>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}
