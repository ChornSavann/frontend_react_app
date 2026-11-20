// src/utils/darkMode.js
import { useState, useEffect } from "react";
import "../styles/darkMode.css";

export const applyTheme = (isDark) => {
  const root = document.documentElement;
  if (isDark) {
    root.classList.add("dark");
    document.body.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else {
    root.classList.remove("dark");
    document.body.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }
  window.dispatchEvent(new CustomEvent("app-theme-change", { detail: { dark: isDark } }));
};

export const useDarkMode = () => {
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    applyTheme(dark);
  }, [dark]);

  useEffect(() => {
    const syncTheme = (e) => {
      const next = e.detail?.dark ?? localStorage.getItem("theme") === "dark";
      setDark(next);
    };
    window.addEventListener("app-theme-change", syncTheme);
    return () => window.removeEventListener("app-theme-change", syncTheme);
  }, []);

  const toggleDark = () => setDark((prev) => !prev);

  return { dark, setDark, toggleDark };
};