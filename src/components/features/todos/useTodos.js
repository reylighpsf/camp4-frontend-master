import { useContext } from "react";
import { TodoContext } from "./todoContextValue";

export const useTodos = () => useContext(TodoContext);
