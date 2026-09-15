"use client";

import { useEffect, useState } from "react";

/**
 * راوتر خفيف عبر الـ hash — يمنح زر الرجوع في المتصفح عملًا سليمًا
 * دون أي مكتبة إضافية، ومناسب لطبيعة SPA دون اتصال.
 */
export function useHashRoute(): string {
  const [route, setRoute] = useState("");

  useEffect(() => {
    const read = () => {
      const raw = window.location.hash.replace(/^#/, "");
      setRoute(raw === "" ? "/" : raw);
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  return route;
}

/** تنقل برمجي */
export function navigate(to: string) {
  window.location.hash = to;
  window.scrollTo({ top: 0 });
}
