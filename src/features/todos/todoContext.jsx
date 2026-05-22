import { createContext, useReducer, useContext, useEffect } from "react";
import { todoApi } from "./todoApi";

const TodoContext = createContext();

const initialState = {
  todos: [],
  loading: false,
  error: null,
};

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
        // ignore cancellations
        dispatch({ type: "ERROR", payload: res.error });
      }
    };

    fetchTodos();

    return () => controller.abort();
  }, []);

  return (
    <TodoContext.Provider value={{ state, dispatch }}>
      {children}
    </TodoContext.Provider>
  );
};

export const useTodos = () => useContext(TodoContext);
