import { useState } from "react";
import { useNavigate } from "react-router";
import AdminSidebar, { Icon } from="../../../components/AdminSidebar.jsx";
import api from "../../../../../services/authApi";
import { useAuth } from "../../../../../hooks/useAuth";
import gymImage from="../../../../../assets/auth/signup-gym.jpg";
import useNewsActions from "./hooks/useNewsActions";
import useNewsForm from "./hooks/useNewsForm";
import useNewsImageUpload from "./hooks/useNewsImageUpload";
import { confirmAction } from "../../../../../utils/sweetAlert";

const newsUpdateStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

html,
body,
#root {
  width: 100%;
  min-height: 100%;
  margin: 0;
  overflow-x: hidden;
}

/* =========================
   Layout
========================= */

.admin-news-page {
  min-height: 100vh;
  width: 100%;
  display: grid;
  grid-template-columns: 292px minmax(0, 1fr);
  background: #f4f5f8;
  font-family: "DM Sans", sans-serif;
  color: #05050c;
  overflow-x: hidden;
}

.admin-news-main {
  min-width: 0;
  width: 100%;
  padding: 28px 18px;
  overflow-x: hidden;
}

/* =========================
   Topbar
========================= */

.admin-news-topbar {
  min-height: 88px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0 24px;
}

.admin-news-title h1 {
  margin: 0 0 16px;
  font-size: 30px;
  line-height: 1;
  font-weight: 800;
}

.admin-news-title p {
  margin: 0;
  font-size: 14px;
}

/* =========================
   Panel
========================= */

.news-panel {
  width: 100%;
  padding: 24px;
  background: #ffffff;
  border-radius: 14px;
  overflow: hidden;
}

.news-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 22px;
}

.news-panel-head h2 {
  margin: 0 0 6px;
}

.news-panel-head p {
  margin: 0;
  font-size: 12px;
  color: #747884;
}

/* =========================
   Buttons
========================= */

.news-add-btn,
.news-action-btn,
.news-row-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  border-radius: 8px;
  cursor: pointer;

  font: inherit;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}

.news-add-btn,
.news-action-btn.post {
  background: #ff7314;
  border: 1px solid #ff7314;
  color: #ffffff;
}

.news-add-btn {
  height: 44px;
  padding: 0 18px;
}

.news-action-btn {
  height: 48px;
  min-width: 140px;
}

.news-action-btn.delete {
  background: #ffffff;
  border: 1px solid #1b1d29;
  color: #11131d;
}

/* =========================
   Table
========================= */

.news-table-wrap {
  background: #ffffff;
  border-radius: 10px;
  overflow-x: auto;
  padding: 24px;
}

.news-table {
  width: 100%;
  min-width: 900px;
  border-collapse: collapse;
}

.news-table th {
  background: #ffe08d;
  color: #111111;
  font-size: 14px;
  font-weight: 700;
  padding: 16px 18px;
  text-align: center;
  text-transform: none;
}

.news-table td {
  border-bottom: 0;
  color: #111111;
  font-size: 13px;
  font-weight: 500;
  padding: 18px;
  text-align: center;
  vertical-align: middle;
}

.news-table tbody tr {
  height: 58px;
}

.news-thumb {
  width: 64px;
  height: 48px;
  object-fit: cover;

  border-radius: 8px;
  background: #eceef3;
}

.news-title-cell strong {
  display: block;
  margin-bottom: 5px;
}

.news-title-cell span {
  display: block;
  max-width: 520px;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  color: #6b7280;
}

.news-row-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.news-row-btn {
  height: 34px;
  padding: 0 10px;
}

.news-row-btn.edit {
  background: #fff4d8;
  border: 1px solid #ffd978;
  color: #080478;
}

.news-row-btn.delete {
  background: #ffffff;
  border: 1px solid #c73822;
  color: #c73822;
}

/* =========================
   Status
========================= */

