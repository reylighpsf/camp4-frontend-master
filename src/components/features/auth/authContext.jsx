import { useEffect, useState } from "react";
import { authApi } from "./authApi";
import { AuthContext } from "./authContextValue";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    try {
      const res = await authApi.me();
      const currentUser = res.data?.data || null;
      setUser(currentUser);
      return currentUser;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchMe();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, []);

  const signin = async (data) => {
    await authApi.signin(data);
    return await fetchMe();
  };

  const signup = async (data) => {
    await authApi.signup(data);
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signin, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
