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

const formatDate = (value) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
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

const isMembershipTransaction = (transaction) => {
  const family = String(transaction?.transaction_family || "").toUpperCase();
  const type = String(transaction?.transaction_type || "").toUpperCase();
  return family === "MEMBERSHIP" || type.startsWith("MEMBERSHIP_");
};

const getActiveMembershipSnapshot = (transactions, catalogs) => {
  const successfulMemberships = transactions
    .filter((transaction) => transaction.status === "SUCCESS" && isMembershipTransaction(transaction))
    .sort((a, b) => new Date(b.settled_at || b.created_at).getTime() - new Date(a.settled_at || a.created_at).getTime());

  for (const transaction of successfulMemberships) {
    const catalog = catalogs.find((item) => item.code === transaction.transaction_type);
    const start = new Date(transaction.settled_at || transaction.created_at);
    const durationDays =
      Number(catalog?.duration_days) ||
      (String(transaction.transaction_type || "").toUpperCase().includes("DAILY") ? 1 : 30);
    const end = new Date(start.getTime() + durationDays * 24 * 60 * 60 * 1000);

    if (end.getTime() > Date.now()) {
      return {
        activeUntil: end,
        name: catalog?.name || transaction.catalog_name || transaction.transaction_type,
        status: "Active",
      };
    }
  }

  const pendingMembership = transactions.find(
    (transaction) => transaction.status === "PENDING" && isMembershipTransaction(transaction),
  );

  if (pendingMembership) {
    const catalog = catalogs.find((item) => item.code === pendingMembership.transaction_type);
    return {
      activeUntil: null,
      name: catalog?.name || pendingMembership.catalog_name || pendingMembership.transaction_type,
      status: "Pending Payment",
    };
  }

  return {
    activeUntil: null,
    name: "No active membership",
    status: "Inactive",
  };
};

export default function MemberDashboard() {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [catalogs, setCatalogs] = useState([]);
  const [crowd, setCrowd] = useState({ count: 0, status: "Quiet" });
  const [profile, setProfile] = useState(null);
  const [tapRows, setTapRows] = useState(() => getStoredTapHistory(user?.id));
  const [transactions, setTransactions] = useState([]);
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
        transactionsResult,
        catalogsResult,
      ] = await Promise.allSettled([
        api.get("/activities", { params: { page: 1, limit: 100 } }),
        api.get("/visits/crowd"),
        api.get("/users/me"),
        api.get("/transactions/history", { params: { page: 1, limit: 50 } }),
        api.get("/catalogs"),
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

      if (transactionsResult.status === "fulfilled") {
        setTransactions(transactionsResult.value.data?.data || []);
      } else {
        setTransactions([]);
      }

      if (catalogsResult.status === "fulfilled") {
        setCatalogs(catalogsResult.value.data?.data || []);
      } else {
        setCatalogs([]);
      }

      const rejected = [crowdResult, profileResult, transactionsResult, catalogsResult].find(
        (result) => result.status === "rejected",
      );
      if (rejected) setError(getErrorMessage(rejected.reason, "Sebagian data dashboard gagal dimuat."));
    } catch (err) {
      setError(getErrorMessage(err, "Gagal memuat dashboard."));
      setActivities([]);
      setCatalogs([]);
      setCrowd({ count: 0, status: "Quiet" });
      setProfile(null);
      setTransactions([]);
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
  const membershipSnapshot = useMemo(
    () => getActiveMembershipSnapshot(transactions, catalogs),
    [catalogs, transactions],
  );
  const latestSession = tapRows.find((row) => !row.tapOut) || tapRows[0] || null;
  const isCheckedIn = Boolean(latestSession && !latestSession.tapOut);
  const tapInTime = latestSession?.tapIn || null;
  const displayName = profile?.full_name || user?.full_name || user?.name || "Member";

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
        .status-card, .workout-item { border-radius: 12px; box-shadow: 0 3px 8px rgba(11,8,113,.08); }
        .membership-card { background: #fff; border-radius: 12px; box-shadow: 0 3px 8px rgba(11,8,113,.08); padding: 20px; }
        .membership-card span { color: #6f72a6; display: block; font-size: 12px; font-weight: 900; margin-bottom: 8px; text-transform: uppercase; }
        .membership-card h3 { color: #0b0871; font-size: 18px; font-weight: 900; line-height: 1.2; margin: 0 0 12px; }
        .membership-card p { color: #6470a8; font-size: 12px; font-weight: 800; margin: 0 0 14px; }
        .membership-badge { border-radius: 999px; display: inline-flex; font-size: 10px; font-weight: 900; padding: 5px 10px; text-transform: uppercase; }
        .membership-badge.active { background: #edfdf3; color: #16794c; }
        .membership-badge.pending { background: #fff4d8; color: #9a5a00; }
        .membership-badge.inactive { background: #eef0f5; color: #70758d; }
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
            <h2>{loading ? "Loading Journey" : `${displayName}'s Journey`}</h2>
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
          <article className="membership-card">
            <span>Membership</span>
            <h3>{membershipSnapshot.name}</h3>
            <p>Active until: {formatDate(membershipSnapshot.activeUntil)}</p>
            <strong className={`membership-badge ${membershipSnapshot.status.toLowerCase().split(" ")[0]}`}>
              {membershipSnapshot.status}
            </strong>
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
