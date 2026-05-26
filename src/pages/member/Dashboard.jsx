import MemberIcon from "../../components/member/MemberIcon";
import MemberLayout from "../../components/member/MemberLayout";

const workouts = [
  { title: "Push Day", meta: "1h 24m", tone: "Medium Intensity" },
  { title: "Leg Workout", meta: "2h 05m", tone: "High Intensity" },
  { title: "Cardio Session", meta: "45m", tone: "Fat Burn" },
];

export default function MemberDashboard() {
  return (
    <MemberLayout active="Dashboard">
      <style>{`
        .dashboard-layout { align-items: start; display: grid; gap: 28px; grid-template-columns: minmax(0, 1fr) 300px; }
        .primary-stack, .side-stack { display: grid; gap: 18px; }
        .recap-card, .activity-card { background: #0b0871; border-radius: 12px; color: #fff; overflow: hidden; padding: 24px 26px; position: relative; }
        .recap-card::before, .activity-card::before { background: rgba(255,255,255,.08); border-radius: 50%; content: ''; height: 170px; position: absolute; right: -40px; top: -48px; width: 170px; }
        .eyebrow { color: #d8d8ff; font-size: 12px; font-weight: 800; margin-bottom: 8px; text-transform: uppercase; }
        .recap-card h2 { color: #fff; font-family: 'Anton', sans-serif; font-size: 36px; font-weight: 400; margin-bottom: 20px; position: relative; z-index: 1; }
        .stats-row { display: grid; gap: 16px; grid-template-columns: repeat(4, minmax(0, 1fr)); position: relative; z-index: 1; }
        .stat-card { align-items: center; background: rgba(255,255,255,.25); border-radius: 8px; display: flex; gap: 10px; min-height: 68px; padding: 12px; }
        .stat-card[aria-hidden="true"] { opacity: .55; }
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
        .progress-fill { background: #ff7a00; border-radius: inherit; height: 100%; width: 76%; }
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
        @media (max-width: 1120px) { .dashboard-layout { grid-template-columns: 1fr; } .side-stack { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 760px) { .stats-row, .side-stack { grid-template-columns: 1fr; } }
      `}</style>
      <h1 className="page-title">Dashboard</h1>
      <div className="dashboard-layout">
        <div className="primary-stack">
          <article className="recap-card">
            <p className="eyebrow">Today's Recap</p>
            <h2>Your Workout Journey</h2>
            <div className="stats-row">
              <div className="stat-card"><span className="stat-icon"><MemberIcon name="grid" /></span><div><strong>151</strong><span>Total Workouts</span></div></div>
              <div className="stat-card"><span className="stat-icon"><MemberIcon name="calendar" /></span><div><strong>86</strong><span>Hours Trained</span></div></div>
              <div className="stat-card"><span className="stat-icon"><MemberIcon name="login" /></span><div><strong>75%</strong><span>Monthly Progress</span></div></div>
              <div className="stat-card" aria-hidden="true" />
            </div>
            <a className="history-link" href="#recent-workouts">View full history -&gt;</a>
          </article>
          <article className="activity-card">
            <h3>Gym Activity <span className="live-pill">LIVE</span></h3>
            <div className="capacity"><span>Current Visitors</span><strong>76/100</strong><span>People</span></div>
            <div className="progress-track" aria-label="76% occupied"><div className="progress-fill" /></div>
          </article>
          <section id="recent-workouts">
            <div className="recent-head"><div><h2>Recent Workouts</h2><p>Tracks your latest completed sessions.</p></div><a className="view-link" href="#recent-workouts">View full -&gt;</a></div>
            <div className="workouts">
              {workouts.map((workout) => (
                <article className="workout-item" key={workout.title}>
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
            <div className="streak-number"><MemberIcon name="fire" /><strong>32 Days</strong></div>
            <p className="streak-note">"Progress starts with consistency."</p>
            <div className="week-row">
              {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
                <span className={`day ${index > 4 ? "is-soft" : ""}`} key={`${day}-${index}`}><b>{index > 4 ? "S" : <MemberIcon name="check" />}</b>{day}</span>
              ))}
            </div>
          </article>
          <article className="status-card"><div className="status-top"><span>Status</span><b>Active</b></div><h3>Checked In</h3><small>Since 2:02 PM</small></article>
        </aside>
      </div>
    </MemberLayout>
  );
}
