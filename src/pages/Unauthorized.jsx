import { Link } from "react-router";

export default function Unauthorized() {
  return (
    <>
      <style>{`
        .page {
          min-height: 100vh;
          background: #0a0a14;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Sans', sans-serif;
          color: #e5e7eb;
          padding: 20px;
        }

        .card {
          background: rgba(15,15,28,0.95);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          padding: 40px;
          text-align: center;
          max-width: 420px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        }

        .code {
          font-size: 40px;
          color: #f87171;
          font-weight: 700;
        }

        .btn {
          margin-top: 20px;
          display: inline-block;
          padding: 10px 16px;
          border-radius: 10px;
          background: linear-gradient(135deg, #6366f1, #7c3aed);
          color: white;
          text-decoration: none;
          font-size: 14px;
        }
      `}</style>

      <div className="page">
        <div className="card">
          <div className="code">403</div>
          <h1 className="mt-2">Unauthorized</h1>
          <p className="text-sm text-gray-400">
            Kamu tidak punya akses ke halaman ini
          </p>

          <Link to="/" className="btn">
            Kembali ke Home
          </Link>
        </div>
      </div>
    </>
  );
}
