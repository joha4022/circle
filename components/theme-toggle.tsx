"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = localStorage.getItem("circle-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme: Theme = stored === "dark" || (!stored && prefersDark) ? "dark" : "light";

    document.documentElement.setAttribute("data-theme", initialTheme);
    setTimeout(() => setTheme(initialTheme), 0);
    if (!stored) {
      localStorage.setItem("circle-theme", initialTheme);
    }
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("circle-theme", next);
    setTheme(next);
  }

  return (
    <button className="ghost" type="button" onClick={toggle} aria-label="Toggle theme">
      {theme === "dark" ? "Light mode" : "Dark mode"}
    </button>
  );
}
