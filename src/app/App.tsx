import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Home, Package, User } from "lucide-react";
import { ThemeContext } from "./components/ThemeContext";
import { HomePage } from "./components/HomePage";
import { InventoryPage } from "./components/InventoryPage";
import { ProfilePage } from "./components/ProfilePage";
import type { InventoryItem } from "./components/HomePage";
import { AppProvider, useApp } from "./AppContext";

type Tab = "home" | "inventory" | "profile";

const TABS = [
  { key: "home" as Tab, label: "Главная", Icon: Home },
  { key: "inventory" as Tab, label: "Инвентарь", Icon: Package },
  { key: "profile" as Tab, label: "Профиль", Icon: User },
];

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [isDark, setIsDark] = useState(true);
  const { tgUser, users, addKibikToUser } = useApp();

  const currentUserId = tgUser ? tgUser.id.toString() : "12345";
  const currentUser = users.find((u) => u.id === currentUserId);
  const inventory = currentUser?.inventory || [];

  const addItem = (item: InventoryItem) => {
    addKibikToUser(currentUserId, item);
  };

  const bg = isDark ? "#080810" : "#ededf5";
  const navBg = isDark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.72)";
  const navBorder = isDark ? "rgba(255,255,255,0.13)" : "rgba(255,255,255,0.85)";
  const navShadow = isDark
    ? "0 -2px 30px rgba(255,255,255,0.04), 0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)"
    : "0 -2px 20px rgba(0,0,0,0.04), 0 8px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.95)";
  
  const myName = tgUser ? `${tgUser.first_name} ${tgUser.last_name || ""}`.trim() : "Алекс";

  return (
    <ThemeContext.Provider value={{ isDark }}>
      <div
        className="size-full relative overflow-hidden flex flex-col"
        style={{ background: bg, minHeight: "100dvh", maxWidth: 430, margin: "0 auto" }}
      >
        {/* White/dark light glow from bottom */}netlify
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background: isDark
              ? "radial-gradient(ellipse 90% 45% at 50% 108%, rgba(255,255,255,0.09) 0%, transparent 65%)"
              : "radial-gradient(ellipse 90% 45% at 50% 108%, rgba(0,0,0,0.06) 0%, transparent 65%)",
          }}
        />

        {/* Subtle ambient at top */}
        <div
          className="pointer-events-none absolute top-0 left-0 right-0 h-48 z-0"
          style={{
            background: isDark
              ? "radial-gradient(ellipse 70% 100% at 50% 0%, rgba(255,255,255,0.025) 0%, transparent 100%)"
              : "radial-gradient(ellipse 70% 100% at 50% 0%, rgba(0,0,0,0.015) 0%, transparent 100%)",
          }}
        />

        {/* Theme toggle */}
        <div className="absolute top-4 right-4 z-20">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsDark((d) => !d)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-base"
            style={{
              background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)",
              border: `1px solid ${isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.09)"}`,
              backdropFilter: "blur(16px)",
            }}
          >
            {isDark ? "☀️" : "🌙"}
          </motion.button>
        </div>

        {/* Scrollable page content */}
        <div className="flex-1 overflow-y-auto relative z-10" style={{ paddingBottom: 88 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {activeTab === "home"      && <HomePage onAddItem={addItem} inventory={inventory} />}
              {activeTab === "inventory" && <InventoryPage inventory={inventory} />}
              {activeTab === "profile"   && <ProfilePage inventory={inventory} myName={myName} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom nav — liquid glass */}
        <div
          className="fixed bottom-0 left-1/2 z-30 px-3 pb-4 pt-2"
          style={{ transform: "translateX(-50%)", width: "100%", maxWidth: 430 }}
        >
          <nav
            className="flex items-center justify-around px-2 py-2 rounded-2xl"
            style={{
              background: navBg,
              border: `1px solid ${navBorder}`,
              backdropFilter: "blur(32px) saturate(200%)",
              boxShadow: navShadow,
            }}
          >
            {TABS.map(({ key, label, Icon }) => {
              const active = activeTab === key;
              const activeIconColor = isDark ? "#ffffff" : "#0d0d0d";
              const inactiveIconColor = isDark ? "rgba(255,255,255,0.32)" : "rgba(0,0,0,0.28)";
              const activePillBg = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";
              const activePillBorder = isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.12)";

              return (
                <motion.button
                  key={key}
                  whileTap={{ scale: 0.88 }}
                  onClick={() => setActiveTab(key)}
                  className="flex flex-col items-center gap-1 px-5 py-1.5 rounded-xl relative"
                  style={{ minWidth: 72 }}
                >
                  {active && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-xl"
                      style={{ background: activePillBg, border: `1px solid ${activePillBorder}` }}
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    />
                  )}

                  <div className="relative z-10">
                    <Icon
                      size={22}
                      style={{ color: active ? activeIconColor : inactiveIconColor, transition: "color 0.2s" }}
                    />
                    {/* Inventory badge */}
                    {key === "inventory" && inventory.length > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full flex items-center justify-center"
                        style={{
                          background: isDark ? "rgba(255,255,255,0.9)" : "rgba(15,15,15,0.85)",
                          color: isDark ? "#000" : "#fff",
                          fontSize: 9,
                        }}
                      >
                        {inventory.length > 9 ? "9+" : inventory.length}
                      </motion.span>
                    )}
                  </div>

                  <span
                    className="relative z-10 text-[10px]"
                    style={{ color: active ? activeIconColor : inactiveIconColor, transition: "color 0.2s" }}
                  >
                    {label}
                  </span>
                </motion.button>
              );
            })}
          </nav>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
