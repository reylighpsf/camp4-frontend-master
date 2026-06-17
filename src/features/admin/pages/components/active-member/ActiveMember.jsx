import { useState } from "react";
import AdminLayout from "@/features/admin/components/AdminLayout";
import useActiveMembers from "@/features/admin/pages/components/active-member/hooks/useActiveMembers";
import { confirmAction } from "@/utils/sweetAlert";

const activeMemberStyles = `
  .active-member-page {
    display: grid;
    gap: 22px;
  }

  .sr-only {
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    width: 1px;
  }

  .active-member-title {
    display: none;
  }

  .active-member-subtitle {
    display: none;
  }

  .active-member-panel {
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 14px 28px rgba(8, 4, 120, .08);
    padding: 26px 28px 30px;
  }

  .active-member-head {
    align-items: center;
    display: flex;
    gap: 18px;
    justify-content: space-between;
    margin-bottom: 22px;
  }

  .active-member-head h2 {
    color: #0b0871;
    font-size: 20px;
    font-weight: 800;
    margin: 0 0 6px;
  }

  .active-member-head p,
  .active-member-muted {
    color: #6b7280;
    font-size: 13px;
    margin: 0;
  }

  .active-member-refresh {
    background: #11131d;
    border: 1px solid #11131d;
    border-radius: 8px;
    color: #ffffff;
    cursor: pointer;
    font: inherit;
    font-size: 12px;
    font-weight: 800;
    height: 40px;
    padding: 0 16px;
    text-transform: uppercase;
  }

  .active-member-head-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: flex-end;
  }

  .active-member-refresh.primary {
    background: #ff7314;
    border-color: #ff7314;
    color: #ffffff;
  }

  .active-member-refresh:disabled {
    cursor: not-allowed;
    opacity: 0.62;
  }

  .active-member-alert.success {
    background: #edfdf3;
    color: #16794c;
  }

  .active-member-cards {
    display: grid;
    gap: 16px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin: 0 0 26px;
    max-width: none;
  }

  .active-member-card {
    background: #ffffff;
    border: 1px solid #eceef3;
    border-radius: 8px;
    box-shadow: 0 6px 0 rgba(8, 4, 120, .16), 0 12px 24px rgba(8, 4, 120, .08);
    min-height: 138px;
    padding: 24px;
  }

  .active-member-card span {
    color: #0b0871;
    display: block;
    font-size: 13px;
    font-weight: 700;
    margin-bottom: 12px;
  }

  .active-member-card strong {
    color: #0b0871;
    display: block;
    font-size: 42px;
    font-weight: 900;
    line-height: 1;
  }

  .active-member-card p {
    color: #c8cad5;
    font-size: 11px;
    font-weight: 800;
    margin: 10px 0 0;
    text-transform: uppercase;
  }

  .active-member-alert {
    background: #fff1f0;
    border-radius: 8px;
    color: #c73822;
    font-size: 13px;
    margin-bottom: 16px;
    padding: 12px 14px;
  }

  .active-member-table-wrap {
    background: #ffffff;
    border-radius: 10px;
    overflow-x: auto;
    padding: 0;
  }

  .active-member-table-title {
    color: #0b0871;
    font-size: 20px;
    font-weight: 800;
    margin: 0 0 18px;
  }

  .active-member-table {
    border-collapse: collapse;
    min-width: 680px;
    width: 100%;
  }

  .active-member-table th {
    background: #ffe08d;
    color: #11131d;
    font-size: 14px;
    font-weight: 700;
    padding: 16px 18px;
    text-align: center;
    text-transform: none;
  }

  .active-member-table td {
    border-bottom: 0;
    color: #111111;
    font-size: 13px;
    font-weight: 500;
    padding: 18px;
    text-align: center;
    vertical-align: middle;
  }

  .active-member-table tbody tr {
    height: 58px;
  }

  .active-member-profile {
    align-items: center;
    display: block;
    text-align: center;
  }

  .active-member-avatar {
    display: none;
  }

  .active-member-profile strong {
    display: block;
    font-weight: 500;
    margin-bottom: 0;
  }

  .active-member-badge {
    background: transparent;
    border-radius: 999px;
    color: #111111;
    display: inline-flex;
    font-size: 13px;
    font-weight: 500;
    padding: 0;
    text-transform: none;
  }

  .active-member-badge.inactive {
    background: transparent;
    color: #111111;
  }

  .active-member-status {
    color: #6b7280;
    padding: 28px;
    text-align: center;
  }

  .active-member-status.error {
    color: #c73822;
  }

  .active-member-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    justify-content: center;
  }

  .active-member-action {
    border-radius: 999px;
    cursor: pointer;
    font: inherit;
    font-size: 11px;
    font-weight: 800;
    min-height: 30px;
    padding: 0 10px;
    text-transform: none;
  }

  .active-member-action.detail,
  .active-member-action.edit {
    background: #080478;
    border: 1px solid #080478;
    color: #fff;
  }

  .active-member-action.delete {
    background: #fff;
    border: 1px solid #c73822;
    color: #c73822;
  }

  .active-member-action:disabled {
    cursor: not-allowed;
    opacity: .62;
  }

  .membership-modal-backdrop {
    align-items: center;
    background: rgba(8, 4, 120, .54);
    display: flex;
    inset: 0;
    justify-content: center;
    padding: 20px;
    position: fixed;
    z-index: 1000;
  }

  .membership-modal {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 24px 80px rgba(0,0,0,.28);
    max-height: calc(100vh - 40px);
    overflow: auto;
    padding: 24px;
    width: min(100%, 460px);
  }

  .membership-modal.wide {
    width: min(96vw, 1080px);
  }

  .membership-modal.detail-wide {
    width: min(98vw, 1180px);
  }

  .membership-modal h2 {
    color: #080478;
    font-size: 20px;
    margin: 0 0 6px;
  }

  .membership-modal p {
    color: #6b7280;
    font-size: 13px;
    margin: 0 0 18px;
  }

  .membership-detail-photo {
    align-items: center;
    background: #f4f5f8;
    border-radius: 50%;
    display: flex;
    flex: 0 0 auto;
    height: 86px;
    justify-content: center;
    overflow: hidden;
    width: 86px;
  }

  .membership-detail-photo img {
    height: 100%;
    object-fit: cover;
    width: 100%;
  }

  .membership-detail-head {
    align-items: center;
    background: #f8f8fb;
    border: 1px solid #eceef3;
    border-radius: 12px;
    display: flex;
    gap: 16px;
    margin-bottom: 18px;
    padding: 16px;
  }

  .membership-detail-top {
    align-items: start;
    display: flex;
    gap: 16px;
    justify-content: space-between;
    margin-bottom: 18px;
    position: sticky;
    top: 0;
    z-index: 1;
    background: #fff;
    padding-bottom: 12px;
  }

  .membership-detail-top h2 {
    margin-bottom: 6px;
  }

  .membership-detail-initial {
    align-items: center;
    background: #080478;
    border-radius: 50%;
    color: #fff;
    display: inline-flex;
    flex: 0 0 auto;
    font-size: 24px;
    font-weight: 900;
    height: 86px;
    justify-content: center;
    width: 86px;
  }

  .membership-detail-name {
    min-width: 0;
  }

  .membership-detail-name strong {
    color: #080478;
    display: block;
    font-size: 20px;
    font-weight: 900;
    line-height: 1.15;
    margin-bottom: 6px;
  }

  .membership-detail-name span {
    color: #6b7280;
    display: block;
    font-size: 13px;
    font-weight: 700;
    overflow-wrap: anywhere;
  }

  .membership-detail-sections {
    display: grid;
    gap: 16px;
  }

  .membership-detail-section {
    border: 1px solid #eceef3;
    border-radius: 12px;
    padding: 16px 18px;
  }

  .membership-detail-section h3 {
    color: #080478;
    font-size: 14px;
    font-weight: 900;
    margin: 0 0 14px;
  }

  .membership-detail-grid {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .membership-detail-item {
    background: #f8f8fb;
    border: 1px solid #eceef3;
    border-radius: 10px;
    min-width: 0;
    padding: 12px 14px;
  }

  .membership-detail-item span {
    color: #6b7280;
    display: block;
    font-size: 11px;
    font-weight: 900;
    margin-bottom: 6px;
    text-transform: uppercase;
  }

  .membership-detail-item strong {
    color: #11131d;
    display: block;
    font-size: 14px;
    font-weight: 800;
    line-height: 1.35;
    overflow-wrap: anywhere;
  }

  .membership-form {
    display: grid;
    gap: 14px;
  }

  .membership-form.two-cols {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .membership-form .wide-field {
    grid-column: 1 / -1;
  }

  .membership-form label {
    color: #30333d;
    display: grid;
    font-size: 12px;
    font-weight: 800;
    gap: 8px;
    text-transform: uppercase;
  }

  .membership-form input,
  .membership-form select {
    border: 1px solid #d8dbe6;
    border-radius: 8px;
    font: inherit;
    height: 42px;
    padding: 0 12px;
    text-transform: none;
  }

  .membership-form input[readonly] {
    background: #f8f8fb;
    color: #11131d;
  }

  .membership-phone-shell {
    align-items: center;
    border: 1px solid #d8dbe6;
    border-radius: 8px;
    display: flex;
    height: 42px;
    overflow: hidden;
  }

  .membership-phone-prefix {
    color: #30333d;
    flex: 0 0 auto;
    font-size: 13px;
    font-weight: 900;
    padding-left: 12px;
  }

  .membership-phone-shell input {
    border: 0;
    height: 100%;
    min-width: 0;
    padding-left: 5px;
    width: 100%;
  }

  .membership-modal-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    margin-top: 20px;
  }

  @media (max-width: 760px) {
    .active-member-page {
      gap: 18px;
    }

    .active-member-head {
      align-items: stretch;
      flex-direction: column;
    }

    .active-member-refresh {
      width: 100%;
    }

    .membership-form.two-cols {
      grid-template-columns: 1fr;
    }

    .membership-detail-grid {
      grid-template-columns: 1fr;
    }

    .active-member-cards {
      grid-template-columns: 1fr;
      gap: 18px;
    }
  }

  @media (min-width: 761px) and (max-width: 1040px) {
    .membership-detail-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
`;

const formatTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatMembershipPlan = (member) => {
  const planName =
    member.membership_plan_name ||
    member.membership?.plan_name ||
    member.membership?.name ||
    member.membership_name ||
    member.plan_name ||
    member.tier;

  if (planName) return planName;

  const plan =
    member.membership_plan_code ||
    member.membership?.plan_code ||
    member.membership_price_code;

  if (!plan) return "-";

  const normalizedPlan = String(plan).toUpperCase();
  if (normalizedPlan === "MEMBERSHIP_DAILY") return "Daily Pass";
  if (normalizedPlan === "MEMBERSHIP_MONTHLY") return "Monthly Membership";
  if (normalizedPlan === "MAHASISWA_VOKASI") return "Mahasiswa Vokasi";
  if (normalizedPlan === "MAHASISWA_NON_VOKASI") return "Mahasiswa Non Vokasi";
  if (normalizedPlan === "PEGAWAI_KARYAWAN") return "Pegawai/Karyawan";
  if (normalizedPlan === "UMUM") return "Umum";

  return String(plan).replaceAll("_", " ");
};

const isMemberActive = (member) => {
  return Boolean(member.is_membership_active);
};

const getPhoneInputDigits = (phoneNumber = "") =>
  phoneNumber.replace(/^\+62/, "").replace(/^0/, "");

