import { useState, useEffect, useRef } from "react";

export default function EditDialog({ isOpen, todo, onConfirm, onCancel }) {
  const [title, setTitle] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (!todo) return;
    const timeoutId = setTimeout(() => {
      setTitle(todo.title);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [todo]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onCancel]);

  if (!isOpen || !todo) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onConfirm(title.trim());
  };

  return (
    <>
      <style>{`
        @keyframes dialogPop {
          from { opacity: 0; transform: scale(0.94) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .edit-overlay {
          position: fixed; inset: 0; z-index: 50;
          display: flex; align-items: center; justify-content: center;
          background: rgba(10,10,20,0.78);
          backdrop-filter: blur(6px);
        }
        .edit-box {
          width: 100%; max-width: 380px; margin: 0 16px;
          background: rgba(15,15,28,0.98);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.7);
          overflow: hidden;
          animation: dialogPop 0.2s cubic-bezier(0.34,1.56,0.64,1);
          font-family: 'DM Sans', sans-serif;
        }
        .edit-body { padding: 24px; }
        .edit-icon-wrap {
          width: 42px; height: 42px;
          border-radius: 50%;
          background: rgba(99,102,241,0.12);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 14px;
        }
        .edit-title {
          font-size: 15px; font-weight: 600; color: #f1f0ff;
          margin-bottom: 16px;
        }
        .edit-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 11px 14px;
          color: #e5e7eb;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .edit-input::placeholder { color: #374151; }
        .edit-input:focus {
          border-color: rgba(99,102,241,0.6);
          background: rgba(99,102,241,0.05);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }
        .edit-footer {
          display: flex; gap: 10px;
          padding: 0 24px 20px;
        }
        .edit-btn {
          flex: 1; padding: 11px;
          border-radius: 10px; border: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 500;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
        }
        .edit-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .edit-btn.cancel {
          background: rgba(255,255,255,0.05);
          color: #9ca3af;
          border: 1px solid rgba(255,255,255,0.07);
        }
        .edit-btn.cancel:hover { background: rgba(255,255,255,0.09); }
        .edit-btn.save {
          background: linear-gradient(135deg, #6366f1, #7c3aed);
          color: #fff;
          box-shadow: 0 4px 12px rgba(99,102,241,0.35);
        }
        .edit-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>

      <div className="edit-overlay" onClick={onCancel}>
        <div className="edit-box" onClick={(e) => e.stopPropagation()}>
          <div className="edit-body">
            <div className="edit-icon-wrap">
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#818cf8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
            <p className="edit-title">Edit Tugas</p>
            <form onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="edit-input"
                placeholder="Judul tugas..."
              />
            </form>
          </div>
          <div className="edit-footer">
            <button className="edit-btn cancel" onClick={onCancel}>
              Batal
            </button>
            <button
              className="edit-btn save"
              onClick={() => title.trim() && onConfirm(title.trim())}
              disabled={!title.trim()}
            >
              Simpan
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
