import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Home, Package, User, Zap, ShieldAlert, Store, X } from "lucide-react";
import { ThemeContext } from "./components/ThemeContext";
import { HomePage } from "./components/HomePage";
import { InventoryPage } from "./components/InventoryPage";
import { ProfilePage } from "./components/ProfilePage";
import { ClickerPage } from "./components/ClickerPage";
import { MarketPage } from "./components/MarketPage";
import { AdminDashboard } from "./components/AdminDashboard";
import type { InventoryItem } from "./components/HomePage";
import { AppProvider, useApp } from "./AppContext";

type Tab = "home" | "inventory" | "market" | "clicker" | "profile";

const TABS = [
  { key: "home" as Tab, label: "Главная", Icon: Home },
  { key: "inventory" as Tab, label: "Инвентарь", Icon: Package },
  { key: "market" as Tab, label: "Биржа", Icon: Store },
  { key: "clicker" as Tab, label: "Кликер", Icon: Zap },
  { key: "profile" as Tab, label: "Профиль", Icon: User },
];

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [isDark, setIsDark] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [loginUser, setLoginUser] = useState("");
  const [loginPin, setLoginPin] = useState("");
  const [loginStep, setLoginStep] = useState<1 | 2>(1);
  const { tgUser, users, addKibikToUser, appError, clearLoginCode, globalKibiks, requestLoginCode, verifyLoginCode } = useApp();

  const currentUserId = tgUser ? tgUser.id.toString() : "12345";
  const currentUser = users.find((u) => u.id === currentUserId);
  const inventory = currentUser?.inventory || [];

  // СЕКРЕТНАЯ ССЫЛКА ДЛЯ ПЛАНШЕТА
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("admin") === "1") {
    return <AdminDashboard />;
  }

  const addItem = (item: InventoryItem) => {
    addKibikToUser(currentUserId, item);
  };

  // Эффект для мгновенного выкидывания с отключенной вкладки
  useEffect(() => {
    if (globalKibiks[`TAB_DISABLED_${activeTab.toUpperCase()}`]) {
      const firstAvailable = TABS.find(t => !globalKibiks[`TAB_DISABLED_${t.key.toUpperCase()}`]);
      if (firstAvailable && firstAvailable.key !== activeTab) {
        setActiveTab(firstAvailable.key);
      }
    }
  }, [activeTab, globalKibiks]);

  const bg = isDark ? "#080810" : "#ededf5";
  const navBg = isDark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.72)";
  const navBorder = isDark ? "rgba(255,255,255,0.13)" : "rgba(255,255,255,0.85)";
  const navShadow = isDark
    ? "0 -2px 30px rgba(255,255,255,0.04), 0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)"
    : "0 -2px 20px rgba(0,0,0,0.04), 0 8px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.95)";
  
  const myName = tgUser ? `${tgUser.first_name} ${tgUser.last_name || ""}`.trim() : "Алекс";

  // Проверка на бан
  const isBanned = currentUser?.bannedUntil && new Date(currentUser.bannedUntil) > new Date();
  if (isBanned) {
    return (
      <div className="size-full fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 text-center" style={{ background: "#0a0a0a", color: "#ef4444" }}>
        <ShieldAlert size={80} className="mb-6 text-red-600 animate-pulse" />
        <h1 className="text-4xl font-black mb-3 tracking-widest">ВЫ ЗАБАНЕНЫ</h1>
        <p className="text-sm text-red-400/80 mb-8 font-medium">Доступ к системе строго ограничен.</p>
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 w-full text-left max-w-sm">
          <p className="text-sm mb-3"><strong className="text-white">Причина:</strong> {currentUser.banReason || "Нарушение правил"}</p>
          <p className="text-sm"><strong className="text-white">Окончание:</strong> {new Date(currentUser.bannedUntil!).toLocaleString("ru-RU", {day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"})}</p>
        </div>
      </div>
    );
  }

  // Окно входа для браузера (чтобы не сидеть под Web Guest)
  if (currentUser?.id === "12345" && !isGuestMode && !urlParams.get("admin")) {
    return (
      <ThemeContext.Provider value={{ isDark }}>
        <div className="size-full fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 text-center font-sans" style={{ background: bg, color: isDark ? "#fff" : "#000" }}>
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
             <User size={32} className="text-blue-500" />
          </div>
          <h1 className="text-2xl font-black mb-2 tracking-wide">ВХОД В ИГРУ</h1>
          
          {loginStep === 1 ? (
            <div className="w-full max-w-sm">
              <p className="text-sm opacity-60 mb-6">Игра открыта в браузере.<br/>Введите ваш @username для входа</p>
              <input type="text" value={loginUser} onChange={e => setLoginUser(e.target.value)} placeholder="Ваш @username" className="w-full border rounded-xl px-4 py-3 mb-4 outline-none focus:border-blue-500 transition-colors text-center" style={{ background: isDark ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.5)", borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", color: isDark ? "#fff" : "#000" }} />
              <button onClick={async () => {
                const ok = await requestLoginCode(loginUser, false);
                if (ok) setLoginStep(2);
              }} className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3.5 font-bold tracking-wider transition-colors mb-3">
                ПОЛУЧИТЬ КОД В БОТЕ
              </button>
              <button onClick={() => setIsGuestMode(true)} className="text-sm opacity-50 hover:opacity-100 transition-opacity">Продолжить как гость</button>
            </div>
          ) : (
            <div className="w-full max-w-sm">
              <p className="text-sm opacity-60 mb-6">Код отправлен в приложение (откройте игру на телефоне)</p>
              <input type="text" value={loginPin} onChange={e => setLoginPin(e.target.value)} placeholder="4-значный код" className="w-full border rounded-xl px-4 py-3 mb-6 outline-none focus:border-blue-500 transition-colors text-center font-mono tracking-widest text-2xl" maxLength={4} style={{ background: isDark ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.5)", borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", color: isDark ? "#fff" : "#000" }} />
              <button onClick={() => verifyLoginCode(loginUser, loginPin)} className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3.5 font-bold tracking-wider transition-colors mb-2">ВОЙТИ</button>
              <button onClick={() => setLoginStep(1)} className="w-full bg-transparent opacity-50 hover:opacity-100 rounded-xl py-3 text-sm transition-opacity">Назад</button>
            </div>
          )}
        </div>
      </ThemeContext.Provider>
    );
  }

  // Проверка на тех. работы (ПОСЛЕ входа, чтобы админ мог авторизоваться с ПК)
  const isGlobalMaintenance = !!globalKibiks["SYSTEM_MAINTENANCE"];
  const isMixazx = tgUser?.username?.toLowerCase() === "mixazx" || currentUser?.username?.toLowerCase() === "@mixazx";
  const showMaintenanceScreen = currentUser?.showMaintenance || (isGlobalMaintenance && !isMixazx);

  if (showMaintenanceScreen) {
    const maintenanceText = isGlobalMaintenance 
      ? (globalKibiks["SYSTEM_MAINTENANCE"]?.name || "Ведутся технические работы. Ожидайте новостей!")
      : "Ведутся технические работы.\nВаш аккаунт временно ограничен.";

    return (
      <div className="size-full fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 text-center" style={{ background: "#0a0a0a", color: "#ffffff" }}>
        <ShieldAlert size={80} className="mb-6 text-white animate-pulse" />
        <h1 className="text-3xl font-black mb-4 tracking-widest leading-tight">ТЕХНИЧЕСКИЕ РАБОТЫ</h1>
        <p className="text-sm text-neutral-400 mb-6 font-medium leading-relaxed whitespace-pre-wrap">
          {maintenanceText}
        </p>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 w-full max-w-sm">
          <p className="text-sm text-neutral-300">Пожалуйста, зайдите позже.</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={{ isDark }}>
      <div
        className="size-full relative overflow-hidden flex flex-col"
        style={{ background: bg, minHeight: "100dvh", maxWidth: 430, margin: "0 auto" }}
      >
        {/* White/dark light glow from bottom */}
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

        {/* Баннер с ошибкой БД (если есть) */}
        {appError && (
          <div className="absolute top-0 left-0 right-0 z-50 p-3 bg-red-500/90 backdrop-blur-md text-white text-xs text-center font-medium shadow-lg border-b border-red-400">
            {appError}
          </div>
        )}

        {/* Всплывающий код для админов */}
        {currentUser?.loginCode && !urlParams.get("admin") && (
          <div className="absolute top-4 left-4 right-4 z-[100] bg-blue-600 text-white p-4 rounded-2xl shadow-2xl border border-blue-400 flex items-center justify-between overflow-hidden">
            <div className="absolute inset-0 bg-white/10 blur-xl pointer-events-none" />
            <div className="relative z-10">
              <p className="text-[10px] opacity-80 uppercase tracking-widest font-bold mb-0.5">Код для входа</p>
              <p className="text-3xl font-black tracking-widest">{currentUser.loginCode}</p>
            </div>
            <button onClick={clearLoginCode} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center relative z-10 hover:bg-white/30 transition-colors">
              <X size={16} />
            </button>
          </div>
        )}

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
              {!!globalKibiks[`TAB_DISABLED_${activeTab.toUpperCase()}`] ? (
                <div className="flex flex-col items-center justify-center h-full pt-32 text-center px-6">
                  <ShieldAlert size={60} className="text-red-500 mb-6 opacity-80" />
                  <h2 className="text-2xl font-bold mb-2" style={{ color: isDark ? "#fff" : "#000" }}>Раздел недоступен</h2>
                  <p className="text-sm text-neutral-400">Администратор временно отключил эту вкладку. Пожалуйста, зайдите позже.</p>
                </div>
              ) : (
                <>
                  {activeTab === "home"      && <HomePage onAddItem={addItem} inventory={inventory} />}
                  {activeTab === "inventory" && <InventoryPage inventory={inventory} />}
                  {activeTab === "market"    && <MarketPage />}
                  {activeTab === "clicker"   && <ClickerPage />}
                  {activeTab === "profile"   && <ProfilePage inventory={inventory} myName={myName} />}
                </>
              )}
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
              const isDisabled = !!globalKibiks[`TAB_DISABLED_${key.toUpperCase()}`];
              const activeIconColor = isDark ? "#ffffff" : "#0d0d0d";
              const inactiveIconColor = isDark ? "rgba(255,255,255,0.32)" : "rgba(0,0,0,0.28)";
              const activePillBg = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";
              const activePillBorder = isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.12)";

              return (
                <div key={key} className="relative flex flex-col items-center" style={{ minWidth: 72 }}>
                  {isDisabled && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-red-500/90 backdrop-blur text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap z-50 pointer-events-none">
                      Недоступно
                    </div>
                  )}
                  <motion.button
                    whileTap={isDisabled ? {} : { scale: 0.88 }}
                    onClick={() => {
                      if (isDisabled) return;
                      setActiveTab(key);
                    }}
                    className={`flex flex-col items-center gap-1 px-5 py-1.5 rounded-xl w-full transition-all ${isDisabled ? 'opacity-30 grayscale cursor-not-allowed' : ''}`}
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
                </div>
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
