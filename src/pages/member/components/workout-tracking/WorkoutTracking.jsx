import { useCallback, useEffect, useMemo, useState } from "react";
import MemberLayout from "../../../../components/member/MemberLayout";
import api from "../../../../components/auth/authApi";

const getErrorMessage = (err, fallback) =>
  err.response?.data?.error || err.response?.data?.message || err.message || fallback;

const formatDate = (value) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const getWorkoutMeta = (name = "") => {
  const structured = Object.fromEntries(
    String(name)
      .split("|")
      .map((item) => item.split(":").map((part) => part.trim()))
      .filter(([key, value]) => key && value),
  );

  if (structured.type || structured.duration || structured.calories || structured.date) {
    return {
      date: structured.date || "",
      type: structured.type || "Workout",
      duration: structured.duration || "-",
      calories: structured.calories || "-",
    };
  }

  const normalized = name.toLowerCase();
  if (normalized.includes("run") || normalized.includes("cardio")) {
    return { type: "Morning Run", duration: "35 min", calories: "280 kcal" };
  }
  if (normalized.includes("yoga")) {
    return { type: "Yoga Session", duration: "45 min", calories: "120 kcal" };
  }
  if (normalized.includes("swim")) {
    return { type: "Swimming", duration: "30 min", calories: "310 kcal" };
  }
  if (normalized.includes("hiit")) {
    return { type: "HIIT Cardio", duration: "20 min", calories: "215 kcal" };
  }
  return { type: name || "Workout", duration: "50 min", calories: "340 kcal" };
};

const workoutGuides = [
  {
    title: "Warm Up",
    duration: "8-10 min",
    focus: "Mobility",
    steps: "Light cardio, dynamic stretching, shoulder and hip opener.",
  },
  {
    title: "Strength Training",
    duration: "35-45 min",
    focus: "Muscle",
    steps: "Squat, press, row, deadlift pattern. Keep 60-90s rest between sets.",
  },
  {
    title: "Cardio Finish",
    duration: "12-20 min",
    focus: "Endurance",
    steps: "Treadmill intervals, bike sprint, or rowing at moderate intensity.",
  },
];

