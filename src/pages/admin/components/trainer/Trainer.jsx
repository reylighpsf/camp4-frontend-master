import { useMemo, useState } from "react";
import AdminLayout from "../../../../components/admin/AdminLayout";
import gymImage from "../../../../assets/auth/signup-gym.jpg";
import useTrainers from "./hooks/useTrainers";

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
    border: 1px solid #eceef3;
    border-radius: 12px;
    color: #05050c;
    overflow: hidden;
  }

  .trainer-panel-title {
    color: #05050c;
    font-size: 18px;
    font-weight: 800;
    margin: 0;
    padding: 20px 24px 14px;
    text-transform: uppercase;
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

  .trainer-table {
    border-collapse: collapse;
    min-width: 760px;
    width: 100%;
  }

  .trainer-table th {
    background: #f0f1f5;
    color: #30333d;
    font-size: 11px;
    font-weight: 800;
    padding: 14px 16px;
    text-align: left;
    text-transform: uppercase;
  }

  .trainer-table td {
    border-top: 1px solid #eceef3;
    color: #05050c;
    font-size: 13px;
    padding: 18px 16px;
    vertical-align: middle;
  }

  .trainer-table th:first-child,
  .trainer-table td:first-child {
    padding-left: 16px;
    width: 70px;
  }

  .trainer-table th:last-child,
  .trainer-table td:last-child {
    padding-right: 14px;
    width: 94px;
  }

  .trainer-thumb {
    background: #eceef3;
    border-radius: 50%;
    display: block;
    height: 40px;
    object-fit: cover;
    width: 40px;
  }

  .trainer-bio {
    max-width: 260px;
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
    gap: 6px;
  }

  .trainer-icon-btn {
    align-items: center;
    border: 0;
    border-radius: 7px;
    color: #fff;
    cursor: pointer;
    display: inline-flex;
    height: 32px;
    justify-content: center;
    padding: 0;
    width: 32px;
  }

  .trainer-icon-btn.edit {
    background: #080478;
  }

  .trainer-icon-btn.delete {
    background: #c7191f;
  }

  .trainer-icon-btn svg {
    height: 18px;
    width: 18px;
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
    margin: 0 0 6px;
  }

  .trainer-close-btn {
    border: 0;
    border-radius: 50%;
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
    font-weight: 800;
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
  }
`;

const emptyForm = {
  name: "",
  specialization: "",
  price: "",
};

const validateForm = (values) => {
  const errors = {};
  if (values.name.trim().length < 2) errors.name = "Nama trainer minimal 2 karakter.";
  if (values.specialization.trim().length < 3) errors.specialization = "Spesialis latihan wajib diisi.";
  if (!values.price.trim()) errors.price = "Harga per sesi wajib diisi.";
  return errors;
};

const parseTrainerBio = (bio = "") => {
  const specialization = bio.match(/Spesialis:\s*(.+)/i)?.[1]?.trim() || bio || "-";
  const price = bio.match(/Harga per sesi:\s*(.+)/i)?.[1]?.trim() || "-";
  return { specialization, price };
};

const formatTrainerPrice = (value) => {
  const amount = Number(String(value).replace(/[^\d]/g, ""));
  if (!amount) return value || "-";
  return `Rp. ${amount.toLocaleString("id-ID")}`;
};

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 19h4L19.5 8.5a2.1 2.1 0 0 0-3-3L6 16v3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M14.5 7.5l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 8h8M10 11v5M14 11v5M9 6h6l.5 2H18v11H6V8h2.5L9 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function TrainerPage() {
  const trainers = useTrainers();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [values, setValues] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [image, setImage] = useState(null);
  const [imageError, setImageError] = useState("");

  const previewUrl = useMemo(() => {
    if (!image) return gymImage;
    return URL.createObjectURL(image);
  }, [image]);

  const updateField = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const resetForm = () => {
    setValues(emptyForm);
    setErrors({});
    setImage(null);
    setImageError("");
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    setImageError("");
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setImageError("Foto harus JPG atau PNG.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setImageError("Ukuran foto maksimal 2MB.");
      return;
    }
    setImage(file);
  };

  const handleOpenForm = () => {
    resetForm();
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

    const result = await trainers.createTrainer({ values, image });
    if (result.ok) {
      handleCloseForm();
      trainers.fetchTrainers();
    }
  };

  return (
    <>
      <AdminLayout title="Trainer" subtitle="Kelola trainer dan jadwal sesi.">
        <style>{trainerStyles}</style>

        <div className="trainer-head">
          <div>
            <h2>Daftar Trainer</h2>
            <p>Tambah trainer, spesialis latihan, harga sesi, dan foto profil.</p>
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
                  <th>Spesialisasi</th>
                  <th>Harga / Sesi</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {trainers.listLoading && (
                  <tr>
                    <td className="trainer-status" colSpan="5">Memuat data trainer...</td>
                  </tr>
                )}
                {!trainers.listLoading && trainers.listError && (
                  <tr>
                    <td className="trainer-status error" colSpan="5">{trainers.listError}</td>
                  </tr>
                )}
                {!trainers.listLoading && !trainers.listError && trainers.trainers.length === 0 && (
                  <tr>
                    <td className="trainer-status" colSpan="5">Belum ada trainer.</td>
                  </tr>
                )}
                {!trainers.listLoading && !trainers.listError && trainers.trainers.map((item) => {
                  const detail = parseTrainerBio(item.bio);

                  return (
                    <tr key={item.id}>
                      <td>
                        <img className="trainer-thumb" src={item.image_url || gymImage} alt="" />
                      </td>
                      <td>{item.name}</td>
                      <td>{detail.specialization}</td>
                      <td>{formatTrainerPrice(detail.price)}</td>
                      <td>
                        <div className="trainer-row-actions">
                          <button className="trainer-icon-btn edit" type="button" aria-label="Edit trainer">
                            <EditIcon />
                          </button>
                          <button className="trainer-icon-btn delete" type="button" aria-label="Hapus trainer">
                            <DeleteIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
                <h2>Tambah Trainer</h2>
                <p className="trainer-muted">Lengkapi data trainer baru.</p>
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
                  <span>Spesialis Latihan</span>
                  <input
                    className="trainer-input"
                    placeholder="Strength training, fat loss, boxing"
                    value={values.specialization}
                    onChange={(event) => updateField("specialization", event.target.value)}
                  />
                </label>
                {errors.specialization && <p className="trainer-field-error">{errors.specialization}</p>}

                <label className="trainer-field">
                  <span>Harga Per Sesi</span>
                  <input
                    className="trainer-input"
                    placeholder="150000"
                    value={values.price}
                    onChange={(event) => updateField("price", event.target.value)}
                  />
                </label>
                {errors.price && <p className="trainer-field-error">{errors.price}</p>}
              </div>

              <div>
                <p className="trainer-media-title">Foto Trainer</p>
                <label className="trainer-upload-box">
                  <input accept="image/png,image/jpeg" onChange={handleImageChange} type="file" />
                  <strong>Klik untuk upload foto</strong>
                  <span>PNG / JPG max 2MB</span>
                </label>
                {imageError && <p className="trainer-field-error">{imageError}</p>}

                <p className="trainer-media-title">Preview</p>
                <div className="trainer-preview">
                  <img src={previewUrl} alt="" />
                </div>
              </div>
            </div>

            {(trainers.submitError || trainers.submitSuccessMessage) && (
              <p className={trainers.submitError ? "trainer-field-error" : "trainer-success"}>
                {trainers.submitError || trainers.submitSuccessMessage}
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
                {trainers.submitLoading ? "Menyimpan..." : "Simpan Trainer"}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
