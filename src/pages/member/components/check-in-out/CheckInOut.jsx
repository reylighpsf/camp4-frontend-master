import MemberLayout from "../../../../components/member/MemberLayout";
import MemberIcon from "../../../../components/member/MemberIcon";
import vocafitLogo from "../../../../assets/auth/vocafit-logo.png";

const qrCells = [
  1, 1, 1, 0, 0, 1, 0, 1, 1, 1,
  1, 0, 1, 1, 0, 0, 1, 0, 0, 1,
  1, 1, 1, 0, 1, 1, 0, 1, 1, 1,
  0, 1, 0, 1, 1, 0, 1, 1, 0, 0,
  1, 0, 1, 0, 0, 1, 1, 0, 1, 1,
  0, 1, 1, 1, 0, 1, 0, 1, 0, 1,
  1, 0, 0, 1, 1, 0, 1, 0, 1, 0,
  1, 1, 0, 0, 1, 1, 0, 1, 1, 0,
  0, 1, 1, 0, 1, 0, 1, 0, 0, 1,
  1, 0, 1, 1, 0, 1, 0, 1, 1, 1,
];

const tapHistory = [
  ["15 May 2026", "07:10 AM", "09:00 AM", "1h 50m"],
  ["14 May 2026", "08:43 AM", "10:07 AM", "1h 24m"],
  ["13 May 2026", "08:30 AM", "09:45 AM", "1h 15m"],
];

