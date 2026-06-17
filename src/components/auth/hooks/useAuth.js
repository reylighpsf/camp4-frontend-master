import { useContext } from "react";
import { AuthContext } from "@/components/auth/hooks/authContextValue";

export const useAuth = () => useContext(AuthContext);
