import { authApi } from "../../../../components/auth/hooks/authApi";

export const getGoogleClientId = async () => {
  const envClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (envClientId) return envClientId;

  const response = await authApi.googleConfig();
  return response.data?.data?.clientId || response.data?.clientId || "";
};
