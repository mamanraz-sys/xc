"use client";
/* הוק מותאם לאנימציית הופעה בגלילה */
import { useEffect, useRef } from "react";

export function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.15 }
    );

    const el = ref.current;
    if (el) {
      /* מוסיף מעקב לכל הילדים עם קלאס fade-in-up */
      const children = el.querySelectorAll(".fade-in-up");
      children.forEach((child) => observer.observe(child));
      if (el.classList.contains("fade-in-up")) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return ref;
}
