import AdminLayout from "../../../components/AdminLayout";
import { formatCurrency } from "./hooks/catalogConstants";
import useCatalogManagement from "./hooks/useCatalogManagement";

function CatalogManagementPage({ family = "MEMBERSHIP" }) {
  const {
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
  } = useCatalogManagement(family);

  return (
    <AdminLayout title={page.title} subtitle={page.subtitle}>
      <style>{catalogStyles}</style>

      {error && <div className="catalog-alert error">{error}</div>}
      {message && <div className="catalog-alert success">{message}</div>}

      <section className="catalog-grid">
        <section className="catalog-list-panel">
          <div className="catalog-list-head">
            <div>
              <h2>{page.heading}</h2>
            </div>
            <div className="catalog-head-actions">
              <button className="catalog-primary-btn" onClick={openCreateForm} type="button">
                {page.createButton}
              </button>
              <button className="catalog-secondary-btn" disabled={loading} onClick={fetchCatalogs} type="button">
                {loading ? "Memuat..." : "Refresh"}
              </button>
            </div>
          </div>

          <section className="catalog-family">
              <h3>{family.replace("_", " ")}</h3>
              <div className="catalog-table-wrap">
                <table className="catalog-table">
                  <thead>
                    <tr>
                      <th>Catalog</th>
                      <th>Detail</th>
                      <th>Prices</th>
                      <th>Status</th>
                      <th>Urutan</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      <tr>
                        <td className="catalog-empty" colSpan="6">Memuat catalog...</td>
                      </tr>
                    )}
                    {!loading && familyCatalogs.length === 0 && (
                      <tr>
                        <td className="catalog-empty" colSpan="6">Belum ada catalog.</td>
                      </tr>
                    )}
                    {!loading && familyCatalogs.map((item, index) => (
                      <tr key={item.code}>
                        <td>
                          <strong>{item.name}</strong>
                          <span>{item.code}</span>
                        </td>
                        <td>
                          <span>{item.duration_days ? `${item.duration_days} hari` : "-"}</span>
                          <span>{item.session_count ? `${item.session_count} sesi` : "-"}</span>
                          <span>{item.group_size ? `${item.group_size} orang` : "-"}</span>
                        </td>
                        <td>
                          <div className="catalog-prices">
                            {(item.prices || []).length === 0 && <span>-</span>}
                            {(item.prices || []).map((price) => (
                              <span key={price.tier_code}>
                                {price.tier_name || price.tier_code}: {formatCurrency(price.price)}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <span className={`catalog-status ${item.is_active ? "active" : "inactive"}`}>
                            {item.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>
                          <div className="catalog-order-cell">
                            <div className="catalog-order-actions" aria-label={`Ubah urutan ${item.name}`}>
                              <button
                                aria-label={`Naikkan ${item.name}`}
                                className="move"
                                disabled={index === 0 || actionLoading === `reorder-${item.code}`}
                                onClick={() => moveCatalog(item, -1)}
                                title="Naik"
                                type="button"
                              >
                                ↑
                              </button>
                              <button
                                aria-label={`Turunkan ${item.name}`}
                                className="move"
                                disabled={index === familyCatalogs.length - 1 || actionLoading === `reorder-${item.code}`}
                                onClick={() => moveCatalog(item, 1)}
                                title="Turun"
                                type="button"
                              >
                                ↓
                              </button>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="catalog-actions">
                            <div className="catalog-row-actions">
                              <button className="edit" onClick={() => startEdit(item)} type="button">Edit</button>
                              <button
                                className="delete"
                                disabled={actionLoading === `delete-${item.code}`}
                                onClick={() => deleteCatalog(item)}
                                type="button"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
        </section>
      </section>

      {isFormOpen && (
        <div className="catalog-modal-backdrop">
          <section className="catalog-modal" role="dialog" aria-modal="true" aria-labelledby="catalog-form-title">
            <form className="catalog-form" onSubmit={handleSubmit}>
              <div className="catalog-form-head">
                <div>
                  <h2 id="catalog-form-title">{editingCode ? `Edit ${page.modalTitle}` : page.createButton}</h2>
                  <p>Lengkapi data catalog sesuai halaman yang sedang aktif.</p>
                </div>
                <button className="catalog-close-btn" onClick={resetForm} type="button" aria-label="Tutup form">
                  x
                </button>
              </div>

              <div className="catalog-form-fields">
                <label className="catalog-field">
                  Code
                  <input
                    disabled={Boolean(editingCode)}
                    value={form.code}
                    onChange={(event) => updateField("code", event.target.value)}
                    placeholder={page.codePlaceholder}
                  />
                </label>
                <label className="catalog-field">
                  Family
                  <input disabled value={family.replace("_", " ")} readOnly />
                </label>
                <label className="catalog-field catalog-field-wide">
                  Name
                  <input value={form.name} onChange={(event) => updateField("name", event.target.value)} placeholder="Membership Monthly" />
                </label>
                <label className="catalog-field catalog-field-wide">
                  Description
                  <textarea value={form.description} onChange={(event) => updateField("description", event.target.value)} placeholder="Deskripsi catalog" />
                </label>
                {family !== "MEMBERSHIP" && (
                  <>
                    <label className="catalog-field">
                      Group Size
                      <input type="number" min="1" value={form.groupSize} onChange={(event) => updateField("groupSize", event.target.value)} />
                    </label>
                    <label className="catalog-field">
                      Session Count
                      <input type="number" min="1" value={form.sessionCount} onChange={(event) => updateField("sessionCount", event.target.value)} />
                    </label>
                  </>
                )}
                <label className="catalog-field">
                  Duration Days
                  <input type="number" min="1" value={form.durationDays} onChange={(event) => updateField("durationDays", event.target.value)} />
                </label>
                <label className="catalog-check">
                  <input checked={form.isActive} onChange={(event) => updateField("isActive", event.target.checked)} type="checkbox" />
                  Active
                </label>
                <fieldset className="catalog-price-fields">
                  <legend>Harga Tier</legend>
                  {form.prices.map((price) => (
                    <label className="catalog-field" key={price.tierCode}>
                      {price.tierName || price.tierCode}
                      <input
                        min="0"
                        onChange={(event) => updatePrice(price.tierCode, event.target.value)}
                        placeholder="0"
                        type="number"
                        value={price.price}
                      />
                    </label>
                  ))}
                </fieldset>
              </div>

              <div className="catalog-form-actions">
                <button className="catalog-secondary-btn" onClick={resetForm} type="button">
                  Batal
                </button>
                <button className="catalog-submit-btn" disabled={submitLoading} type="submit">
                  {submitLoading ? "Menyimpan..." : editingCode ? "Simpan Perubahan" : page.createButton}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </AdminLayout>
  );
}

const catalogStyles = `
  .catalog-alert {
    border-radius: 8px;
    font-size: 13px;
    font-weight: 800;
    margin-bottom: 16px;
    padding: 12px 14px;
  }

  .catalog-alert.error {
    background: #fff1f0;
    color: #c73822;
  }

  .catalog-alert.success {
    background: #edfdf3;
    color: #16794c;
  }

  .catalog-grid {
    display: block;
  }

  .catalog-list-panel {
    background: #fff;
    border: 1px solid #eceef3;
    border-radius: 8px;
    padding: 20px;
  }

  .catalog-modal-backdrop {
    align-items: center;
    background: rgba(17, 19, 29, .54);
    display: flex;
    inset: 0;
    justify-content: center;
    padding: 22px;
    position: fixed;
    z-index: 1000;
  }

  .catalog-modal {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 24px 70px rgba(17, 19, 29, .28);
    max-height: calc(100vh - 44px);
    overflow-y: auto;
    padding: 22px;
    width: min(720px, 100%);
  }

  .catalog-form {
    display: block;
  }

  .catalog-form-head,
  .catalog-list-head {
    align-items: start;
    display: flex;
    gap: 14px;
    justify-content: space-between;
    margin-bottom: 18px;
  }

  .catalog-form h2,
  .catalog-list-panel h2 {
    color: #080478;
    font-size: 18px;
    margin: 0 0 6px;
  }

  .catalog-form p {
    color: #6b7280;
    font-size: 12px;
    font-weight: 800;
    line-height: 1.35;
    margin: 0;
  }

  .catalog-head-actions,
  .catalog-form-actions {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: flex-end;
  }

  .catalog-form-fields {
    display: grid;
    gap: 13px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .catalog-field,
  .catalog-check {
    color: #30333d;
    display: grid;
    font-size: 11px;
    font-weight: 900;
    gap: 7px;
    text-transform: uppercase;
  }

  .catalog-field-wide {
    grid-column: 1 / -1;
  }

  .catalog-field input,
  .catalog-field select,
  .catalog-field textarea {
    border: 1px solid #d8dbe6;
    border-radius: 8px;
    font: inherit;
    font-size: 13px;
    font-weight: 700;
    min-height: 40px;
    padding: 0 11px;
    text-transform: none;
    width: 100%;
  }

  .catalog-field textarea {
    min-height: 88px;
    padding: 11px;
    resize: vertical;
  }

  .catalog-field input:disabled {
    background: #f4f5f8;
    color: #6b7280;
  }

  .catalog-check {
    align-items: center;
    align-self: end;
    display: flex;
    min-height: 40px;
  }

  .catalog-price-fields {
    border: 1px solid #d8dbe6;
    border-radius: 8px;
    display: grid;
    gap: 13px;
    grid-column: 1 / -1;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin: 0;
    padding: 14px;
  }

  .catalog-price-fields legend {
    color: #30333d;
    font-size: 11px;
    font-weight: 900;
    padding: 0 6px;
    text-transform: uppercase;
  }

  .catalog-submit-btn,
  .catalog-secondary-btn,
  .catalog-actions button {
    border-radius: 8px;
    cursor: pointer;
    font: inherit;
    font-size: 12px;
    font-weight: 900;
    min-height: 34px;
    padding: 0 12px;
    text-transform: uppercase;
  }

  .catalog-submit-btn {
    background: #ff7314;
    border: 1px solid #ff7314;
    color: #fff;
  }

  .catalog-primary-btn {
    background: #ff7314;
    border: 1px solid #ff7314;
    border-radius: 8px;
    color: #fff;
    cursor: pointer;
    font: inherit;
    font-size: 12px;
    font-weight: 900;
    min-height: 36px;
    padding: 0 12px;
    text-transform: uppercase;
  }

  .catalog-secondary-btn {
    background: #fff;
    border: 1px solid #11131d;
    color: #11131d;
    flex: 0 0 auto;
  }

  .catalog-form-actions {
    border-top: 1px solid #eceef3;
    margin-top: 18px;
    padding-top: 16px;
  }

  .catalog-close-btn {
    align-items: center;
    background: #f4f5f8;
    border: 1px solid #d8dbe6;
    border-radius: 8px;
    color: #11131d;
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    font: inherit;
    font-size: 16px;
    font-weight: 900;
    height: 34px;
    justify-content: center;
    line-height: 1;
    width: 34px;
  }

  .catalog-family + .catalog-family {
    margin-top: 24px;
  }

  .catalog-family h3 {
    color: #11131d;
    font-size: 13px;
    font-weight: 900;
    margin: 0 0 10px;
  }

  .catalog-table-wrap {
    background: #ffffff;
    border-radius: 10px;
    overflow-x: auto;
    padding: 24px;
  }

  .catalog-table {
    border-collapse: collapse;
    min-width: 980px;
    width: 100%;
  }

  .catalog-table th {
    background: #ffe08d;
    color: #111111;
    font-size: 14px;
    font-weight: 700;
    padding: 16px 18px;
    text-align: center;
    text-transform: none;
  }

  .catalog-table th:nth-child(5) {
    width: 150px;
  }

  .catalog-table th:nth-child(6) {
    width: 166px;
  }

  .catalog-table td {
    border-bottom: 0;
    color: #11131d;
    font-size: 13px;
    font-weight: 500;
    padding: 18px;
    text-align: center;
    vertical-align: middle;
  }

  .catalog-table td:nth-child(5) {
    padding: 12px 10px;
  }

  .catalog-table tbody tr {
    height: 58px;
  }

  .catalog-table strong,
  .catalog-table span {
    display: block;
  }

  .catalog-table strong {
    color: #080478;
    font-size: 13px;
    margin-bottom: 4px;
  }

  .catalog-table span {
    color: #6b7280;
    font-weight: 800;
    line-height: 1.45;
  }

  .catalog-prices {
    display: grid;
    gap: 3px;
  }

  .catalog-status {
    border-radius: 999px;
    display: inline-flex;
    font-size: 10px;
    font-weight: 900;
    padding: 5px 9px;
    text-transform: uppercase;
  }

  .catalog-status.active {
    background: #edfdf3;
    color: #16794c;
  }

  .catalog-status.inactive {
    background: #fff1f0;
    color: #c73822;
  }

  .catalog-actions {
    align-items: center;
    display: inline-flex;
    flex-wrap: nowrap;
    gap: 8px;
    justify-content: center;
  }

  .catalog-order-cell {
    align-items: center;
    background: #f8f9ff;
    border: 1px solid #d9def2;
    border-radius: 999px;
    display: inline-grid;
    gap: 4px;
    grid-template-columns: 30px 30px;
    justify-content: center;
    padding: 4px 6px;
  }

  .catalog-order-actions,
  .catalog-row-actions {
    display: inline-flex;
    gap: 6px;
    justify-content: center;
  }

  .catalog-order-actions {
    display: contents;
    flex: 0 0 auto;
  }

  .catalog-row-actions {
    flex: 0 0 auto;
    flex-wrap: nowrap;
  }

  .catalog-actions .move {
    align-items: center;
    background: #fff;
    border: 1px solid #b9bfd3;
    border-radius: 4px;
    color: #080478;
    display: inline-flex;
    font-size: 14px;
    height: 30px;
    justify-content: center;
    min-height: 30px;
    padding: 0;
    width: 30px;
  }

  .catalog-actions .move:disabled {
    background: #eef0f6;
    border-color: #d7dbe8;
    color: #b5bbce;
    opacity: 1;
  }

  .catalog-actions .move:not(:disabled):hover {
    background: #fff3d8;
    border-color: #ffb43b;
  }

  .catalog-actions .edit {
    background: #080478;
    border: 1px solid #080478;
    color: #fff;
    height: 34px;
    min-width: 64px;
  }

  .catalog-actions .delete {
    background: #fff;
    border: 1px solid #c73822;
    color: #c73822;
    height: 34px;
    min-width: 76px;
  }

  .catalog-submit-btn:disabled,
  .catalog-primary-btn:disabled,
  .catalog-secondary-btn:disabled,
  .catalog-actions button:disabled {
    cursor: not-allowed;
    opacity: .62;
  }

  .catalog-actions .move:disabled {
    opacity: 1;
  }

  .catalog-empty {
    color: #6b7280;
    padding: 22px;
    text-align: center;
  }

  @media (max-width: 680px) {
    .catalog-form-head,
    .catalog-list-head {
      align-items: stretch;
      flex-direction: column;
    }

    .catalog-form-fields {
      grid-template-columns: 1fr;
    }

    .catalog-head-actions,
    .catalog-form-actions {
      justify-content: stretch;
    }

    .catalog-head-actions button,
    .catalog-form-actions button {
      flex: 1 1 150px;
    }
  }
`;

export function MembershipCatalogPage() {
  return <CatalogManagementPage family="MEMBERSHIP" />;
}

export function TrainerCatalogPage() {
  return <CatalogManagementPage family="PERSONAL_TRAINER" />;
}

export default CatalogManagementPage;
