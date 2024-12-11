import { useEffect, useState } from "react";

export const useHydrated = () => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true); // Set to true after hydration
  }, []);

  return hydrated;
};

export function getCookie(request, name) {
  if (typeof document !== "undefined") {
    // Client-side
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
  }

  // Server-side
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) return null;

  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((cookie) => cookie.trim().split("="))
  );
  return cookies[name] || null;
}
