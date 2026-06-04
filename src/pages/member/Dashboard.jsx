import { useCallback, useEffect, useMemo, useState } from "react";
import MemberIcon from "../../components/member/MemberIcon";
import MemberLayout from "../../components/member/MemberLayout";
import api from "../../components/auth/authApi";

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

const getWorkoutStreak = (activities) => {
  const dates = new Set(
    activities
      .map((activity) => {
        const meta = getWorkoutMeta(activity.task_name);
        return getDateKey(meta.date || activity.created_at);
      })
      .filter(Boolean),
  );

  let streak = 0;
  const cursor = new Date();

  while (dates.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};

export default function MemberDashboard() {
  const [activities, setActivities] = useState([]);
  const [crowd, setCrowd] = useState({ count: 0, status: "Quiet" });
  const [currentVisit, setCurrentVisit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [activitiesResult, crowdResult, visitResult] = await Promise.allSettled([
        api.get("/activities", { params: { page: 1, limit: 100 } }),
        api.get("/visits/crowd"),
        api.get("/visits/me/current"),
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

      if (visitResult.status === "fulfilled") {
        setCurrentVisit(visitResult.value.data?.data || null);
      } else {
        setCurrentVisit(null);
      }

      const rejected = [activitiesResult, crowdResult, visitResult].find((result) => result.status === "rejected");
      if (rejected) setError(getErrorMessage(rejected.reason, "Sebagian data dashboard gagal dimuat."));
    } catch (err) {
      setError(getErrorMessage(err, "Gagal memuat dashboard."));
      setActivities([]);
      setCrowd({ count: 0, status: "Quiet" });
      setCurrentVisit(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

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
    const streak = getWorkoutStreak(activities);
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
      streak,
      recentWorkouts,
    };
  }, [activities]);

  const crowdCount = Number(crowd?.count || 0);
  const occupancy = Math.min(Math.round((crowdCount / GYM_CAPACITY) * 100), 100);
  const isCheckedIn = Boolean(currentVisit?.checked_in);
  const tapInTime = currentVisit?.visit?.tap_in_time;

  return (
    <MemberLayout active="Dashboard">
      <style>{`
        .dashboard-layout { align-items: start; display: grid; gap: 28px; grid-template-columns: minmax(0, 1fr) 300px; }
        .primary-stack, .side-stack { display: grid; gap: 18px; }
        .dashboard-alert { background: #fff1f0; border-radius: 8px; color: #c73822; font-size: 13px; font-weight: 800; padding: 12px 14px; }
        .recap-card, .activity-card { background: #0b0871; border-radius: 12px; color: #fff; overflow: hidden; padding: 24px 26px; position: relative; }
        .recap-card::before, .activity-card::before { background: rgba(255,255,255,.08); border-radius: 50%; content: ''; height: 170px; position: absolute; right: -40px; top: -48px; width: 170px; }
        .eyebrow { color: #d8d8ff; font-size: 12px; font-weight: 800; margin-bottom: 8px; text-transform: uppercase; }
        .recap-card h2 { color: #fff; font-family: 'Anton', sans-serif; font-size: 36px; font-weight: 400; margin-bottom: 20px; position: relative; z-index: 1; }
        .stats-row { display: grid; gap: 16px; grid-template-columns: repeat(4, minmax(0, 1fr)); position: relative; z-index: 1; }
        .stat-card { align-items: center; background: rgba(255,255,255,.25); border-radius: 8px; display: flex; gap: 10px; min-height: 68px; padding: 12px; }
        .stat-icon { align-items: center; background: #ff7a00; border-radius: 12px; display: inline-flex; flex: 0 0 auto; height: 38px; justify-content: center; width: 38px; }
        .stat-card strong { color: #fff; display: block; font-size: 22px; font-weight: 900; line-height: 1; }
        .stat-card span { color: #fff; display: block; font-size: 8px; font-weight: 700; margin-top: 3px; opacity: .9; }
        .history-link, .view-link { color: #ff7a00; display: inline-block; font-size: 14px; font-weight: 900; margin-top: 20px; text-decoration: none; }
        .activity-card { min-height: 176px; }
        .activity-card h3 { color: #fff; font-family: 'Anton', sans-serif; font-size: 21px; font-weight: 400; margin-bottom: 14px; position: relative; z-index: 1; }
        .live-pill { background: #ff7a00; border-radius: 999px; color: #fff; font-size: 9px; font-weight: 900; margin-left: 8px; padding: 3px 8px; vertical-align: middle; }
        .capacity { position: relative; z-index: 1; }
        .capacity strong { display: block; font-size: 35px; font-weight: 900; line-height: 1; }
        .capacity span { color: #fff; display: block; font-size: 14px; margin-top: 3px; }
        .progress-track { background: rgba(255,255,255,.28); border-radius: 999px; height: 10px; margin-top: 24px; overflow: hidden; position: relative; z-index: 1; }
        .progress-fill { background: #ff7a00; border-radius: inherit; height: 100%; transition: width .2s; }
        .streak-card, .status-card, .workout-item { border-radius: 12px; box-shadow: 0 3px 8px rgba(11,8,113,.08); }
        .streak-card { background: #ffdc7f; min-height: 290px; overflow: hidden; padding: 30px 24px; position: relative; }
        .streak-card h3 { color: #0b0871; font-family: 'Anton', sans-serif; font-size: 24px; font-weight: 400; margin-bottom: 28px; }
        .streak-number { align-items: center; color: #0b0871; display: flex; gap: 18px; }
        .streak-number svg { color: #ff7a00; height: 58px; width: 58px; }
        .streak-number strong { font-size: 32px; font-weight: 900; }
        .streak-note { color: #0b0871; font-size: 12px; font-weight: 800; margin: 24px 0 22px; }
        .week-row { display: grid; gap: 8px; grid-template-columns: repeat(7, 1fr); }
        .day { align-items: center; color: #0b0871; display: grid; font-size: 12px; font-weight: 900; gap: 6px; justify-items: center; }
        .day b { align-items: center; background: #ff7a00; border-radius: 50%; color: #fff; display: inline-flex; height: 28px; justify-content: center; width: 28px; }
        .day.is-soft b { background: rgba(255,122,0,.28); color: #ff7a00; }
        .status-card { background: #f4f5f9; min-height: 116px; padding: 20px; }
        .status-top { align-items: center; display: flex; justify-content: space-between; margin-bottom: 18px; }
        .status-top span { color: #6f72a6; font-size: 13px; font-weight: 900; text-transform: uppercase; }
        .status-top b { background: #84d69a; border-radius: 999px; color: #fff; font-size: 10px; padding: 4px 10px; text-transform: uppercase; }
        .status-top b.inactive { background: #c7cadb; }
        .status-card h3 { color: #0b0871; font-family: 'Anton', sans-serif; font-size: 26px; font-weight: 400; }
        .status-card small { color: #6f72a6; display: block; font-size: 10px; font-weight: 800; margin-top: 4px; }
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
        @media (max-width: 1120px) { .dashboard-layout { grid-template-columns: 1fr; } .side-stack { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 760px) { .stats-row, .side-stack { grid-template-columns: 1fr; } }
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
          <article className="activity-card">
            <h3>Gym Activity <span className="live-pill">LIVE</span></h3>
            <div className="capacity"><span>Current Visitors</span><strong>{crowdCount}/{GYM_CAPACITY}</strong><span>{crowd?.status || "Quiet"} condition</span></div>
            <div className="progress-track" aria-label={`${occupancy}% occupied`}><div className="progress-fill" style={{ width: `${occupancy}%` }} /></div>
          </article>
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
        <aside className="side-stack">
          <article className="streak-card">
            <h3>Workout Streak</h3>
            <div className="streak-number"><MemberIcon name="fire" /><strong>{dashboardData.streak} Days</strong></div>
            <p className="streak-note">"Progress starts with consistency."</p>
            <div className="week-row">
              {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
                <span className={`day ${index >= Math.min(dashboardData.streak, 7) ? "is-soft" : ""}`} key={`${day}-${index}`}><b>{index >= Math.min(dashboardData.streak, 7) ? day : <MemberIcon name="check" />}</b>{day}</span>
              ))}
            </div>
          </article>
          <article className="status-card">
            <div className="status-top"><span>Status</span><b className={isCheckedIn ? "" : "inactive"}>{isCheckedIn ? "Active" : "Inactive"}</b></div>
            <h3>{isCheckedIn ? "Checked In" : "Not Checked In"}</h3>
            <small>{isCheckedIn ? `Since ${formatTime(tapInTime)}` : "No active gym session"}</small>
          </article>
        </aside>
      </div>
    </MemberLayout>
  );
}