.news-table-status,
.news-empty {
  padding: 28px;
  text-align: center;
  color: #6b7280;
}

.error,
.news-field-error {
  color: #c73822;
}

.news-status-text {
  text-align: right;
  font-size: 12px;
  color: #080478;
}

/* =========================
   Modal
========================= */

.news-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 28px;

  background: rgba(8, 4, 120, 0.54);
}

.news-modal {
  width: min(100%, 980px);
  max-height: calc(100vh - 56px);

  padding: 24px;
  overflow: auto;

  background: #ffffff;
  border-radius: 14px;
  color: #05050c;
  font-family: "DM Sans", Arial, sans-serif;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.28);
}

/* =========================
   Card Header
========================= */

.news-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 22px;
}

.news-card-title {
  display: flex;
  align-items: center;
  gap: 14px;
}

.news-card-title h2 {
  margin: 0 0 6px;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.15;
}

.news-card-title p {
  margin: 0;
  color: #6b7280;
  font-size: 13px;
  font-weight: 500;
}

.news-head-icon {
  width: 28px;
  height: 28px;

  display: grid;
  place-items: center;

  background: #ffd978;
  color: #080478;
  border-radius: 6px;
}

.news-close-btn {
  width: 36px;
  height: 36px;

  border: 0;
  border-radius: 50%;
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  font-weight: 800;
}

/* =========================
   Form
========================= */

.news-field {
  display: grid;
  gap: 10px;
  margin-bottom: 24px;
}

.news-field span,
.news-media-title {
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0;
  text-transform: uppercase;
}

.news-input,
.news-textarea {
  width: 100%;
  border: 0;
  outline: 0;

  background: #f4f5f8;
  border-radius: 8px;
  box-shadow: 0 4px 5px rgba(17, 18, 26, 0.24);

  font: inherit;
  font-size: 13px;
  font-weight: 700;

  padding: 0 16px;
}

.news-input {
  height: 52px;
}

.news-textarea {
  min-height: 150px;
  padding: 18px 16px;
  resize: vertical;
}

/* =========================
   Media Upload
========================= */

.news-media-row {
  display: grid;
  grid-template-columns: minmax(260px, 0.9fr) minmax(280px, 1fr);
  gap: 18px;

  margin-bottom: 28px;
}

.news-upload-box {
  position: relative;

  height: 240px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  text-align: center;

  background: #fff4d8;
  border: 1.5px dashed #080478;
  border-radius: 12px;
}

.news-upload-box input {
  position: absolute;
  opacity: 0;

  width: 1px;
  height: 1px;
}

.news-upload-box strong {
  font-size: 14px;
  font-weight: 900;
  line-height: 1.2;
}

.news-upload-box span {
  font-size: 13px;
  font-weight: 700;
  line-height: 1.35;
}

/* =========================
   Preview
========================= */

.news-preview {
  position: relative;
  overflow: hidden;

  height: 240px;

  background: #0c0d14;
  border-radius: 12px;
}

.news-preview img {
  width: 100%;
  height: 100%;

  object-fit: cover;
  opacity: 0.52;
}

.news-preview-content {
  position: absolute;
  left: 24px;
  right: 20px;
  bottom: 24px;

  color: #ffffff;
}

.news-pill {
  display: inline-block;

  margin-bottom: 70px;
  padding: 7px 14px;

  background: #ff7314;
  border-radius: 999px;

  font-size: 10px;
  font-weight: 800;
}

.news-preview h3 {
  margin: 0 0 8px;
  font-size: 23px;
}

.news-preview p {
  margin: 0;

  font-size: 11px;
  line-height: 1.45;
  color: #e5e7eb;
}

/* =========================
   Form Actions
========================= */

.news-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* =========================
   Responsive
========================= */

@media (max-width: 1040px) {
  .admin-news-page {
    grid-template-columns: 92px minmax(0, 1fr);
  }

  .admin-news-main {
    padding: 24px 16px;
  }
}

