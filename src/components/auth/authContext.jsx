import { useEffect, useState } from "react";
import { authApi } from "./authApi";
import { AuthContext } from "./authContextValue";

const SKIP_ME_PATHS = [
  "/sign-in",
  "/sign-up",
  "/verify-email",
  "/verify-email/result",
];

const shouldSkipFetchMe = (pathname) => {
  return SKIP_ME_PATHS.includes(pathname) || pathname.startsWith("/verify-email/");
};

const shouldSkipInitialFetchMe = () => {
  return shouldSkipFetchMe(window.location.pathname);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!shouldSkipInitialFetchMe());

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
    const pathname = window.location.pathname;

    if (shouldSkipFetchMe(pathname)) {
      return;
    }

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
