import { useState } from "react";
import AdminLayout from "../../../../components/admin/AdminLayout";
import useActiveMembers from "./hooks/useActiveMembers";

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
    padding: 28px;
    position: fixed;
    z-index: 1000;
  }

  .membership-modal {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 24px 80px rgba(0,0,0,.28);
    padding: 24px;
    width: min(100%, 460px);
  }

  .membership-modal.wide {
    width: min(100%, 720px);
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

    .active-member-cards {
      grid-template-columns: 1fr;
      gap: 18px;
    }
  }
`;

const formatTime = (value) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
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
  return Boolean(member.is_currently_checked_in);
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
  } = useActiveMembers();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    email: "",
    fullName: "",
    image: null,
    membershipPriceCode: "UMUM",
    password: "",
    penaltyAmount: "0",
    role: "member",
  });

  const openCreateModal = () => {
    setCreateForm({
      email: "",
      fullName: "",
      image: null,
      membershipPriceCode: "UMUM",
      password: "",
      penaltyAmount: "0",
      role: "member",
    });
    setIsCreateOpen(true);
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    const result = await createUser(createForm);
    if (result.ok) setIsCreateOpen(false);
  };

  return (
    <AdminLayout title="Active Member" subtitle="Monitoring member yang sedang berada di gym.">
      <style>{activeMemberStyles}</style>

      <section className="active-member-page">
      <section className="active-member-panel">
        <div className="active-member-head">
          <div>
            <h2>Ringkasan Member</h2>
            <p>Pantau semua member dengan status tap-in dan tap-out terakhir.</p>
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
            <p>Member yang sudah tap-in dan belum tap-out.</p>
          </article>
          <article className="active-member-card">
            <span>Total Check In Hari Ini</span>
            <strong>{summary.checkInsToday}</strong>
            <p>Member yang check in hari ini.</p>
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
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td className="active-member-status" colSpan="5">
                    Memuat daftar member...
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td className="active-member-status error" colSpan="5">
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && members.length === 0 && (
                <tr>
                  <td className="active-member-status" colSpan="5">
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
                          {isActive ? "Aktif" : "Tidak Aktif"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </section>
      </section>

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
                  onChange={(event) => setCreateForm((value) => ({ ...value, fullName: event.target.value }))}
                />
              </label>
              <label>
                Email
                <input
                  required
                  type="email"
                  value={createForm.email}
                  onChange={(event) => setCreateForm((value) => ({ ...value, email: event.target.value }))}
                />
              </label>
              <label>
                Password
                <input
                  minLength={8}
                  required
                  type="password"
                  value={createForm.password}
                  onChange={(event) => setCreateForm((value) => ({ ...value, password: event.target.value }))}
                />
              </label>
              <label>
                Role
                <select
                  value={createForm.role}
                  onChange={(event) => setCreateForm((value) => ({ ...value, role: event.target.value }))}
                >
                  <option value="member">Member</option>
                  <option value="pengurus">Pengurus</option>
                </select>
              </label>
              <label>
                Tier Harga
                <select
                  value={createForm.membershipPriceCode}
                  onChange={(event) => setCreateForm((value) => ({ ...value, membershipPriceCode: event.target.value }))}
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
                  value={createForm.penaltyAmount}
                  onChange={(event) => setCreateForm((value) => ({ ...value, penaltyAmount: event.target.value }))}
                />
              </label>
              <label className="wide-field">
                Foto Profil
                <input
                  accept="image/jpeg,image/png,image/webp"
                  type="file"
                  onChange={(event) => setCreateForm((value) => ({ ...value, image: event.target.files?.[0] || null }))}
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