export default function WorkoutTrackingPage() {
  const [activities, setActivities] = useState([]);
  const [formValues, setFormValues] = useState({
    date: new Date().toISOString().slice(0, 10),
    type: "",
    duration: "",
    calories: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/activities", { params: { page: 1, limit: 100 } });
      setActivities(response.data?.data || []);
    } catch (err) {
      setError(getErrorMessage(err, "Gagal memuat workout."));
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const stats = useMemo(() => {
    const completed = activities.filter((activity) => activity.is_completed).length;
    return [
      { value: activities.length, label: "Sessions", caption: "Workout Completed" },
      { value: `${Math.max(activities.length * 1.5, 0).toFixed(0)}h ${activities.length * 12}m`, label: "", caption: "Active Hours" },
      { value: activities.length * 140, label: "kcal", caption: "Calories Burned" },
      { value: completed, label: "Visits", caption: "Checked in this week" },
    ];
  }, [activities]);

  const handleCreate = async (event) => {
    event.preventDefault();
    if (formValues.type.trim().length < 2) return;
    setSaving(true);
    setError("");
    try {
      await api.post("/activities", {
        taskName: `date: ${formValues.date} | type: ${formValues.type.trim()} | duration: ${formValues.duration.trim()} | calories: ${formValues.calories.trim()}`,
      });
      setFormValues({
        date: new Date().toISOString().slice(0, 10),
        type: "",
        duration: "",
        calories: "",
      });
      setShowForm(false);
      fetchActivities();
    } catch (err) {
      setError(getErrorMessage(err, "Gagal menambahkan workout."));
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field, value) => {
    setFormValues((current) => ({ ...current, [field]: value }));
  };

  const handleToggle = async (activity) => {
    try {
      await api.put(`/activities/${activity.id}`, { isCompleted: !activity.is_completed });
      fetchActivities();
    } catch (err) {
      setError(getErrorMessage(err, "Gagal memperbarui workout."));
    }
  };

  const handleDelete = async (activity) => {
    if (!window.confirm(`Hapus workout "${activity.task_name}"?`)) return;
    try {
      await api.delete(`/activities/${activity.id}`);
      fetchActivities();
    } catch (err) {
      setError(getErrorMessage(err, "Gagal menghapus workout."));
    }
  };

  return (
    <MemberLayout active="Workout Tracking">
      <style>{`
        .workout-page-title {
          color: #0b0871;
          font-family: 'Anton', sans-serif;
          font-size: 34px;
          font-weight: 400;
          letter-spacing: 0;
          line-height: 1;
          margin: 0 0 18px;
        }

        .workout-summary-grid {
          margin-bottom: 28px;
        }

        .weekly-card {
          background: #0b0871;
          border-radius: 8px;
          color: #fff;
          min-height: 120px;
        }

        .weekly-card {
          padding: 24px 28px;
        }

        .weekly-card h2 {
          color: #fff;
          font-family: 'Anton', sans-serif;
          font-size: 32px;
          font-weight: 400;
          line-height: 1;
          margin: 0 0 22px;
        }

        .weekly-stats {
          display: grid;
          gap: 12px;
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }

        .weekly-stat {
          background: rgba(255,255,255,.18);
          border-radius: 6px;
          min-height: 54px;
          padding: 10px 12px;
        }

        .weekly-stat strong {
          display: inline;
          font-size: 21px;
          font-weight: 900;
          line-height: 1;
        }

        .weekly-stat span {
          font-size: 10px;
          font-weight: 900;
          margin-left: 3px;
        }

        .weekly-stat small {
          color: rgba(255,255,255,.82);
          display: block;
          font-size: 8px;
          font-weight: 700;
          margin-top: 5px;
        }

        .recent-panel {
          background: #f8f8fb;
          border-radius: 10px;
          box-shadow: 0 14px 28px rgba(8,4,120,.12);
          padding: 24px 26px 28px;
        }

        .workout-content-grid {
          align-items: start;
          display: grid;
          gap: 24px;
          grid-template-columns: minmax(0, 1fr) 320px;
        }

        .recent-head {
          align-items: flex-start;
          display: flex;
          gap: 18px;
          justify-content: space-between;
          margin-bottom: 18px;
        }

        .recent-head h2 {
          color: #0b0871;
          font-size: 18px;
          font-weight: 900;
          margin: 0 0 4px;
        }

        .recent-head p {
          color: #292782;
          font-size: 12px;
          font-weight: 700;
          margin: 0;
        }

        .add-workout-btn,
        .save-workout-btn {
          background: #0b0871;
          border: 0;
          border-radius: 6px;
          color: #fff;
          cursor: pointer;
          font: inherit;
          font-size: 12px;
          font-weight: 900;
          height: 38px;
          padding: 0 18px;
        }

        .workout-form {
          display: grid;
          gap: 12px;
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .workout-input {
          background: #fff;
          border: 1px solid #d8d8e8;
          border-radius: 8px;
          color: #0b0871;
          font: inherit;
          height: 44px;
          padding: 0 14px;
        }

        .workout-field {
          display: grid;
          gap: 8px;
        }

        .workout-field span {
          color: #0b0871;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .workout-modal-backdrop {
          align-items: center;
          background: rgba(8, 4, 120, .54);
          display: flex;
          inset: 0;
          justify-content: center;
          padding: 28px;
          position: fixed;
          z-index: 1000;
        }

        .workout-modal {
          background: #f8f8fb;
          border-radius: 12px;
          box-shadow: 0 24px 80px rgba(0,0,0,.28);
          max-height: calc(100vh - 56px);
          overflow: auto;
          padding: 24px;
          width: min(100%, 640px);
        }

        .workout-modal-head {
          align-items: flex-start;
          display: flex;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 22px;
        }

        .workout-modal-head h2 {
          color: #0b0871;
          font-size: 20px;
          font-weight: 900;
          margin: 0 0 6px;
        }

        .workout-modal-head p {
          color: #292782;
          font-size: 12px;
          font-weight: 700;
          margin: 0;
        }

        .workout-close-btn {
          background: #e4e4ef;
          border: 0;
          border-radius: 50%;
          color: #0b0871;
          cursor: pointer;
          font: inherit;
          font-weight: 900;
          height: 36px;
          width: 36px;
        }

        .workout-modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 22px;
        }

        .cancel-workout-btn {
          background: #fff;
          border: 1px solid #0b0871;
          border-radius: 6px;
          color: #0b0871;
          cursor: pointer;
          font: inherit;
          font-size: 12px;
          font-weight: 900;
          height: 38px;
          padding: 0 18px;
        }

        .workout-table-wrap {
          overflow-x: auto;
        }

        .workout-table {
          border-collapse: collapse;
          color: #05050c;
          font-size: 12px;
          min-width: 760px;
          width: 100%;
        }

        .workout-table th {
          background: #d8d8e8;
          color: #0b0871;
          font-weight: 800;
          padding: 14px 18px;
          text-align: left;
        }

        .workout-table td {
          background: #fff;
          border-bottom: 1px solid #e4e4ef;
          padding: 16px 18px;
        }

        .workout-action-cell {
          display: flex;
          gap: 8px;
        }

        .table-action {
          background: transparent;
          border: 0;
          color: #0b0871;
          cursor: pointer;
          font: inherit;
          font-size: 12px;
          font-weight: 800;
          padding: 0;
        }

        .table-action.delete {
          color: #c73822;
        }

        .workout-error {
          color: #c73822;
          font-size: 13px;
          margin-bottom: 14px;
        }

        .workout-status {
          color: #6f72a6;
          padding: 24px;
          text-align: center;
        }

        .guide-panel {
          background: #f8f8fb;
          border-radius: 10px;
          box-shadow: 0 14px 28px rgba(8,4,120,.12);
          padding: 24px 26px 28px;
        }

        .guide-head {
          margin-bottom: 18px;
        }

        .guide-head h2 {
          color: #0b0871;
          font-size: 18px;
          font-weight: 900;
          margin: 0 0 4px;
        }

        .guide-head p {
          color: #292782;
          font-size: 12px;
          font-weight: 700;
          margin: 0;
        }

        .guide-grid {
          display: grid;
          gap: 16px;
          grid-template-columns: 1fr;
        }

        .guide-card {
          background: #fff;
          border: 1px solid #e4e4ef;
          border-radius: 8px;
          padding: 18px;
        }

        .guide-card span {
          background: #fff1e8;
          border-radius: 999px;
          color: #ff7a00;
          display: inline-flex;
          font-size: 10px;
          font-weight: 900;
          margin-bottom: 14px;
          padding: 6px 10px;
          text-transform: uppercase;
        }

        .guide-card h3 {
          color: #0b0871;
          font-size: 16px;
          font-weight: 900;
          margin: 0 0 8px;
        }

        .guide-card strong {
          color: #292782;
          display: block;
          font-size: 12px;
          margin-bottom: 10px;
        }

        .guide-card p {
          color: #52558f;
          font-size: 12px;
          font-weight: 700;
          line-height: 1.5;
          margin: 0;
        }

        @media (max-width: 1040px) {
          .workout-content-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 760px) {
          .weekly-stats,
          .workout-form {
            grid-template-columns: 1fr;
          }

          .workout-modal-actions {
            flex-direction: column;
          }

          .save-workout-btn,
          .cancel-workout-btn {
            width: 100%;
          }
        }
      `}</style>

      <h1 className="workout-page-title">Workout Tracking</h1>

      <section className="workout-summary-grid">
        <article className="weekly-card">
          <h2>Weekly Progress</h2>
          <div className="weekly-stats">
            {stats.map((stat) => (
              <div className="weekly-stat" key={stat.caption}>
                <strong>{stat.value}</strong>
                {stat.label && <span>{stat.label}</span>}
                <small>{stat.caption}</small>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="workout-content-grid">
        <section className="recent-panel">
          <div className="recent-head">
            <div>
              <h2>Recent Workout</h2>
              <p>Latest exercise logs</p>
            </div>
            <button className="add-workout-btn" onClick={() => setShowForm((value) => !value)} type="button">
              + Add Workout
            </button>
          </div>

          {error && <p className="workout-error">{error}</p>}

          <div className="workout-table-wrap">
            <table className="workout-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Duration</th>
                  <th>Calories</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td className="workout-status" colSpan="5">Memuat workout...</td>
                  </tr>
                )}
                {!loading && activities.length === 0 && (
                  <tr>
                    <td className="workout-status" colSpan="5">Belum ada workout.</td>
                  </tr>
                )}
                {!loading && activities.map((activity) => {
                  const meta = getWorkoutMeta(activity.task_name);
                  return (
                    <tr key={activity.id}>
                      <td>{meta.date ? formatDate(meta.date) : formatDate(activity.created_at)}</td>
                      <td>{meta.type}</td>
                      <td>{meta.duration}</td>
                      <td>{meta.calories}</td>
                      <td>
                        <div className="workout-action-cell">
                          <button className="table-action" onClick={() => handleToggle(activity)} type="button">
                            {activity.is_completed ? "Undo" : "Done"}
                          </button>
                          <button className="table-action delete" onClick={() => handleDelete(activity)} type="button">
                            Delete
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

        <aside className="guide-panel">
          <div className="guide-head">
            <h2>Workout Guide</h2>
            <p>Gunakan panduan ini untuk menyusun sesi latihan yang seimbang.</p>
          </div>
          <div className="guide-grid">
            {workoutGuides.map((guide) => (
              <article className="guide-card" key={guide.title}>
                <span>{guide.focus}</span>
                <h3>{guide.title}</h3>
                <strong>{guide.duration}</strong>
                <p>{guide.steps}</p>
              </article>
            ))}
          </div>
        </aside>
      </section>

      {showForm && (
        <div className="workout-modal-backdrop">
          <section className="workout-modal" role="dialog" aria-modal="true">
            <div className="workout-modal-head">
              <div>
                <h2>Add Workout</h2>
                <p>Isi data workout sesuai kolom tabel.</p>
              </div>
              <button className="workout-close-btn" onClick={() => setShowForm(false)} type="button">x</button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="workout-form">
                <label className="workout-field">
                  <span>Date</span>
                  <input
                    className="workout-input"
                    type="date"
                    value={formValues.date}
                    onChange={(event) => updateField("date", event.target.value)}
                  />
                </label>
                <label className="workout-field">
                  <span>Type</span>
                  <input
                    className="workout-input"
                    placeholder="Morning Run"
                    value={formValues.type}
                    onChange={(event) => updateField("type", event.target.value)}
                  />
                </label>
                <label className="workout-field">
                  <span>Duration</span>
                  <input
                    className="workout-input"
                    placeholder="35 min"
                    value={formValues.duration}
                    onChange={(event) => updateField("duration", event.target.value)}
                  />
                </label>
                <label className="workout-field">
                  <span>Calories</span>
                  <input
                    className="workout-input"
                    placeholder="280 kcal"
                    value={formValues.calories}
                    onChange={(event) => updateField("calories", event.target.value)}
                  />
                </label>
              </div>

              <div className="workout-modal-actions">
                <button className="cancel-workout-btn" onClick={() => setShowForm(false)} type="button">
                  Batal
                </button>
                <button className="save-workout-btn" disabled={saving} type="submit">
                  {saving ? "Menyimpan..." : "Simpan Workout"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </MemberLayout>
  );
}