@media (max-width: 680px) {
  .admin-news-page {
    display: block;
    width: 100%;
  }

  .admin-news-main {
    padding: 20px 12px;
  }

  .admin-news-topbar {
    padding: 0 4px 18px;
    align-items: center;
  }

  .admin-news-title h1 {
    font-size: 24px;
  }

  .news-panel-head {
    flex-direction: column;
    align-items: stretch;
  }

  .news-media-row {
    grid-template-columns: 1fr;
  }

  .news-form-actions {
    flex-direction: column;
  }

  .news-action-btn,
  .news-add-btn {
    width: 100%;
  }
}
`;



const formatDate = (value) => {
  if (!value) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

export default function NewsUpdatePage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const newsForm = useNewsForm();
  const newsImage = useNewsImageUpload();
  const newsActions = useNewsActions();

  const handleLogout = async () => {
    await logout();
    navigate("/sign-in");
  };

  const handleReset = () => {
    newsForm.resetForm();
    newsImage.resetImage();
  };

  const handleOpenForm = () => {
    setEditingNews(null);
    handleReset();
    setIsFormOpen(true);
  };

  const handleEdit = async (item) => {
    let detail = item;
    try {
      const response = await api.get(`/news/${item.id}`);
      detail = response.data?.data || item;
    } catch {
      // Keep table data if detail fetch fails.
    }

    setEditingNews(detail);
    newsForm.resetForm({
      title: detail.title || "",
      description: detail.content || detail.summary || "",
    });
    newsImage.resetImage();
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingNews(null);
  };

  const handleSubmit = async () => {
    if (!newsForm.validate()) return;

    const result = editingNews
      ? await newsActions.updateNews({ id: editingNews.id, values: newsForm.values, image: newsImage.file })
      : await newsActions.createNews({ values: newsForm.values, image: newsImage.file });

    if (result.ok) {
      handleReset();
      handleCloseForm();
      newsActions.fetchNews();
    }
  };

  const handleDelete = async (item) => {
    const confirmed = await confirmAction({
      confirmButtonColor: "#c73822",
      confirmButtonText: "Hapus",
      text: `Berita "${item.title}" akan dihapus.`,
      title: "Hapus Berita?",
    });
    if (!confirmed) return;

    const result = await newsActions.deleteNews(item.id);
    if (result.ok) newsActions.fetchNews();
  };

  const previewImage = newsImage.previewUrl || editingNews?.image_url || gymImage;

  return (
    <>
      <style>{newsUpdateStyles}</style>
      <main className="admin-news-page">
        <AdminSidebar onLogout={handleLogout} />
        <section className="admin-news-main">
          <header className="admin-news-topbar">
            <div className="admin-news-title">
              <h1>News Update</h1>
              <p>Selamat Datang Kembali, Admin</p>
            </div>
          </header>

          <section className="news-panel">
            <div className="news-panel-head">
              <div>
                <h2>Daftar News</h2>
                <p>Kelola berita yang ditampilkan untuk member.</p>
              </div>
              <button className="news-add-btn" onClick={handleOpenForm} type="button">
                Tambah News
              </button>
            </div>

            <div className="news-table-wrap">
              <table className="news-table">
                <thead>
                  <tr>
                    <th>Gambar</th>
                    <th>Berita</th>
                    <th>Tanggal</th>
                    <th>Author</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {newsActions.listLoading && (
                    <tr>
                      <td className="news-table-status" colSpan="5">Memuat daftar berita...</td>
                    </tr>
                  )}
                  {!newsActions.listLoading && newsActions.listError && (
                    <tr>
                      <td className="news-table-status error" colSpan="5">{newsActions.listError}</td>
                    </tr>
                  )}
                  {!newsActions.listLoading && !newsActions.listError && newsActions.deleteError && (
                    <tr>
                      <td className="news-table-status error" colSpan="5">{newsActions.deleteError}</td>
                    </tr>
                  )}
                  {!newsActions.listLoading && !newsActions.listError && newsActions.news.length === 0 && (
                    <tr>
                      <td className="news-empty" colSpan="5">Belum ada berita.</td>
                    </tr>
                  )}
                  {!newsActions.listLoading && !newsActions.listError && newsActions.news.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <img className="news-thumb" src={item.image_url || gymImage} alt="" />
                      </td>
                      <td className="news-title-cell">
                        <strong>{item.title}</strong>
                        <span>{item.summary || item.content}</span>
                      </td>
                      <td>{formatDate(item.created_at)}</td>
                      <td>{item.author || "-"}</td>
                      <td>
                        <div className="news-row-actions">
                          <button
                            className="news-row-btn edit"
                            onClick={() => handleEdit(item)}
                            type="button"
                          >
                            Edit
                          </button>
                          <button
                            className="news-row-btn delete"
                            disabled={newsActions.deleteLoadingId === item.id}
                            onClick={() => handleDelete(item)}
                            type="button"
                          >
                            {newsActions.deleteLoadingId === item.id ? "..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </section>
      </main>

      {isFormOpen && (
        <div className="news-modal-backdrop">
          <section className="news-modal" role="dialog" aria-modal="true">
            <div className="news-card-head">
              <div className="news-card-title">
                <span className="news-head-icon">
                  <Icon>
                    <rect x="5" y="5" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
                  </Icon>
                </span>
                <div>
                  <h2>{editingNews ? "Edit Berita" : "Update Berita"}</h2>
                  <p>{editingNews ? "Perbarui berita" : "Publikasikan info terbaru kepada member"}</p>
                </div>
              </div>
              <button className="news-close-btn" onClick={handleCloseForm} type="button">x</button>
            </div>

            <label className="news-field">
              <span>Judul Berita</span>
              <input
                className="news-input"
                value={newsForm.values.title}
                onChange={(event) => newsForm.updateField("title", event.target.value)}
              />
            </label>
            {newsForm.errors.title && <p className="news-field-error">{newsForm.errors.title}</p>}

            <label className="news-field">
              <span>Deskripsi</span>
              <textarea
                className="news-textarea"
                value={newsForm.values.description}
                onChange={(event) => newsForm.updateField("description", event.target.value)}
              />
            </label>
            {newsForm.errors.description && <p className="news-field-error">{newsForm.errors.description}</p>}

            <div className="news-media-row">
              <div>
                <p className="news-media-title">Upload Gambar</p>
                <label className="news-upload-box" onDragOver={newsImage.handleDragOver} onDrop={newsImage.handleDrop}>
                  <input accept="image/png,image/jpeg" onChange={newsImage.handleInputChange} type="file" />
                  <strong>Klik atau drag gambar</strong>
                  <span>PNG / JPG max 2MB</span>
                </label>
                {newsImage.error && <p className="news-field-error">{newsImage.error}</p>}
              </div>
              <div>
                <p className="news-media-title">Preview</p>
                <article className="news-preview">
                  <img src={previewImage} alt="" />
                  <div className="news-preview-content">
                    <span className="news-pill">Promo</span>
                    <h3>{newsForm.values.title || "Judul Berita"}</h3>
                    <p>{newsForm.values.description || "Deskripsi berita akan tampil di sini."}</p>
                  </div>
                </article>
              </div>
            </div>

            {(newsActions.submitError || newsActions.submitSuccessMessage) && (
              <p className={newsActions.submitError ? "news-field-error" : "news-status-text"}>
                {newsActions.submitError || newsActions.submitSuccessMessage}
              </p>
            )}

            <div className="news-form-actions">
              <button className="news-action-btn delete" onClick={handleReset} type="button">Reset</button>
              <button className="news-action-btn post" disabled={newsActions.submitLoading} onClick={handleSubmit} type="button">
                {newsActions.submitLoading ? "Menyimpan..." : editingNews ? "Simpan Edit" : "Post Berita"}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
