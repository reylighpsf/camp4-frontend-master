import { useState } from "react";
import { useTodos } from "./useTodos";
import { todoApi } from "./todoApi";

export default function TodoForm() {
  const { dispatch } = useTodos();
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    const res = await todoApi.create({ title });
    setIsSubmitting(false);

    if (res.ok) {
      dispatch({ type: "ADD", payload: res.data });
      setTitle("");
    } else {
      alert(res.error);
    }
  };

  return (
    <>
      <style>{`
        .todo-form {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }
        .todo-input {
          flex: 1;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 12px 16px;
          color: #e5e7eb;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .todo-input::placeholder { color: #374151; }
        .todo-input:focus {
          border-color: rgba(99,102,241,0.6);
          background: rgba(99,102,241,0.05);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }
        .todo-add-btn {
          padding: 12px 18px;
          background: linear-gradient(135deg, #6366f1, #7c3aed);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 14px rgba(99,102,241,0.35);
          white-space: nowrap;
        }
        .todo-add-btn:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(99,102,241,0.45);
        }
        .todo-add-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      <form onSubmit={handleSubmit} className="todo-form">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="todo-input"
          placeholder="Tambah tugas baru..."
        />
        <button type="submit" disabled={isSubmitting} className="todo-add-btn">
          {isSubmitting ? "..." : "+ Tambah"}
        </button>
      </form>
    </>
  );
}
