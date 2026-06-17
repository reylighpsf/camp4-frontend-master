import { useCallback, useEffect, useRef, useState } from "react";

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || "0x4AAAAAADjBfMPxrBM54BnW";
const TURNSTILE_SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js";

export default function useTurnstile() {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const cancelledRef = useRef(false);
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  const renderWidget = useCallback(() => {
    if (cancelledRef.current || !containerRef.current || !window.turnstile || widgetIdRef.current) return;

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      appearance: "interaction-only",
      callback: (nextToken) => {
        setToken(nextToken || "");
        setError("");
      },
      "error-callback": () => {
        setToken("");
        setError("Verifikasi Turnstile gagal. Coba ulangi captcha.");
      },
      "expired-callback": () => {
        setToken("");
        setError("Verifikasi Turnstile kedaluwarsa. Silakan verifikasi ulang.");
      },
    });
  }, []);

  const setContainerRef = useCallback((node) => {
    if (!node && widgetIdRef.current && window.turnstile) {
      window.turnstile.remove(widgetIdRef.current);
      widgetIdRef.current = null;
      setToken("");
    }

    containerRef.current = node;
    if (node) renderWidget();
  }, [renderWidget]);

  useEffect(() => {
    cancelledRef.current = false;
    if (window.turnstile) {
      renderWidget();
    } else {
      const existingScript = document.querySelector("script[data-turnstile-script='true']");
      if (existingScript) {
        existingScript.addEventListener("load", renderWidget, { once: true });
      } else {
        const script = document.createElement("script");
        script.src = TURNSTILE_SCRIPT_URL;
        script.async = true;
        script.defer = true;
        script.dataset.turnstileScript = "true";
        script.onload = renderWidget;
        script.onerror = () => {
          if (!cancelledRef.current) setError("Gagal memuat Turnstile.");
        };
        document.head.appendChild(script);
      }
    }

    return () => {
      cancelledRef.current = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, []);

  const reset = useCallback(() => {
    setToken("");
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
  }, []);

  return {
    containerRef: setContainerRef,
    error,
    reset,
    token,
  };
}
