import { useState } from "react";
import AdminLayout from "../../../components/AdminLayout";
import api from "../../../../../services/authApi";

const getErrorMessage = (err, fallback) =>
  err.response?.data?.error || err.response?.data?.message || err.message || fallback;

const audienceOptions = [
  { label: "All Members", value: "ALL" },
  { label: "Active Members", value: "ACTIVE_MEMBERS" },
  { label: "Inactive Members", value: "INACTIVE_MEMBERS" },
];

const initialForm = {
  audience: "ALL",
  message: "",
  title: "",
};

export default function BroadcastNotificationPage() {
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.post("/notifications/broadcast", {
        audience: form.audience,
        message: form.message.trim(),
        title: form.title.trim(),
      });
      const recipientCount = response.data?.data?.recipient_count ?? 0;
      setSuccess(`Notification sent to ${recipientCount} recipient${recipientCount === 1 ? "" : "s"}.`);
      setForm(initialForm);
    } catch (err) {
      setError(getErrorMessage(err, "Gagal mengirim broadcast notification."));
    } finally {
      setSaving(false);
    }
  };

  const isDisabled = saving || form.title.trim().length === 0 || form.message.trim().length === 0;

  return (
    <AdminLayout title="Notifications" subtitle="Broadcast notification ke member Vocafit.">
      <style>{`
        .broadcast-page {
          color: #11131d;
          display: grid;
          gap: 22px;
          max-width: 760px;
        }

        .broadcast-alert {
          border-radius: 8px;
          font-size: 13px;
          font-weight: 800;
          padding: 14px 16px;
        }

        .broadcast-alert.error {
          background: #fff1f0;
          color: #c73822;
        }

        .broadcast-alert.success {
          background: #ecfdf3;
          color: #15803d;
        }

        .broadcast-form {
          display: grid;
          gap: 18px;
        }

        .broadcast-field {
          display: grid;
          gap: 8px;
        }

        .broadcast-field span {
          color: #0b0871;
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .broadcast-input,
        .broadcast-select,
        .broadcast-textarea {
          background: #fff;
          border: 1px solid #d8dbe6;
          border-radius: 8px;
          color: #11131d;
          font: inherit;
          font-size: 14px;
          font-weight: 700;
          width: 100%;
        }

        .broadcast-input,
        .broadcast-select {
          min-height: 44px;
          padding: 0 14px;
        }

        .broadcast-textarea {
          line-height: 1.5;
          min-height: 150px;
          padding: 12px 14px;
          resize: vertical;
        }

        .broadcast-actions {
          display: flex;
          justify-content: flex-end;
        }

        .broadcast-submit {
          background: #0b0871;
          border: 0;
          border-radius: 8px;
          color: #fff;
          cursor: pointer;
          font: inherit;
          font-size: 13px;
          font-weight: 900;
          min-height: 42px;
          min-width: 190px;
          padding: 0 18px;
        }

        .broadcast-submit:disabled {
          cursor: not-allowed;
          opacity: .62;
        }

        @media (max-width: 680px) {
          .broadcast-actions,
          .broadcast-submit {
            width: 100%;
          }
        }
      `}</style>

      <section className="broadcast-page">
        {error && <div className="broadcast-alert error">{error}</div>}
        {success && <div className="broadcast-alert success">{success}</div>}

        <form className="broadcast-form" onSubmit={handleSubmit}>
          <label className="broadcast-field">
            <span>Audience</span>
            <select
              className="broadcast-select"
              value={form.audience}
              onChange={(event) => updateField("audience", event.target.value)}
            >
              {audienceOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className="broadcast-field">
            <span>Title</span>
            <input
              className="broadcast-input"
              maxLength={255}
              placeholder="Contoh: Jadwal gym hari ini"
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
            />
          </label>

          <label className="broadcast-field">
            <span>Message</span>
            <textarea
              className="broadcast-textarea"
              placeholder="Tulis pesan yang akan dikirim ke member."
              value={form.message}
              onChange={(event) => updateField("message", event.target.value)}
            />
          </label>

          <div className="broadcast-actions">
            <button className="broadcast-submit" disabled={isDisabled} type="submit">
              {saving ? "Mengirim..." : "Send Broadcast"}
            </button>
          </div>
        </form>
      </section>
    </AdminLayout>
  );
}
