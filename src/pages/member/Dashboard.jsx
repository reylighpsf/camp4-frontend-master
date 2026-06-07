import { useCallback, useEffect, useMemo, useState } from "react";
import MemberIcon from "../../components/member/MemberIcon";
import MemberLayout from "../../components/member/MemberLayout";
import api from "../../components/auth/authApi";
import { useAuth } from "../../components/auth/useAuth";

const GYM_CAPACITY = 100;

const getErrorMessage = (err, fallback) =>
  err.response?.data?.error || err.response?.data?.message || err.message || fallback;

const getWorkoutMeta = (name = "") => {
  const structured = Object.fromEntries(
    String(name)
      .split("|")
      .map((item) => item.split(":").map((part) => part.trim()))
      .filter(([key, value]) => key && value),
  );

  return {
    date: structured.date || "",
    title: structured.type || name || "Workout",
    duration: structured.duration || "50 min",
    calories: structured.calories || "",
  };
};

const parseMinutes = (duration = "") => {
  const value = String(duration).toLowerCase();
  const hours = Number(value.match(/(\d+(?:\.\d+)?)\s*h/)?.[1] || 0);
  const minutes = Number(value.match(/(\d+(?:\.\d+)?)\s*m/)?.[1] || 0);
  return Math.round(hours * 60 + minutes);
};

const formatHours = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours && !rest) return "0h";
  if (!hours) return `${rest}m`;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
};

const formatTime = (value) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

const getDateKey = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const getStoredTapHistory = (userId) => {
  if (!userId) return [];
  try {
    return JSON.parse(localStorage.getItem(`vocafit-tap-history-${userId}`) || "[]");
  } catch {
    return [];
  }
};

