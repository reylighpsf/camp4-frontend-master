import AdminLayout from "../../../../components/admin/AdminLayout";
import useActiveMembers from "./hooks/useActiveMembers";

const activeMemberStyles = `
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

  .active-member-cards {
    display: grid;
    gap: 16px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin-bottom: 22px;
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
    min-width: 760px;
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

  .active-member-status {
    color: #6b7280;
    padding: 28px;
    text-align: center;
  }

  .active-member-status.error {
    color: #c73822;
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

export default function ActiveMemberPage() {
  const { members, summary, loading, error, refetch } = useActiveMembers();

  return (
    <AdminLayout title="Active Member" subtitle="Kelola member aktif dan status akun.">
      <style>{activeMemberStyles}</style>

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
              <th>Role</th>
              <th>Harga Bulanan</th>
              <th>Penalty</th>
              <th>Terdaftar</th>
              <th>Status</th>
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
                  Belum ada member terdaftar.
                </td>
              </tr>
            )}

            {!loading &&
              !error &&
              members.map((member) => (
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
                  <td>{member.role}</td>
                  <td>Rp {Number(member.monthly_price || 0).toLocaleString("id-ID")}</td>
                  <td>Rp {Number(member.penalty_amount || 0).toLocaleString("id-ID")}</td>
                  <td>{formatDate(member.created_at)}</td>
                  <td>
                    <span className="active-member-badge">Aktif</span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
