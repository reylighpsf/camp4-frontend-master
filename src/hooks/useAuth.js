import { useContext } from "react";
import { AuthContext } from "@/hooks/authContextValue";

export const useAuth = () => useContext(AuthContext);