export default function MemberDashboard() {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [crowd, setCrowd] = useState({ count: 0, status: "Quiet" });
  const [profile, setProfile] = useState(null);
  const [tapRows, setTapRows] = useState(() => getStoredTapHistory(user?.id));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [
        activitiesResult,
        crowdResult,
        profileResult,
      ] = await Promise.allSettled([
        api.get("/activities", { params: { page: 1, limit: 100 } }),
        api.get("/visits/crowd"),
        api.get("/users/me"),
      ]);

      if (activitiesResult.status === "fulfilled") {
        setActivities(activitiesResult.value.data?.data || []);
      } else {
        setActivities([]);
      }

      if (crowdResult.status === "fulfilled") {
        setCrowd(crowdResult.value.data?.data || { count: 0, status: "Quiet" });
      } else {
        setCrowd({ count: 0, status: "Quiet" });
      }

      if (profileResult.status === "fulfilled") {
        setProfile(profileResult.value.data?.data || null);
      } else {
        setProfile(null);
      }

      const rejected = [crowdResult, profileResult].find(
        (result) => result.status === "rejected",
      );
      if (rejected) setError(getErrorMessage(rejected.reason, "Sebagian data dashboard gagal dimuat."));
    } catch (err) {
      setError(getErrorMessage(err, "Gagal memuat dashboard."));
      setActivities([]);
      setCrowd({ count: 0, status: "Quiet" });
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchDashboard();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [fetchDashboard]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setTapRows(getStoredTapHistory(user?.id || profile?.id));
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [profile?.id, user?.id]);

  const dashboardData = useMemo(() => {
    const completedActivities = activities.filter((activity) => activity.is_completed);
    const workoutMinutes = activities.reduce((sum, activity) => {
      const meta = getWorkoutMeta(activity.task_name);
      return sum + parseMinutes(meta.duration);
    }, 0);
    const monthlyCount = activities.filter((activity) => {
      const key = getDateKey(getWorkoutMeta(activity.task_name).date || activity.created_at);
      return key && key.startsWith(new Date().toISOString().slice(0, 7));
    }).length;
    const monthlyProgress = Math.min(Math.round((monthlyCount / 20) * 100), 100);
    const recentWorkouts = activities.slice(0, 3).map((activity) => {
      const meta = getWorkoutMeta(activity.task_name);
      return {
        id: activity.id,
        title: meta.title,
        meta: meta.duration,
        tone: activity.is_completed ? "Completed" : "In Progress",
      };
    });

    return {
      totalWorkouts: activities.length,
      hoursTrained: formatHours(workoutMinutes),
      monthlyProgress,
      completedCount: completedActivities.length,
      recentWorkouts,
    };
  }, [activities]);

  const crowdCount = Number(crowd?.count || 0);
  const occupancy = Math.min(Math.round((crowdCount / GYM_CAPACITY) * 100), 100);
  const latestSession = tapRows.find((row) => !row.tapOut) || tapRows[0] || null;
  const isCheckedIn = Boolean(latestSession && !latestSession.tapOut);
  const tapInTime = latestSession?.tapIn || null;

  return (
    <MemberLayout active="Dashboard">
      <style>{`
        .dashboard-layout { align-items: start; display: grid; gap: 18px; grid-template-columns: 1fr; width: 100%; }
        .primary-stack { display: grid; gap: 16px; }
        .dashboard-alert { background: #fff1f0; border-radius: 8px; color: #c73822; font-size: 13px; font-weight: 800; margin-bottom: 16px; padding: 12px 14px; }
        .recap-card, .activity-card { background: #0b0871; border-radius: 10px; color: #fff; overflow: hidden; padding: 28px 28px 24px; position: relative; width: 100%; }
        .recap-card { min-height: 250px; }
        .dashboard-bottom-grid { align-items: stretch; display: grid; gap: 22px; grid-template-columns: minmax(0, 1.8fr) minmax(260px, .95fr); }
        .activity-card { min-height: 190px; padding-bottom: 26px; }
        .status-card { background: #ffffff; border-radius: 10px; box-shadow: 0 12px 24px rgba(8,4,120,.08); color: #0b0871; min-height: 190px; padding: 28px 24px; }
        .recap-card::before, .activity-card::before { background: rgba(255,255,255,.08); border-radius: 50%; content: ''; height: 190px; position: absolute; right: -48px; top: -58px; width: 190px; }
        .eyebrow { color: #f2f0ff; font-size: 12px; font-weight: 900; margin-bottom: 16px; position: relative; text-transform: uppercase; z-index: 1; }
        .recap-card h2 { color: #fff; font-family: 'Anton', sans-serif; font-size: clamp(30px, 3vw, 44px); font-weight: 400; line-height: 1; margin-bottom: 30px; max-width: 780px; position: relative; z-index: 1; }
        .stats-row { display: grid; gap: 18px; grid-template-columns: repeat(4, minmax(0, 1fr)); max-width: 960px; position: relative; z-index: 1; }
        .stat-card { align-items: center; background: rgba(255,255,255,.26); border-radius: 8px; display: flex; gap: 12px; min-height: 76px; min-width: 0; padding: 14px; }
        .stat-icon { align-items: center; background: #ff7a00; border-radius: 13px; color: #fff; display: inline-flex; flex: 0 0 auto; height: 48px; justify-content: center; width: 48px; }
        .stat-icon svg { height: 23px; width: 23px; }
        .stat-card strong { color: #fff; display: block; font-size: 25px; font-weight: 900; line-height: 1; overflow-wrap: anywhere; }
        .stat-card span { color: #fff; display: block; font-size: 9px; font-weight: 800; line-height: 1.25; margin-top: 5px; opacity: .95; }
        .recap-meta-row { display: none; }
        .recap-meta-card { background: rgba(255,255,255,.20); border-radius: 8px; min-height: 122px; padding: 18px 20px; }
        .recap-meta-card span { color: #f2f0ff; display: block; font-size: 12px; font-weight: 900; margin-bottom: 9px; text-transform: uppercase; }
        .recap-meta-card strong { color: #fff; display: block; font-size: 20px; font-weight: 900; line-height: 1.2; overflow-wrap: anywhere; }
        .recap-meta-card small { color: #f2f0ff; display: block; font-size: 12px; font-weight: 800; margin-top: 9px; }
        .recap-badge { border-radius: 999px; display: inline-flex; font-size: 11px; font-weight: 900; margin-top: 12px; padding: 6px 12px; text-transform: uppercase; }
        .recap-badge.active { background: #edfdf3; color: #16794c; }
        .recap-badge.pending { background: #fff4d8; color: #9a5a00; }
        .recap-badge.inactive { background: #eef0f5; color: #70758d; }
        .history-link, .view-link { color: #ff7a00; display: inline-block; font-size: 14px; font-weight: 900; margin-top: 22px; position: relative; text-decoration: none; z-index: 1; }
        .activity-card h3 { color: #fff; font-family: 'Anton', sans-serif; font-size: 24px; font-weight: 400; line-height: 1; margin-bottom: 24px; position: relative; z-index: 1; }
        .live-pill { background: #ff7a00; border-radius: 999px; color: #fff; display: inline-flex; font-family: 'DM Sans', sans-serif; font-size: 9px; font-weight: 900; margin-left: 8px; padding: 5px 9px; vertical-align: middle; }
        .capacity { position: relative; z-index: 1; }
        .capacity strong { display: block; font-size: 40px; font-weight: 900; line-height: 1; margin-top: 2px; }
        .capacity span { color: #fff; display: block; font-size: 15px; font-weight: 700; margin-top: 6px; }
        .progress-track { background: rgba(255,255,255,.30); border-radius: 999px; height: 10px; margin-top: 32px; overflow: hidden; position: relative; z-index: 1; }
        .progress-fill { background: #ff7a00; border-radius: inherit; height: 100%; transition: width .2s; }
        .status-card-head { align-items: center; display: flex; justify-content: space-between; margin-bottom: 34px; }
        .status-card-head span { color: #625f9d; font-size: 12px; font-weight: 900; text-transform: uppercase; }
        .status-pill { border-radius: 999px; font-size: 10px; font-weight: 900; padding: 4px 10px; text-transform: uppercase; }
        .status-pill.active { background: #dff9eb; color: #16864d; }
        .status-pill.inactive { background: #eef0f5; color: #70758d; }
        .status-card strong { color: #0b0871; display: block; font-family: 'Anton', sans-serif; font-size: 28px; font-weight: 400; line-height: 1; }
        .status-card small { color: #6b6fa3; display: block; font-size: 12px; font-weight: 800; margin-top: 8px; }
        .workout-item { border-radius: 12px; box-shadow: 0 3px 8px rgba(11,8,113,.08); }
        .recent-head { align-items: end; display: flex; justify-content: space-between; margin: 8px 0 18px; }
        .recent-head h2 { color: #0b0871; font-size: 18px; font-weight: 900; text-transform: uppercase; }
        .recent-head p { color: #0b0871; font-size: 14px; margin-top: 4px; opacity: .85; }
        .view-link { margin: 0; }
        .workouts { display: grid; gap: 18px; }
        .workout-item { align-items: center; background: #f4f5f9; display: flex; gap: 16px; min-height: 62px; padding: 13px 20px; }
        .workout-icon { align-items: center; background: #0b0871; border-radius: 50%; color: #fff; display: inline-flex; flex: 0 0 auto; height: 40px; justify-content: center; width: 40px; }
        .workout-item h3 { color: #0b0871; font-size: 16px; font-weight: 900; margin-bottom: 4px; }
        .workout-item p { color: #6470a8; font-size: 13px; font-weight: 700; }
        .workout-item em { color: #ff7a00; font-style: normal; margin-left: 12px; }
        .empty-workouts { background: #f4f5f9; border-radius: 12px; color: #6470a8; font-size: 13px; font-weight: 800; padding: 20px; }
        @media (max-width: 1120px) { .stats-row { grid-template-columns: repeat(2, minmax(0, 1fr)); } .dashboard-bottom-grid { grid-template-columns: 1fr; } }
        @media (max-width: 760px) { .recap-card, .activity-card, .status-card { padding: 22px 18px; } .stats-row { grid-template-columns: 1fr; } .recap-card h2 { font-size: 30px; } }
      `}</style>
      <h1 className="page-title">Dashboard</h1>
      {error && <div className="dashboard-alert">{error}</div>}
      <div className="dashboard-layout">
        <div className="primary-stack">
          <article className="recap-card">
            <p className="eyebrow">Today's Recap</p>
            <h2>{loading ? "Loading Journey" : "Your Workout Journey"}</h2>
            <div className="stats-row">
              <div className="stat-card"><span className="stat-icon"><MemberIcon name="grid" /></span><div><strong>{dashboardData.totalWorkouts}</strong><span>Total Workouts</span></div></div>
              <div className="stat-card"><span className="stat-icon"><MemberIcon name="calendar" /></span><div><strong>{dashboardData.hoursTrained}</strong><span>Hours Trained</span></div></div>
              <div className="stat-card"><span className="stat-icon"><MemberIcon name="login" /></span><div><strong>{dashboardData.monthlyProgress}%</strong><span>Monthly Progress</span></div></div>
              <div className="stat-card"><span className="stat-icon"><MemberIcon name="check" /></span><div><strong>{dashboardData.completedCount}</strong><span>Completed</span></div></div>
            </div>
            <a className="history-link" href="#recent-workouts">View full history -&gt;</a>
          </article>
          <div className="dashboard-bottom-grid">
            <article className="activity-card">
              <h3>Gym Activity <span className="live-pill">LIVE</span></h3>
              <div className="capacity"><span>Current Visitors</span><strong>{crowdCount}/{GYM_CAPACITY}</strong><span>{crowd?.status || "Quiet"} condition</span></div>
              <div className="progress-track" aria-label={`${occupancy}% occupied`}><div className="progress-fill" style={{ width: `${occupancy}%` }} /></div>
            </article>
            <article className="status-card">
              <div className="status-card-head">
                <span>Status</span>
                <b className={`status-pill ${isCheckedIn ? "active" : "inactive"}`}>{isCheckedIn ? "Active" : "Inactive"}</b>
              </div>
              <strong>{isCheckedIn ? "Checked In" : "Not Checked In"}</strong>
              <small>{isCheckedIn ? `Since ${formatTime(tapInTime)}` : "No active gym session"}</small>
            </article>
          </div>
          <section id="recent-workouts">
            <div className="recent-head"><div><h2>Recent Workouts</h2><p>Tracks your latest completed sessions.</p></div><a className="view-link" href="/member/workout-tracking">View full -&gt;</a></div>
            <div className="workouts">
              {dashboardData.recentWorkouts.length === 0 && <div className="empty-workouts">Belum ada workout yang tercatat.</div>}
              {dashboardData.recentWorkouts.map((workout) => (
                <article className="workout-item" key={workout.id}>
                  <span className="workout-icon"><MemberIcon name="dumbbell" /></span>
                  <div><h3>{workout.title}</h3><p>{workout.meta}<em>- {workout.tone}</em></p></div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </MemberLayout>
  );
}
