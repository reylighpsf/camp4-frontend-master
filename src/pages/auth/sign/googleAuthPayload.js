export const decodeGoogleCredential = (credential) => {
  try {
    const payload = credential.split(".")[1];
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(window.atob(normalizedPayload));
  } catch {
    return {};
  }
};

const createGooglePassword = () => {
  const randomValues = new Uint32Array(4);
  window.crypto.getRandomValues(randomValues);
  return `Google-${Array.from(randomValues).map((value) => value.toString(36)).join("")}`;
};

const createFallbackPhoneNumber = (googleSubject = "") => {
  const digits = String(googleSubject).replace(/\D/g, "");
  const suffix = (digits || String(Date.now())).slice(-8).padStart(8, "0");
  return `+6289${suffix}`;
};

export const buildGoogleRegisterPayload = (credential) => {
  const payload = decodeGoogleCredential(credential);
  const name = payload.name || payload.given_name || payload.email?.split("@")[0] || "Google User";

  return {
    googleToken: credential,
    password: createGooglePassword(),
    fullName: name,
    phoneNumber: createFallbackPhoneNumber(payload.sub),
    birthDate: "2000-01-01",
  };
};