const normalizeIndonesianPhone = (value) => {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("62")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = digits.slice(1);
  return digits ? `+62${digits}` : "";
};

export default function ActiveMemberPage() {
  const {
    members,
    summary,
    loading,
    actionLoadingId,
    error,
    actionError,
    actionSuccessMessage,
    refetch,
    createUser,
    getUserDetail,
    updateUser,
    deleteMembership,
  } = useActiveMembers();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [editForm, setEditForm] = useState({
    birthDate: "",
    email: "",
    fullName: "",
    image: null,
    membershipPriceCode: "UMUM",
    password: "",
    penaltyAmount: "0",
    paymentMethod: "CASH",
    phoneNumber: "",
    role: "member",
  });
  const [createForm, setCreateForm] = useState({
    birthDate: "",
    email: "",
    fullName: "",
    image: null,
    membershipPriceCode: "UMUM",
    password: "",
    penaltyAmount: "0",
    phoneNumber: "",
    role: "member",
  });

  const openCreateModal = () => {
    setCreateForm({
      birthDate: "",
      email: "",
      fullName: "",
      image: null,
      membershipPriceCode: "UMUM",
      password: "",
      penaltyAmount: "0",
      paymentMethod: "CASH",
      phoneNumber: "",
      role: "member",
    });
    setIsCreateOpen(true);
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    const result = await createUser(createForm);
    if (result.ok) setIsCreateOpen(false);
  };

  const updateCreateForm = (field, value) => {
    setCreateForm((current) => ({
      ...current,
      [field]: field === "phoneNumber" ? normalizeIndonesianPhone(value) : value,
    }));
  };

  const openEditModal = (member) => {
    setEditingMember(member);
    setEditForm({
      birthDate: member.date_of_birth ? String(member.date_of_birth).slice(0, 10) : "",
      email: member.email || "",
      fullName: member.full_name || "",
      image: null,
      membershipPriceCode: member.membership_price_code || "UMUM",
      password: "",
      penaltyAmount: String(member.penalty_amount ?? 0),
      phoneNumber: member.phone_number || "",
      role: member.role || "member",
    });
  };

  const handleEditUser = async (event) => {
    event.preventDefault();
    if (!editingMember) return;
    const result = await updateUser(editingMember.id, editForm);
    if (result.ok) setEditingMember(null);
  };

  const handleShowDetail = async (member) => {
    const result = await getUserDetail(member.id);
    setSelectedMember(result.ok && result.data ? { ...member, ...result.data } : member);
  };

  const updateEditForm = (field, value) => {
    setEditForm((current) => ({
      ...current,
      [field]: field === "phoneNumber" ? normalizeIndonesianPhone(value) : value,
    }));
  };

  const handleDeleteMember = async (member) => {
    const confirmed = await confirmAction({
      confirmButtonColor: "#c73822",
      confirmButtonText: "Hapus",
      text: `Member "${member.full_name || member.email || "-"}" akan dihapus.`,
      title: "Hapus Member?",
    });
    if (!confirmed) return;
    await deleteMembership(member.id);
  };

  return (
    <AdminLayout title="Active Member" subtitle="Monitoring member yang sedang berada di gym.">
      <style>{activeMemberStyles}</style>

      <section className="active-member-page">
      <section className="active-member-panel">
        <div className="active-member-head">
          <div>
            <h2>Ringkasan Member</h2>
            <p>Pantau semua member terdaftar dan status membership terbaru.</p>
          </div>
          <div className="active-member-head-actions">
            <button className="active-member-refresh primary" onClick={openCreateModal} type="button">
              Tambah User
            </button>
            <button className="active-member-refresh" disabled={loading} onClick={refetch} type="button">
              {loading ? "Memuat..." : "Refresh"}
            </button>
          </div>
        </div>

        {error && <div className="active-member-alert">{error}</div>}
        {actionError && <div className="active-member-alert">{actionError}</div>}
        {actionSuccessMessage && <div className="active-member-alert success">{actionSuccessMessage}</div>}

        <section className="active-member-cards" aria-label="Ringkasan member">
          <article className="active-member-card">
            <span>Member Sedang Tap In</span>
            <strong>{summary.activeMembers}</strong>
            <p>Member yang sedang berada di gym.</p>
          </article>
          <article className="active-member-card">
            <span>Total Member Terdaftar</span>
            <strong>{summary.registeredMembers}</strong>
            <p>User member verified di database.</p>
          </article>
        </section>

        <div className="active-member-table-wrap">
          <h2 className="active-member-table-title">Daftar Member Aktif</h2>
          <table className="active-member-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Member</th>
                <th>Check In</th>
                <th>Membership Plan</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td className="active-member-status" colSpan="6">
                    Memuat daftar member...
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td className="active-member-status error" colSpan="6">
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && members.length === 0 && (
                <tr>
                  <td className="active-member-status" colSpan="6">
                    Belum ada data member di database.
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                members.map((member, index) => {
                  const isActive = isMemberActive(member);

                  return (
                    <tr key={member.id}>
                      <td>
                        {index + 1}
                      </td>
                      <td>
                        <div className="active-member-profile">
                          <div>
                            <strong>{member.full_name || "-"}</strong>
                          </div>
                        </div>
                      </td>
                      <td>{formatTime(member.check_in_at)}</td>
                      <td>{formatMembershipPlan(member)}</td>
                      <td>
                        <span className={`active-member-badge ${isActive ? "" : "inactive"}`}>
                          {member.membership_status_label || (isActive ? "Aktif" : "Tidak Aktif")}
                        </span>
                      </td>
                      <td>
                        <div className="active-member-actions">
                          <button
                            className="active-member-action detail"
                            disabled={actionLoadingId === member.id}
                            onClick={() => handleShowDetail(member)}
                            type="button"
                          >
                            {actionLoadingId === member.id ? "..." : "Detail"}
                          </button>
                          <button
                            className="active-member-action edit"
                            disabled={actionLoadingId === `edit-${member.id}`}
                            onClick={() => openEditModal(member)}
                            type="button"
                          >
                            Edit
                          </button>
                          <button
                            className="active-member-action delete"
                            disabled={actionLoadingId === member.id}
                            onClick={() => handleDeleteMember(member)}
                            type="button"
                          >
                            {actionLoadingId === member.id ? "..." : "Hapus"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </section>
      </section>

      {selectedMember && (
        <div className="membership-modal-backdrop">
          <section className="membership-modal wide detail-wide" role="dialog" aria-modal="true">
            <div className="membership-detail-top">
              <div>
                <h2>Detail Member</h2>
                <p>Seluruh profile pengguna yang tersedia dari database.</p>
              </div>
              <button className="active-member-action delete" onClick={() => setSelectedMember(null)} type="button">
                Tutup
              </button>
            </div>
            <div className="membership-detail-head">
              {selectedMember.profile_image_url ? (
                <div className="membership-detail-photo">
                  <img src={selectedMember.profile_image_url} alt="" />
                </div>
              ) : (
                <span className="membership-detail-initial">
                  {(selectedMember.full_name || selectedMember.email || "?").trim().charAt(0).toUpperCase()}
                </span>
              )}
              <div className="membership-detail-name">
                <strong>{selectedMember.full_name || "-"}</strong>
                <span>{selectedMember.email || "-"}</span>
                <span>{selectedMember.role || "-"} | {selectedMember.is_verified === false ? "Belum verified" : "Verified"}</span>
              </div>
            </div>

            <div className="membership-detail-sections">
              <section className="membership-detail-section">
                <h3>Profile</h3>
                <div className="membership-detail-grid">
                  <div className="membership-detail-item"><span>User ID</span><strong>{selectedMember.id || "-"}</strong></div>
                  <div className="membership-detail-item"><span>No. HP</span><strong>{selectedMember.phone_number || "-"}</strong></div>
                  <div className="membership-detail-item"><span>Tanggal Lahir</span><strong>{formatDate(selectedMember.date_of_birth)}</strong></div>
                  <div className="membership-detail-item"><span>Penalty</span><strong>{String(selectedMember.penalty_amount ?? 0)}</strong></div>
                  <div className="membership-detail-item"><span>Dibuat</span><strong>{formatDateTime(selectedMember.created_at)}</strong></div>
                  <div className="membership-detail-item"><span>Diupdate</span><strong>{formatDateTime(selectedMember.updated_at)}</strong></div>
                </div>
              </section>

              <section className="membership-detail-section">
                <h3>Membership</h3>
                <div className="membership-detail-grid">
                  <div className="membership-detail-item"><span>Membership Plan</span><strong>{formatMembershipPlan(selectedMember)}</strong></div>
                  <div className="membership-detail-item"><span>Membership Type</span><strong>{selectedMember.membership?.type || "-"}</strong></div>
                  <div className="membership-detail-item"><span>Membership End Date</span><strong>{formatDateTime(selectedMember.membership?.end_date)}</strong></div>
                  <div className="membership-detail-item"><span>Tier Harga</span><strong>{selectedMember.tier || selectedMember.membership_price_code || "-"}</strong></div>
                  <div className="membership-detail-item"><span>Status</span><strong>{selectedMember.membership_status_label || "-"}</strong></div>
                </div>
              </section>

              <section className="membership-detail-section">
                <h3>Activity</h3>
                <div className="membership-detail-grid">
                  <div className="membership-detail-item"><span>Check In</span><strong>{formatTime(selectedMember.check_in_at)}</strong></div>
                  <div className="membership-detail-item"><span>Check Out</span><strong>{formatTime(selectedMember.check_out_at)}</strong></div>
                </div>
              </section>
            </div>
          </section>
        </div>
      )}

      {editingMember && (
        <div className="membership-modal-backdrop">
          <section className="membership-modal wide" role="dialog" aria-modal="true">
            <h2>Edit User</h2>
            <p>Perbarui data member atau pengurus.</p>
            <form className="membership-form two-cols" onSubmit={handleEditUser}>
              <label>
                Nama Lengkap
                <input
                  required
                  value={editForm.fullName}
                  onChange={(event) => updateEditForm("fullName", event.target.value)}
                />
              </label>
              <label>
                Email
                <input
                  disabled
                  required
                  type="email"
                  value={editForm.email}
                  readOnly
                />
              </label>
              <label>
                No. HP
                <span className="membership-phone-shell">
                  <span className="membership-phone-prefix">+62</span>
                  <input
                    placeholder="8123456789"
                    value={getPhoneInputDigits(editForm.phoneNumber)}
                    onChange={(event) => updateEditForm("phoneNumber", event.target.value)}
                  />
                </span>
              </label>
              <label>
                Tanggal Lahir
                <input
                  type="date"
                  value={editForm.birthDate}
                  onChange={(event) => updateEditForm("birthDate", event.target.value)}
                />
              </label>
              <label>
                Password Baru
                <input
                  minLength={8}
                  placeholder="Kosongkan jika tidak diganti"
                  type="password"
                  value={editForm.password}
                  onChange={(event) => updateEditForm("password", event.target.value)}
                />
              </label>
              <label>
                Role
                <select
                  value={editForm.role}
                  onChange={(event) => updateEditForm("role", event.target.value)}
                >
                  <option value="member">Member</option>
                  <option value="pengurus">Pengurus</option>
                </select>
              </label>
              <label>
                Tier Harga
                <select
                  value={editForm.membershipPriceCode}
                  onChange={(event) => updateEditForm("membershipPriceCode", event.target.value)}
                >
                  <option value="UMUM">Umum</option>
                  <option value="PEGAWAI_KARYAWAN">Pegawai/Karyawan</option>
                  <option value="MAHASISWA_NON_VOKASI">Mahasiswa Non Vokasi</option>
                  <option value="MAHASISWA_VOKASI">Mahasiswa Vokasi</option>
                </select>
              </label>
              <label>
                Penalty
                <input
                  min="0"
                  type="number"
                  value={editForm.penaltyAmount}
                  onChange={(event) => updateEditForm("penaltyAmount", event.target.value)}
                />
              </label>
              <label className="wide-field">
                Foto Profil
                <input
                  accept="image/jpeg,image/png,image/webp"
                  type="file"
                  onChange={(event) => updateEditForm("image", event.target.files?.[0] || null)}
                />
              </label>
              <div className="membership-modal-actions wide-field">
                <button className="active-member-action delete" onClick={() => setEditingMember(null)} type="button">
                  Batal
                </button>
                <button className="active-member-action edit" disabled={actionLoadingId === `edit-${editingMember.id}`} type="submit">
                  {actionLoadingId === `edit-${editingMember.id}` ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {isCreateOpen && (
        <div className="membership-modal-backdrop">
          <section className="membership-modal wide" role="dialog" aria-modal="true">
            <h2>Tambah User</h2>
            <p>Buat akun member atau pengurus baru.</p>
            <form className="membership-form two-cols" onSubmit={handleCreateUser}>
              <label>
                Nama Lengkap
                <input
                  required
                  value={createForm.fullName}
                  onChange={(event) => updateCreateForm("fullName", event.target.value)}
                />
              </label>
              <label>
                Email
                <input
                  required
                  type="email"
                  value={createForm.email}
                  onChange={(event) => updateCreateForm("email", event.target.value)}
                />
              </label>
              <label>
                No. HP
                <span className="membership-phone-shell">
                  <span className="membership-phone-prefix">+62</span>
                  <input
                    placeholder="8123456789"
                    value={getPhoneInputDigits(createForm.phoneNumber)}
                    onChange={(event) => updateCreateForm("phoneNumber", event.target.value)}
                  />
                </span>
              </label>
              <label>
                Tanggal Lahir
                <input
                  type="date"
                  value={createForm.birthDate}
                  onChange={(event) => updateCreateForm("birthDate", event.target.value)}
                />
              </label>
              <label>
                Password
                <input
                  minLength={8}
                  required
                  type="password"
                  value={createForm.password}
                  onChange={(event) => updateCreateForm("password", event.target.value)}
                />
              </label>
              <label>
                Role
                <select
                  value={createForm.role}
                  onChange={(event) => updateCreateForm("role", event.target.value)}
                >
                  <option value="member">Member</option>
                  <option value="pengurus">Pengurus</option>
                </select>
              </label>
              <label>
                Tier Harga
                <select
                  value={createForm.membershipPriceCode}
                  onChange={(event) => updateCreateForm("membershipPriceCode", event.target.value)}
                >
                  <option value="UMUM">Umum</option>
                  <option value="PEGAWAI_KARYAWAN">Pegawai/Karyawan</option>
                  <option value="MAHASISWA_NON_VOKASI">Mahasiswa Non Vokasi</option>
                  <option value="MAHASISWA_VOKASI">Mahasiswa Vokasi</option>
                </select>
              </label>
              <label>
                Metode Pembayaran
                <select
                  value={createForm.paymentMethod}
                  onChange={(event) => updateCreateForm("paymentMethod", event.target.value)}
                >
                  <option value="CASH">Cash</option>
                  <option value="QRIS">QRIS</option>
                </select>
              </label>
              <label>
                Penalty
                <input
                  min="0"
                  type="number"
                  value={createForm.penaltyAmount}
                  onChange={(event) => updateCreateForm("penaltyAmount", event.target.value)}
                />
              </label>
              <label className="wide-field">
                Foto Profil
                <input
                  accept="image/jpeg,image/png,image/webp"
                  type="file"
                  onChange={(event) => updateCreateForm("image", event.target.files?.[0] || null)}
                />
              </label>
              <div className="membership-modal-actions wide-field">
                <button className="active-member-action delete" onClick={() => setIsCreateOpen(false)} type="button">
                  Batal
                </button>
                <button className="active-member-action edit" disabled={actionLoadingId === "create-user"} type="submit">
                  {actionLoadingId === "create-user" ? "Menyimpan..." : "Simpan User"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </AdminLayout>
  );
}