export default function CheckInOutPage() {
  return (
    <MemberLayout active="Check In/Check Out">
      <style>{`
        .tap-page { display: grid; gap: 30px; }
        .tap-title { color: #080478; font-family: 'Anton', sans-serif; font-size: 34px; font-weight: 400; letter-spacing: 0; line-height: 1; }
        .tap-grid { display: grid; grid-template-columns: minmax(360px, 1fr) minmax(330px, .95fr); gap: 32px; }
        .tap-card { background: #f8f8fb; border-radius: 10px; box-shadow: 0 14px 28px rgba(8, 4, 120, .16); padding: 28px; }
        .tap-profile { display: flex; align-items: center; gap: 18px; border-bottom: 1px solid #cfd0df; padding-bottom: 18px; }
        .tap-avatar { width: 56px; height: 56px; display: grid; place-items: center; background: #766bd2; border: 2px solid #ff7a00; border-radius: 50%; color: #fff; }
        .tap-profile h2 { color: #080478; font-size: 19px; font-weight: 900; margin: 0 0 4px; }
        .tap-profile p { color: #44449b; font-size: 13px; font-weight: 700; margin: 0; }
        .qr-frame { width: min(240px, 100%); aspect-ratio: 1; display: grid; place-items: center; margin: 42px auto 34px; padding: 26px; background: #fff; border-radius: 10px; box-shadow: 0 0 22px rgba(8, 4, 120, .14); }
        .qr-code { position: relative; width: 100%; aspect-ratio: 1; display: grid; grid-template-columns: repeat(10, 1fr); gap: 4px; background: #fff; }
        .qr-code i { background: #050505; min-width: 0; min-height: 0; }
        .qr-corner { position: absolute; width: 42px; height: 42px; border: 7px solid #050505; border-radius: 8px; background: #fff; }
        .qr-corner::after { content: ""; position: absolute; inset: 7px; background: #050505; border-radius: 4px; }
        .qr-corner.tl { top: 0; left: 0; }
        .qr-corner.tr { top: 0; right: 0; }
        .qr-corner.bl { bottom: 0; left: 0; }
        .qr-logo { position: absolute; inset: 50%; width: 42px; height: 42px; padding: 5px; transform: translate(-50%, -50%); background: #fff; border-radius: 8px; object-fit: contain; }
        .tap-actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; border-bottom: 1px solid #cfd0df; padding-bottom: 18px; }
        .tap-button { min-height: 36px; border: 0; border-radius: 7px; color: #fff; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 10px; font: inherit; font-size: 11px; font-weight: 800; }
        .tap-button.hide { background: #080478; }
        .tap-button.refresh { background: #ff7415; }
        .tap-help { color: #44449b; font-size: 12px; font-weight: 700; margin: 18px 0 0; text-align: center; }
        .session-title { color: #080478; font-size: 24px; font-weight: 900; margin: 0 0 26px; }
        .session-list { display: grid; gap: 22px; }
        .session-item span { display: block; color: #6867a9; font-size: 12px; font-weight: 800; margin-bottom: 9px; }
        .session-box { min-height: 76px; display: flex; align-items: center; gap: 16px; border-radius: 8px; padding: 14px 26px; }
        .session-box.orange { background: #ffd8bd; border: 1.5px solid #ff7415; color: #ff7415; }
        .session-box.yellow { background: #fff6dd; border: 1.5px solid #ffd76a; color: #ffb100; }
        .session-box.blue { background: #c8c8e5; border: 1.5px solid #080478; color: #080478; }
        .session-icon { width: 44px; height: 44px; display: grid; place-items: center; flex: 0 0 auto; border-radius: 8px; color: #fff; }
        .session-box.orange .session-icon { background: #ff7415; }
        .session-box.yellow .session-icon { background: #ffd76a; }
        .session-box.blue .session-icon { background: #080478; }
        .session-copy strong { display: block; font-size: 18px; font-weight: 900; line-height: 1.1; }
        .session-copy small { display: block; font-size: 11px; font-weight: 700; opacity: .75; }
        .history-card { background: #f8f8fb; border-radius: 10px; box-shadow: 0 14px 28px rgba(8, 4, 120, .12); padding: 24px 28px 34px; }
        .history-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; margin-bottom: 28px; }
        .history-head h2 { color: #080478; font-size: 20px; font-weight: 900; margin: 0 0 4px; }
        .history-head p { color: #44449b; font-size: 12px; font-weight: 700; margin: 0; }
        .history-select { height: 42px; min-width: 72px; border: 0; border-radius: 5px; background: #080478; color: #fff; font: inherit; font-weight: 900; padding: 0 12px; }
        .tap-table { width: 100%; border-collapse: collapse; color: #05050c; font-size: 13px; }
        .tap-table th { background: #d8d8e8; color: #080478; font-weight: 900; padding: 16px 18px; text-align: left; }
        .tap-table td { background: #fff; border-bottom: 1px solid #e4e4ef; padding: 18px; }
        @media (max-width: 1040px) { .tap-grid { grid-template-columns: 1fr; } }
        @media (max-width: 680px) { .tap-title { font-size: 30px; } .tap-card, .history-card { padding: 20px; } .tap-actions { grid-template-columns: 1fr; } .tap-table { min-width: 620px; } .history-table-wrap { overflow-x: auto; } }
      `}</style>

      <section className="tap-page">
        <h1 className="tap-title">Tap In/Tap Out</h1>

        <div className="tap-grid">
          <article className="tap-card">
            <div className="tap-profile">
              <span className="tap-avatar"><MemberIcon name="flower" /></span>
              <div>
                <h2>John Doe</h2>
                <p>ID: VF1234567890</p>
              </div>
            </div>

            <div className="qr-frame">
              <div className="qr-code" aria-label="QR code">
                {qrCells.map((isFilled, index) => <i key={index} style={{ opacity: isFilled ? 1 : 0 }} />)}
                <span className="qr-corner tl" />
                <span className="qr-corner tr" />
                <span className="qr-corner bl" />
                <img className="qr-logo" src={vocafitLogo} alt="" />
              </div>
            </div>

            <div className="tap-actions">
              <button className="tap-button hide" type="button">Hide QR Code</button>
              <button className="tap-button refresh" type="button">Refresh QR</button>
            </div>
            <p className="tap-help">Show this QR code at the entrance gate.</p>
          </article>

          <aside className="tap-card">
            <h2 className="session-title">Today’s Session</h2>
            <div className="session-list">
              <div className="session-item">
                <span>Tap-In Status</span>
                <div className="session-box orange">
                  <span className="session-icon"><MemberIcon name="login" /></span>
                  <div className="session-copy"><small>You are currently</small><strong>Checked In</strong></div>
                </div>
              </div>
              <div className="session-item">
                <span>Latest Activity</span>
                <div className="session-box yellow">
                  <span className="session-icon">◷</span>
                  <div className="session-copy"><strong>08:43 AM - Tap In</strong><small>Today, May 13, 2026</small></div>
                </div>
              </div>
              <div className="session-item">
                <span>Workout Duration</span>
                <div className="session-box blue">
                  <span className="session-icon">↻</span>
                  <div className="session-copy"><strong>1h 24m</strong><small>Time in Gym</small></div>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <section className="history-card">
          <div className="history-head">
            <div>
              <h2>Tap History</h2>
              <p>Recent gym access logs</p>
            </div>
            <select className="history-select" defaultValue="10" aria-label="Jumlah data">
              <option value="10">10</option>
              <option value="20">20</option>
            </select>
          </div>

          <div className="history-table-wrap">
            <table className="tap-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Tap In</th>
                  <th>Tap Out</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {tapHistory.map(([date, tapIn, tapOut, duration]) => (
                  <tr key={date}>
                    <td>{date}</td>
                    <td>{tapIn}</td>
                    <td>{tapOut}</td>
                    <td>{duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </MemberLayout>
  );
}
