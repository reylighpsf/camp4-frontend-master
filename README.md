# Todo App — Complete Tutorial & Documentation

> **Stack:** React 19 · React Router v7 · Tailwind CSS · Zod · Axios · Vite

---

## Table of Contents

1. [Project Structure Overview](#1-project-structure-overview)
2. [App Entry Point & Bootstrap](#2-app-entry-point--bootstrap)
3. [Routing — React Router v7](#3-routing--react-router-v7)
4. [HTTP Layer — Axios](#4-http-layer--axios)
5. [Data Validation — Zod](#5-data-validation--zod)
6. [State Management — Context + useReducer](#6-state-management--context--usereducer)
7. [API Module — todoApi](#7-api-module--todoapi)
8. [UI Components](#8-ui-components)
   - [TodosPage](#81-todospage)
   - [TodoForm](#82-todoform)
   - [TodoList](#83-todolist)
   - [EditDialog](#84-editdialog)
   - [ConfirmDialog](#85-confirmdialog)
   - [NotFound](#86-notfound)
9. [Animation System](#9-animation-system)
10. [Complete Data Flow — Step by Step](#10-complete-data-flow--step-by-step)
11. [Environment Configuration](#11-environment-configuration)
12. [Mental Model — How Everything Connects](#12-mental-model--how-everything-connects)

---

## 1. Project Structure Overview

```
src/
├── app/
│   └── router.jsx          # Route definitions
├── axios/
│   └── axios.js            # Axios instance + request wrapper
├── features/
│   └── todos/
│       ├── ConfirmDialog.jsx
│       ├── EditDialog.jsx
│       ├── todoApi.js       # CRUD calls + Zod validation
│       ├── todoContext.jsx  # Global state (Context + useReducer)
│       ├── TodoForm.jsx
│       ├── TodoList.jsx
│       └── todoSchema.js    # Zod schema
├── pages/
│   ├── todos/
│   │   └── index.jsx        # Page wrapper
│   └── NotFound.jsx
├── App.css / index.css
└── main.jsx                 # React DOM entry point
```

The app follows a **feature-based** folder structure. Everything related to todos lives under `features/todos/`, keeping concerns colocated.

---

## 2. App Entry Point & Bootstrap

**`src/main.jsx`**

```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router";
import { router } from "./app/router";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
```

**What happens here:**

1. `createRoot` mounts the React tree into `<div id="root">` in `index.html`.
2. `StrictMode` enables extra development-time checks (double-renders effects, detects deprecated APIs).
3. `RouterProvider` takes the router config object and makes routing available to the entire app. There is **no** `<BrowserRouter>` wrapper — React Router v7's data router API handles everything internally.

---

## 3. Routing — React Router v7

**`src/app/router.jsx`**

```jsx
import React from "react";
import { createBrowserRouter } from "react-router";
import NotFound from "../pages/NotFound";

const LazyTodosPage = React.lazy(() => import("../pages/todos"));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LazyTodosPage />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
```

### Key Concepts

| Concept               | Explanation                                                                                                                 |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `createBrowserRouter` | Creates a router that uses the HTML5 History API (`pushState`). This is the v7 way — no `<BrowserRouter>` component needed. |
| `React.lazy()`        | Lazily imports `TodosPage`. The JS bundle for that page is only downloaded when a user first visits `/`.                    |
| `path: "*"`           | A catch-all wildcard. Any URL not matched above renders `<NotFound />`.                                                     |

### How `React.lazy` Works with the Router

`React.lazy` returns a component that React suspends on until the dynamic `import()` resolves. The router renders `<LazyTodosPage />` inside a `<Suspense>` boundary — either one you provide or React Router's built-in one. This enables **code splitting**: the todos bundle is separate from the main bundle.

---

## 4. HTTP Layer — Axios

**`src/axios/axios.js`**

```js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL || "http://localhost:3000/api",
  timeout: 10000,
});

export const request = async ({ method, url, data, signal }) => {
  try {
    const res = await api({ method, url, data, signal });
    return { ok: true, data: res.data, status: res.status };
  } catch (err) {
    if (axios.isCancel(err)) {
      return { ok: false, error: "Request cancelled", status: 499 };
    }
    const status = err.response?.status || 500;
    const error = err.response?.data?.error || err.message || "Unknown error";
    return { ok: false, error, status };
  }
};
```

### Design Decisions

**`axios.create()`** creates a reusable instance with a shared `baseURL` and `timeout`. All requests automatically prefix the base URL, so callers just write `/todos` instead of the full URL.

**The `request` wrapper** normalises every response into one of two shapes:

```js
// Success
{ ok: true,  data: {...}, status: 200 }

// Failure
{ ok: false, error: "message", status: 404 }
```

This pattern means every caller only needs to check `res.ok` — no try/catch scattered throughout the codebase.

**`signal`** is an `AbortSignal` from `AbortController`. Passing it to Axios lets the caller cancel the request mid-flight (used during component unmount).

**Status 499** is a non-standard code used here to represent "request cancelled by client" — the caller checks for this to avoid showing error messages when a component cleanly unmounts.

---

## 5. Data Validation — Zod

**`src/features/todos/todoSchema.js`**

```js
import { z } from "zod";

export const todoSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional().nullable(),
  completed: z.boolean().optional(),
});
```

### What Zod Does Here

Zod validates and transforms data **before** it is sent to the API. If validation fails, Zod throws a `ZodError` immediately — the network request never happens.

```js
// In todoApi.js:
const parsed = todoSchema.parse(data); // Full validation for create
const parsed = todoSchema.partial().parse(data); // Partial (all fields optional) for update
```

`.partial()` makes every field optional, which is perfect for PATCH/PUT operations where you might only send `{ completed: true }`.

**Why validate on the client?** It gives instant feedback before a round-trip to the server, and ensures you never accidentally send `null` for `title` or an empty string.

---

## 6. State Management — Context + useReducer

**`src/features/todos/todoContext.jsx`**

This file is the heart of the app's state layer.

### State Shape

```js
const initialState = {
  todos: [], // array of todo objects
  loading: false, // true while fetching
  error: null, // error string or null
};
```

### The Reducer

```js
function reducer(state, action) {
  switch (action.type) {
    case "LOADING":
      return { ...state, loading: true, error: null };
    case "SET":
      return { ...state, loading: false, todos: action.payload };
    case "ADD":
      return { ...state, todos: [action.payload, ...state.todos] };
    case "UPDATE":
      return {
        ...state,
        todos: state.todos.map((t) =>
          t.id === action.payload.id ? action.payload : t,
        ),
      };
    case "DELETE":
      return {
        ...state,
        todos: state.todos.filter((t) => t.id !== action.payload),
      };
    case "ERROR":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}
```

Each action type maps to a pure state transformation:

| Action    | Payload  | Effect                               |
| --------- | -------- | ------------------------------------ |
| `LOADING` | —        | Sets `loading: true`, clears error   |
| `SET`     | `Todo[]` | Replaces entire list (initial fetch) |
| `ADD`     | `Todo`   | Prepends new todo to list            |
| `UPDATE`  | `Todo`   | Replaces matching todo by id         |
| `DELETE`  | `id`     | Removes todo with matching id        |
| `ERROR`   | `string` | Sets error message, stops loading    |

### TodoProvider — Initial Fetch

```jsx
export const TodoProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const controller = new AbortController();

    const fetchTodos = async () => {
      dispatch({ type: "LOADING" });
      const res = await todoApi.getAll(controller.signal);

      if (res.ok) {
        dispatch({ type: "SET", payload: res.data });
      } else if (res.status !== 499) {
        dispatch({ type: "ERROR", payload: res.error });
      }
    };

    fetchTodos();
    return () => controller.abort(); // cleanup: cancel on unmount
  }, []);

  return (
    <TodoContext.Provider value={{ state, dispatch }}>
      {children}
    </TodoContext.Provider>
  );
};
```

**Lifecycle of the initial fetch:**

1. `TodoProvider` mounts → `useEffect` fires.
2. `AbortController` is created; its signal is passed to the API call.
3. `dispatch({ type: "LOADING" })` → UI shows spinner.
4. `todoApi.getAll(signal)` makes a GET to `/todos`.
5. On success → `dispatch({ type: "SET", payload: todos })` → list renders.
6. On error (non-cancel) → `dispatch({ type: "ERROR", payload: msg })` → error message renders.
7. If the component unmounts before the request completes → `controller.abort()` cancels the request. The `status !== 499` guard prevents dispatching an error for this clean cancellation.

### `useTodos` Hook

```js
export const useTodos = () => useContext(TodoContext);
```

A tiny convenience hook. Any component can call `const { state, dispatch } = useTodos()` to read state or fire actions.

---

## 7. API Module — todoApi

**`src/features/todos/todoApi.js`**

```js
import { request } from "../../axios/axios";
import { todoSchema } from "./todoSchema";

export const todoApi = {
  getAll: (signal) => request({ method: "get", url: "/todos", signal }),
  create: (data) => {
    const parsed = todoSchema.parse(data);
    return request({ method: "post", url: "/todos", data: parsed });
  },
  update: (id, data) => {
    const parsed = todoSchema.partial().parse(data);
    return request({ method: "put", url: `/todos/${id}`, data: parsed });
  },
  remove: (id) => request({ method: "delete", url: `/todos/${id}` }),
};
```

This module is the **only** place that knows about API endpoints. It combines Zod validation with the Axios wrapper, so every caller gets clean, validated data sent to a typed endpoint.

---

## 8. UI Components

### 8.1 TodosPage

**`src/pages/todos/index.jsx`**

```jsx
export default function TodosPage() {
  return (
    <TodoProvider>
      <div className="max-w-xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Todos</h1>
        <TodoForm />
        <TodoList />
      </div>
    </TodoProvider>
  );
}
```

This is the page's root component. It wraps everything in `<TodoProvider>`, which:

- Creates the shared state.
- Triggers the initial fetch.
- Makes `state` and `dispatch` available to all descendants via context.

`max-w-xl mx-auto` centres the content at a maximum width of 36rem, keeping the UI readable on wide screens.

---

### 8.2 TodoForm

**`src/features/todos/TodoForm.jsx`**

```jsx
export default function TodoForm() {
  const { dispatch } = useTodos();
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return; // guard: no empty todos

    setIsSubmitting(true);
    const res = await todoApi.create({ title });
    setIsSubmitting(false);

    if (res.ok) {
      dispatch({ type: "ADD", payload: res.data });
      setTitle(""); // reset field
    } else {
      alert(res.error);
    }
  };
  // ...
}
```

**Flow:**

1. User types in input → controlled by `title` state.
2. User submits form → `handleSubmit` fires.
3. Empty strings are rejected before any network call.
4. `isSubmitting = true` → button shows "Adding..." and pulses.
5. `todoApi.create({ title })` → Zod validates → POST to `/todos`.
6. On success → `ADD` dispatch prepends the new todo, input clears.
7. On failure → `alert` shows the error.

**Tailwind highlights:**

- `focus:ring-2 focus:ring-blue-500` — accessible focus ring on the input.
- `animate-pulse opacity-75` — applied to the button while submitting, giving visual feedback.
- `transition-all duration-200` — smooth shadow transition on the input when focused.

---

### 8.3 TodoList

**`src/features/todos/TodoList.jsx`**

The list renders all todos from context and manages the edit/delete dialogs.

```jsx
const { state, dispatch } = useTodos();
const [deleteTarget, setDeleteTarget] = useState(null);
const [editTarget, setEditTarget] = useState(null);
```

**Three possible render states:**

```jsx
if (state.loading) return <p>Loading...</p>;
if (state.error) return <p>Error: {state.error}</p>;
if (!state.todos.length) return <p>No todos yet...</p>;
```

**Toggle completion:**

```js
const toggle = async (todo) => {
  const res = await todoApi.update(todo.id, { completed: !todo.completed });
  if (res.ok) dispatch({ type: "UPDATE", payload: res.data });
};
```

**Optimistic-style update** — the server is the source of truth. The `res.data` returned from the server replaces the local todo object to ensure consistency.

**Delete flow:**

1. User clicks trash icon → `setDeleteTarget(todo)` → `ConfirmDialog` opens.
2. User confirms → `todoApi.remove(id)` → `DELETE` dispatch removes from state.
3. User cancels → `setDeleteTarget(null)` → dialog closes.

**Edit flow:**

1. User clicks edit icon → `setEditTarget(todo)` → `EditDialog` opens pre-filled.
2. User saves → `todoApi.update(id, { title: newTitle })` → `UPDATE` dispatch replaces todo.
3. User cancels → `setEditTarget(null)` → dialog closes.

**Staggered animation:**

```jsx
style={{ animationDelay: `${index * 50}ms` }}
```

Each item's fade-in is delayed by 50ms × its index, creating a cascade effect when the list first loads.

**Hover interaction via Tailwind group:**

```jsx
<li className="... group ...">
  <div className="... opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 ...">
    {/* action buttons */}
  </div>
</li>
```

The `group` class on `<li>` lets the action buttons (children) respond to the parent's hover state. Buttons are invisible (`opacity-0`) and shifted right (`translate-x-2`) by default, then slide in and become visible on hover.

---

### 8.4 EditDialog

**`src/features/todos/EditDialog.jsx`**

A modal dialog for editing a todo's title.

**Three `useEffect` hooks:**

```js
// 1. Sync the input value when the todo prop changes
useEffect(() => {
  if (todo) setTitle(todo.title);
}, [todo]);

// 2. Auto-focus the input when the dialog opens
useEffect(() => {
  if (isOpen) setTimeout(() => inputRef.current?.focus(), 50);
}, [isOpen]);

// 3. Close on Escape key
useEffect(() => {
  if (!isOpen) return;
  const handler = (e) => {
    if (e.key === "Escape") onCancel();
  };
  window.addEventListener("keydown", handler);
  return () => window.removeEventListener("keydown", handler); // cleanup
}, [isOpen, onCancel]);
```

The `setTimeout(..., 50)` delay for focus is necessary because the DOM element needs one render cycle after `isOpen` becomes `true` before it can receive focus.

**Backdrop click to close:**

```jsx
<div onClick={onCancel}>          {/* outer backdrop */}
  <div onClick={(e) => e.stopPropagation()}>  {/* dialog box */}
```

Clicking the dark overlay calls `onCancel`. `stopPropagation()` on the inner div prevents the click from bubbling up to the overlay.

**Dialog pop animation:**

```css
@keyframes dialogPop {
  from {
    opacity: 0;
    transform: scale(0.92) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
```

Applied inline via `style={{ animation: "dialogPop 0.18s cubic-bezier(0.34,1.56,0.64,1)" }}`. The `cubic-bezier(0.34, 1.56, ...)` is a spring-like easing that slightly overshoots scale=1, giving a bouncy, physical feel.

---

### 8.5 ConfirmDialog

**`src/features/todos/ConfirmDialog.jsx`**

Structurally identical to `EditDialog` but used for delete confirmation. Accepts `title`, `message`, `onConfirm`, `onCancel`, and an optional `isLoading` prop for async loading states.

The same `dialogPop` animation and Escape-key handler are used. The red colour scheme (`bg-red-100`, `bg-red-500`) visually distinguishes it as a destructive action.

---

### 8.6 NotFound

**`src/pages/NotFound.jsx`**

A simple inline-styled 404 page. It does not use Tailwind because it is intentionally kept dependency-free and minimal — it renders even if Tailwind fails to load.

---

## 9. Animation System

The app uses two animation techniques: **Tailwind CSS utilities** and **custom keyframes injected via `<style>` tags**.

### Tailwind Transition Utilities

These are standard Tailwind classes that use CSS `transition`:

| Class                                     | Effect                                                 |
| ----------------------------------------- | ------------------------------------------------------ |
| `transition-all duration-200`             | Smooth 200ms transition on all properties              |
| `transition-all duration-300`             | Smooth 300ms transition (used for list items)          |
| `hover:shadow-md`                         | Shadow deepens on hover                                |
| `hover:scale-[1.01]`                      | Subtle scale-up on list item hover                     |
| `hover:scale-110`                         | Button icon scales up on hover                         |
| `active:scale-95`                         | Button icon scales down on click                       |
| `opacity-0 group-hover:opacity-100`       | Action buttons fade in on row hover                    |
| `translate-x-2 group-hover:translate-x-0` | Action buttons slide in from the right                 |
| `animate-pulse`                           | Tailwind's built-in pulse loop (used on submit button) |

### Custom Keyframe Animations

**Fade-in for list items** (`TodoList.jsx` and `TodoForm.jsx`):

```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
  opacity: 0; /* prevents flash before animation starts */
}
```

`forwards` fill mode means the element stays at the final state (`opacity: 1`) after the animation completes. Without it, the item would snap back to invisible.

**Dialog entrance animation** (`EditDialog.jsx` and `ConfirmDialog.jsx`):

```css
@keyframes dialogPop {
  from {
    opacity: 0;
    transform: scale(0.92) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
```

The dialog pops in from slightly below and slightly smaller. The spring easing curve gives it a natural, physical feel.

### Why Inline `<style>` Tags?

Custom keyframes cannot be defined with Tailwind utility classes alone. Injecting them via `<style>` inside the component keeps them colocated with the component that uses them, rather than requiring changes to `index.css` or `tailwind.config.js`.

---

## 10. Complete Data Flow — Step by Step

### Initial Page Load

```
main.jsx
  └── RouterProvider (router)
        └── LazyTodosPage (lazy loaded)
              └── TodoProvider
                    ├── useEffect → fetchTodos()
                    │     ├── dispatch("LOADING") → state.loading = true
                    │     ├── todoApi.getAll(signal)
                    │     │     └── request({ GET /todos })
                    │     │           └── axios instance → server
                    │     └── dispatch("SET", todos) → state.todos = [...]
                    ├── TodoForm (reads dispatch)
                    └── TodoList (reads state.todos)
```

### Creating a Todo

```
User types "Buy milk" → clicks Add
  └── TodoForm.handleSubmit()
        ├── todoApi.create({ title: "Buy milk" })
        │     ├── todoSchema.parse({ title: "Buy milk" }) ✓
        │     └── request({ POST /todos, data: { title: "Buy milk" } })
        │           └── server returns { id: 5, title: "Buy milk", completed: false }
        └── dispatch("ADD", { id: 5, ... })
              └── state.todos = [{ id: 5, ... }, ...existingTodos]
                    └── TodoList re-renders with new item at top
```

### Toggling Completion

```
User clicks checkbox on todo #3
  └── TodoList.toggle({ id: 3, completed: false })
        ├── todoApi.update(3, { completed: true })
        │     ├── todoSchema.partial().parse({ completed: true }) ✓
        │     └── request({ PUT /todos/3, data: { completed: true } })
        │           └── server returns updated todo { id: 3, completed: true }
        └── dispatch("UPDATE", { id: 3, completed: true })
              └── state.todos = todos.map(t => t.id === 3 ? updatedTodo : t)
```

### Editing a Todo

```
User clicks edit icon on todo #3
  └── setEditTarget({ id: 3, title: "Old Title" })
        └── EditDialog renders (isOpen=true, pre-filled with "Old Title")

User changes title to "New Title" → clicks Save Changes
  └── TodoList.handleEditConfirm("New Title")
        ├── todoApi.update(3, { title: "New Title" })
        │     └── request({ PUT /todos/3, data: { title: "New Title" } })
        └── dispatch("UPDATE", updatedTodo)
              └── setEditTarget(null) → dialog closes
```

### Deleting a Todo

```
User clicks delete icon on todo #3
  └── setDeleteTarget({ id: 3, title: "Old Title" })
        └── ConfirmDialog renders (isOpen=true)

User clicks "Yes, Delete"
  └── TodoList.handleDeleteConfirm()
        ├── todoApi.remove(3)
        │     └── request({ DELETE /todos/3 })
        └── dispatch("DELETE", 3)
              └── state.todos = todos.filter(t => t.id !== 3)
                    └── setDeleteTarget(null) → dialog closes
```

---

## 11. Environment Configuration

**`.env`**

```
VITE_SERVER_URL=http://localhost:3000/api
```

Vite exposes environment variables prefixed with `VITE_` to client-side code via `import.meta.env`. The Axios instance reads this at startup:

```js
baseURL: import.meta.env.VITE_SERVER_URL || "http://localhost:3000/api";
```

The fallback ensures the app still works if `.env` is missing.

**For production**, create a `.env.production` file:

```
VITE_SERVER_URL=https://your-api.example.com/api
```

Vite automatically uses the correct file based on the build mode.

---

## 12. Mental Model — How Everything Connects

```
┌─────────────────────────────────────────────┐
│                  main.jsx                   │
│         RouterProvider ──► router.jsx        │
└──────────────────┬──────────────────────────┘
                   │  /  route
                   ▼
┌─────────────────────────────────────────────┐
│               TodosPage                     │
│  ┌──────────────────────────────────────┐   │
│  │           TodoProvider               │   │
│  │  state: { todos, loading, error }    │   │
│  │  dispatch: (action) => void          │   │
│  │                                      │   │
│  │  ┌────────────┐  ┌────────────────┐  │   │
│  │  │  TodoForm  │  │   TodoList     │  │   │
│  │  │            │  │                │  │   │
│  │  │ dispatch   │  │  state.todos   │  │   │
│  │  │ "ADD"      │  │  dispatch      │  │   │
│  │  └─────┬──────┘  │  "UPDATE"      │  │   │
│  │        │         │  "DELETE"      │  │   │
│  │        │         └───────┬────────┘  │   │
│  └────────┼─────────────────┼───────────┘   │
└───────────┼─────────────────┼───────────────┘
            │                 │
            ▼                 ▼
┌─────────────────────────────────────────────┐
│                 todoApi.js                  │
│  create() / update() / remove() / getAll() │
│           ▲ Zod validates input             │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│               axios.js                      │
│   axios instance (baseURL, timeout)         │
│   request() → normalises to { ok, data }    │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
           REST API Server
        http://localhost:3000/api
```

**Key principles this app demonstrates:**

- **Single source of truth** — all todo state lives in `TodoContext`. Components never keep their own copy of the list.
- **Unidirectional data flow** — state flows down through context; changes flow up through `dispatch`.
- **Separation of concerns** — networking (`axios.js`), validation (`todoSchema.js`), API calls (`todoApi.js`), state (`todoContext.jsx`), and UI (components) are each in their own file.
- **Normalised API responses** — the `request()` wrapper means no component ever writes a try/catch; they just check `res.ok`.
- **Cleanup on unmount** — `AbortController` cancels in-flight requests when `TodoProvider` unmounts, preventing state updates on unmounted components.

\*\* This Project only for education purposes
