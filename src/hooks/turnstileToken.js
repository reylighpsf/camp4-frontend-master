const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || "0x4AAAAAADjBfMPxrBM54BnW";
const TURNSTILE_SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js";

const loadTurnstileScript = () =>
  new Promise((resolve, reject) => {
    if (window.turnstile) {
      resolve(window.turnstile);
      return;
    }

    const existingScript = document.querySelector("script[data-turnstile-script='true']");
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.turnstile), { once: true });
      existingScript.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = TURNSTILE_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.dataset.turnstileScript = "true";
    script.onload = () => resolve(window.turnstile);
    script.onerror = reject;
    document.head.appendChild(script);
  });

export const requestTurnstileToken = async () => {
  const turnstile = await loadTurnstileScript();

  return new Promise((resolve, reject) => {
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.left = "-9999px";
    container.style.top = "0";
    container.style.width = "1px";
    container.style.height = "1px";
    container.style.overflow = "hidden";
    document.body.appendChild(container);

    let widgetId = null;
    const cleanup = () => {
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
      container.remove();
    };

    widgetId = turnstile.render(container, {
      sitekey: TURNSTILE_SITE_KEY,
      appearance: "interaction-only",
      callback: (token) => {
        cleanup();
        resolve(token || "");
      },
      "error-callback": () => {
        cleanup();
        reject(new Error("Verifikasi captcha gagal."));
      },
      "expired-callback": () => {
        cleanup();
        reject(new Error("Verifikasi captcha kedaluwarsa."));
      },
    });
  });
};
