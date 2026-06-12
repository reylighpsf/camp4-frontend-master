import { useEffect, useState } from "react";
import { authApi } from "./hooks/authApi";
import { AuthContext } from "./hooks/authContextValue";
import { requestTurnstileToken } from "./hooks/turnstileToken";

const SKIP_ME_PATHS = [
  "/choose-plan",
  "/sign-in",
  "/sign-up",
  "/verify-email",
  "/verify-email/result",
  "/payment",
  "/payment/success",
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

  const signin = async (data, turnstileToken = "") => {
    await authApi.signin(data, turnstileToken);
    return await fetchMe();
  };

  const signinGoogle = async (googleToken, turnstileToken = "") => {
    await authApi.loginGoogle({ googleToken }, turnstileToken);
    return await fetchMe();
  };

  const signupGoogle = async (data, turnstileToken = "", options = {}) => {
    await authApi.registerGoogle(data, turnstileToken);
    if (options.skipFetchMe) return null;
    return await fetchMe();
  };

  const signup = async (data, turnstileToken = "") => {
    await authApi.signup(data, turnstileToken);
  };

  const logout = async () => {
    try {
      const turnstileToken = await requestTurnstileToken();
      await authApi.logout(turnstileToken);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signin, signinGoogle, signup, signupGoogle, logout, fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
};
