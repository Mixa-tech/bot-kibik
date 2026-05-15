import { createContext, useContext } from "react";

export const ThemeContext = createContext<{ isDark: boolean }>({ isDark: true });
export const useTheme = () => useContext(ThemeContext);

export function glass(isDark: boolean, opacity = 0.07) {
  return {
    background: isDark ? `rgba(255,255,255,${opacity})` : `rgba(0,0,0,${opacity * 0.5})`,
    border: `1px solid ${isDark ? `rgba(255,255,255,${opacity * 2})` : `rgba(0,0,0,${opacity})`}`,
    backdropFilter: "blur(20px) saturate(180%)",
  };
}

export function tc(isDark: boolean) {
  return {
    primary: isDark ? "#ffffff" : "#111111",
    secondary: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)",
    muted: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)",
    subtle: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.07)",
    subtleBorder: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
  };
}
