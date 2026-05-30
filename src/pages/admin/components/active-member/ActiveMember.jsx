import { useState } from "react";
import AdminLayout from "../../../../components/admin/AdminLayout";
import useActiveMembers from "./hooks/useActiveMembers";

const activeMemberStyles = `
  .active-member-panel {
    background: #fff;
    border-radius: 14px;
    padding: 28px 30px 30px;
  }

  .active-member-head {
    align-items: center;
    display: flex;
    gap: 18px;
    justify-content: space-between;
    margin-bottom: 22px;
  }

  .active-member-head h2 {
    font-size: 20px;
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
    color: #fff;
    cursor: pointer;
    font: inherit;
    font-size: 12px;
    font-weight: 800;
    height: 40px;
    padding: 0 16px;
    text-transform: uppercase;
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
    margin-bottom: 26px;
  }

  .active-member-card {
    background: #f7f8fb;
    border: 1px solid #eceef3;
    border-radius: 8px;
    min-height: 132px;
    padding: 22px;
  }

  .active-member-card span {
    color: #6b7280;
    display: block;
    font-size: 12px;
    font-weight: 800;
    margin-bottom: 16px;
    text-transform: uppercase;
  }

  .active-member-card strong {
    color: #080478;
    display: block;
    font-size: 42px;
    font-weight: 800;
    line-height: 1;
  }

  .active-member-card p {
    color: #6b7280;
    font-size: 13px;
    margin: 10px 0 0;
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
    overflow-x: auto;
  }

  .active-member-table {
    border-collapse: collapse;
    min-width: 1080px;
    width: 100%;
  }

  .active-member-table th {
    background: #f0f1f5;
    color: #30333d;
    font-size: 11px;
    padding: 14px;
    text-align: left;
    text-transform: uppercase;
  }

  .active-member-table td {
    border-bottom: 1px solid #eceef3;
    font-size: 13px;
    padding: 14px;
    vertical-align: middle;
  }

  .active-member-profile {
    align-items: center;
    display: flex;
    gap: 12px;
  }

  .active-member-avatar {
    background: #080478;
    border-radius: 8px;
    color: #fff;
    display: grid;
    flex: 0 0 auto;
    font-weight: 800;
    height: 42px;
    place-items: center;
    width: 42px;
  }

  .active-member-profile strong {
    display: block;
    margin-bottom: 4px;
  }

  .active-member-badge {
    background: #edfdf3;
    border-radius: 999px;
    color: #16794c;
    display: inline-flex;
    font-size: 11px;
    font-weight: 800;
    padding: 6px 10px;
    text-transform: uppercase;
  }

  .active-member-badge.inactive {
    background: #fff1f0;
    color: #c73822;
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
    gap: 8px;
  }

  .active-member-action {
    border-radius: 8px;
    cursor: pointer;
    font: inherit;
    font-size: 12px;
    font-weight: 800;
    height: 34px;
    padding: 0 12px;
    text-transform: uppercase;
  }

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
    .active-member-head {
      align-items: stretch;
      flex-direction: column;
    }

    .active-member-refresh {
      width: 100%;
    }

    .active-member-cards {
      grid-template-columns: 1fr;
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

const getInitial = (name) => String(name || "M").trim().charAt(0).toUpperCase();

const isMemberActive = (member) => {
  const status = String(member.membership_status || member.membership?.status || member.status || "").toLowerCase();
  if (status === "active" || status === "aktif") return true;
  if (member.active_membership || member.is_active_member) return true;
  const endDate = member.membership_end_date || member.membership?.end_date;
  if (endDate) return new Date(endDate) >= new Date();
  return false;
};

const getMembershipType = (member) => member.membership_type || member.membership?.type || "-";

const getMembershipEndDate = (member) => member.membership_end_date || member.membership?.end_date;

const formatDateInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const toEndDateIso = (value) => {
  const date = new Date(`${value}T23:59:59.999`);
  return date.toISOString();
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
    updateMembership,
    deleteMembership,
  } = useActiveMembers();
  const [editingMember, setEditingMember] = useState(null);
  const [membershipForm, setMembershipForm] = useState({ type: "daily", endDate: "" });

  const openEditModal = (member) => {
    setEditingMember(member);
    setMembershipForm({
      type: getMembershipType(member) === "monthly" ? "monthly" : "daily",
      endDate: formatDateInput(getMembershipEndDate(member)),
    });
  };

  const handleDeleteMembership = async (member) => {
    if (!window.confirm(`Hapus membership ${member.full_name || "member ini"}?`)) return;
    await deleteMembership(member.id);
  };

  const handleSubmitMembership = async (event) => {
    event.preventDefault();
    if (!editingMember || !membershipForm.endDate) return;

    const result = await updateMembership({
      userId: editingMember.id,
      type: membershipForm.type,
      endDate: toEndDateIso(membershipForm.endDate),
    });

    if (result.ok) {
      setEditingMember(null);
    }
  };

  return (
    <AdminLayout title="Active Member" subtitle="Kelola member aktif dan status akun.">
      <style>{activeMemberStyles}</style>

      <section className="active-member-panel">
        <div className="active-member-head">
          <div>
            <h2>Ringkasan Member</h2>
            <p>Pantau jumlah member aktif dan total member yang terdaftar.</p>
          </div>
          <button className="active-member-refresh" disabled={loading} onClick={refetch} type="button">
            {loading ? "Memuat..." : "Refresh"}
          </button>
        </div>

        {error && <div className="active-member-alert">{error}</div>}
        {actionError && <div className="active-member-alert">{actionError}</div>}
        {actionSuccessMessage && <div className="active-member-alert success">{actionSuccessMessage}</div>}

        <section className="active-member-cards" aria-label="Ringkasan member">
          <article className="active-member-card">
            <span>Member Aktif</span>
            <strong>{summary.activeMembers}</strong>
            <p>Member dengan status aktif saat ini.</p>
          </article>
          <article className="active-member-card">
            <span>Member Terdaftar</span>
            <strong>{summary.registeredMembers}</strong>
            <p>Total akun member yang terdaftar.</p>
          </article>
        </section>

        <div className="active-member-table-wrap">
          <table className="active-member-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Penalty</th>
                <th>Membership</th>
                <th>Berakhir</th>
                <th>Terdaftar</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td className="active-member-status" colSpan="7">
                    Memuat daftar member...
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td className="active-member-status error" colSpan="7">
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && members.length === 0 && (
                <tr>
                  <td className="active-member-status" colSpan="7">
                    Belum ada member terdaftar.
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                members.map((member) => {
                  const isActive = isMemberActive(member);

                  return (
                    <tr key={member.id}>
                      <td>
                        <div className="active-member-profile">
                          <div className="active-member-avatar">{getInitial(member.full_name)}</div>
                          <div>
                            <strong>{member.full_name || "-"}</strong>
                            <span className="active-member-muted">{member.email || "-"}</span>
                          </div>
                        </div>
                      </td>
                      <td>Rp {Number(member.penalty_amount || 0).toLocaleString("id-ID")}</td>
                      <td>{getMembershipType(member)}</td>
                      <td>{formatDate(getMembershipEndDate(member))}</td>
                      <td>{formatDate(member.created_at)}</td>
                      <td>
                        <span className={`active-member-badge ${isActive ? "" : "inactive"}`}>
                          {isActive ? "Aktif" : "Tidak Aktif"}
                        </span>
                      </td>
                      <td>
                        <div className="active-member-actions">
                          <button
                            className="active-member-action edit"
                            disabled={actionLoadingId === member.id}
                            onClick={() => openEditModal(member)}
                            type="button"
                          >
                            Perbarui
                          </button>
                          <button
                            className="active-member-action delete"
                            disabled={actionLoadingId === member.id || !isActive}
                            onClick={() => handleDeleteMembership(member)}
                            type="button"
                          >
                            Hapus
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

      {editingMember && (
        <div className="membership-modal-backdrop">
          <section className="membership-modal" role="dialog" aria-modal="true">
            <h2>Perbarui Membership</h2>
            <p>{editingMember.full_name || editingMember.email || "Member"}</p>
            <form className="membership-form" onSubmit={handleSubmitMembership}>
              <label>
                Membership
                <select
                  value={membershipForm.type}
                  onChange={(event) => setMembershipForm((value) => ({ ...value, type: event.target.value }))}
                >
                  <option value="daily">Daily</option>
                  <option value="monthly">Monthly</option>
                </select>
              </label>
              <label>
                Berakhir
                <input
                  type="date"
                  value={membershipForm.endDate}
                  onChange={(event) => setMembershipForm((value) => ({ ...value, endDate: event.target.value }))}
                  required
                />
              </label>
              <div className="membership-modal-actions">
                <button className="active-member-action delete" onClick={() => setEditingMember(null)} type="button">
                  Batal
                </button>
                <button className="active-member-action edit" disabled={actionLoadingId === editingMember.id} type="submit">
                  {actionLoadingId === editingMember.id ? "..." : "Simpan"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </AdminLayout>
  );
}
