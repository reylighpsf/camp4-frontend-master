import { useEffect } from "react";

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isLoading: externalIsLoading = false,
}) {
  const loading = externalIsLoading;

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === "Escape" && !loading) onCancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onCancel, loading]);

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes dialogPop {
          from { opacity: 0; transform: scale(0.94) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .dialog-overlay {
          position: fixed; inset: 0; z-index: 50;
          display: flex; align-items: center; justify-content: center;
          background: rgba(10,10,20,0.78);
          backdrop-filter: blur(6px);
        }
        .dialog-box {
          width: 100%; max-width: 380px; margin: 0 16px;
          background: rgba(15,15,28,0.98);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.7);
          overflow: hidden;
          animation: dialogPop 0.2s cubic-bezier(0.34,1.56,0.64,1);
          font-family: 'DM Sans', sans-serif;
        }
        .dialog-body { padding: 24px 24px 16px; }
        .dialog-icon-wrap {
          width: 42px; height: 42px;
          border-radius: 50%;
          background: rgba(239,68,68,0.12);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 14px;
        }
        .dialog-title {
          font-size: 15px; font-weight: 600; color: #f1f0ff;
          margin-bottom: 6px;
        }
        .dialog-message { font-size: 13.5px; color: #6b7280; line-height: 1.5; }
        .dialog-footer {
          display: flex; gap: 10px;
          padding: 16px 24px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .dialog-btn {
          flex: 1; padding: 11px;
          border-radius: 10px; border: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 500;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
        }
        .dialog-btn:hover { opacity: 0.88; transform: translateY(-1px); }
        .dialog-btn.cancel {
          background: rgba(255,255,255,0.05);
          color: #9ca3af;
          border: 1px solid rgba(255,255,255,0.07);
        }
        .dialog-btn.cancel:hover { background: rgba(255,255,255,0.09); }
        .dialog-btn.danger {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: #fff;
          box-shadow: 0 4px 12px rgba(239,68,68,0.3);
        }
      `}</style>

      <div className="dialog-overlay" onClick={onCancel}>
        <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
          <div className="dialog-body">
            <div className="dialog-icon-wrap">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#f87171"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4h6v2" />
              </svg>
            </div>
            <p className="dialog-title">{title || "Yakin?"}</p>
            <p className="dialog-message">
              {message || "Tindakan ini tidak dapat dibatalkan."}
            </p>
          </div>
          <div className="dialog-footer">
            <button className="dialog-btn cancel" onClick={onCancel}>
              Batal
            </button>
            <button
              className="dialog-btn danger"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? "Menghapus..." : "Ya, Hapus"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
