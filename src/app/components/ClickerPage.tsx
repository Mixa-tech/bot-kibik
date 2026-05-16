import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Zap } from "lucide-react";
import { useTheme, glass, tc } from "./ThemeContext";
import { useApp } from "../AppContext";

const getUpgradeCost = (currentPower: number) => {
  if (currentPower <= 10) return 10000;
  if (currentPower <= 20) return 50000;
  return 100000;
};

export function ClickerPage() {
  const { isDark } = useTheme();
  const c = tc(isDark);
  const { tgUser, users, syncClicker, handleCheatBan } = useApp();
  
  const myId = tgUser ? tgUser.id.toString() : "12345";
  const currentUser = users.find(u => u.id === myId);
  
  const dbCrystals = currentUser?.crystals || 0;
  const currentPower = currentUser?.clickPower || 1;
  
  const [uncommitted, setUncommitted] = useState(() => {
    const saved = localStorage.getItem(`kibik_clicks_${myId}`);
    return saved ? parseInt(saved, 10) || 0 : 0;
  });
  const displayCrystals = dbCrystals + uncommitted;
  
  const [floatingTexts, setFloatingTexts] = useState<{ id: number; x: number; y: number; val: number }[]>([]);

  const clickTimes = useRef<number[]>([]);

  const level = Math.max(1, Math.floor((currentUser?.inventory?.length || 0) / 3) + 1);
  const MAX_CRYSTALS = 500000 + ((level - 1) * 100000);
  const MAX_POWER = 50;

  // Храним актуальные данные в Ref, чтобы функция экстренного сохранения всегда видела свежие цифры
  const latestState = useRef({ myId, dbCrystals, currentPower, uncommitted });
  useEffect(() => {
    latestState.current = { myId, dbCrystals, currentPower, uncommitted };
  }, [myId, dbCrystals, currentPower, uncommitted]);

  // Сохраняем локальные клики в память телефона, чтобы не терялись при резком закрытии Telegram
  useEffect(() => {
    if (uncommitted > 0) {
      localStorage.setItem(`kibik_clicks_${myId}`, uncommitted.toString());
    } else {
      localStorage.removeItem(`kibik_clicks_${myId}`);
    }
  }, [uncommitted, myId]);

  // Экстренное сохранение при закрытии бота, сворачивании Telegram или смене вкладки
  useEffect(() => {
    const forceSync = () => {
      const state = latestState.current;
      if (state.uncommitted > 0) {
        syncClicker(state.myId, state.dbCrystals + state.uncommitted, state.currentPower);
        state.uncommitted = 0; // Обнуляем сразу, чтобы избежать двойного сохранения
        setUncommitted(0);
        localStorage.removeItem(`kibik_clicks_${state.myId}`);
      }
    };

    const handleVisibility = () => { if (document.visibilityState === 'hidden') forceSync(); };

    window.addEventListener('beforeunload', forceSync);
    window.addEventListener('pagehide', forceSync);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('beforeunload', forceSync);
      window.removeEventListener('pagehide', forceSync);
      document.removeEventListener('visibilitychange', handleVisibility);
      forceSync(); // Вызывается, если мы уходим с вкладки "Кликер" на вкладку "Профиль", например
    };
  }, [syncClicker]);

  const handleManualSave = () => {
    if (uncommitted > 0) {
      syncClicker(myId, dbCrystals + uncommitted, currentPower);
      setUncommitted(0);
      localStorage.removeItem(`kibik_clicks_${myId}`);
    }
  };

  // Интеллектуальная синхронизация (каждую секунду скидываем клики на сервер без сброса таймера)
  useEffect(() => {
    const interval = setInterval(() => {
      const state = latestState.current;
      if (state.uncommitted > 0) {
        syncClicker(state.myId, state.dbCrystals + state.uncommitted, state.currentPower);
        state.uncommitted = 0;
        setUncommitted(0);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [syncClicker]);

  const handleTap = (e: React.TouchEvent | React.MouseEvent) => {
    const now = Date.now();
    
    // --- АНТИЧИТ ---
    clickTimes.current.push(now);
    if (clickTimes.current.length > 35) clickTimes.current.shift();
    if (clickTimes.current.length === 35) {
      // Если 35 кликов сделано меньше чем за 1 секунду (нереально для человека)
      if (now - clickTimes.current[0] < 1000) {
        handleCheatBan(myId);
        return;
      }
    }
    // ---------------

    if (displayCrystals >= MAX_CRYSTALS) return;

    const amount = Math.min(currentPower, MAX_CRYSTALS - displayCrystals);
    setUncommitted(prev => prev + amount);

    // Анимация вылетающих циферок
    let clientX = 0, clientY = 0;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    
    const newText = { id: now + Math.random(), x: clientX, y: clientY, val: amount };
    setFloatingTexts(prev => [...prev, newText]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== newText.id));
    }, 1000);
  };

  const handleUpgrade = () => {
    if (currentPower >= MAX_POWER) return;
    const cost = getUpgradeCost(currentPower);
    
    setUncommitted(prev => {
      const currentTotal = dbCrystals + prev;
      if (currentTotal >= cost) {
        syncClicker(myId, currentTotal - cost, currentPower + 1);
        return 0;
      }
      return prev;
    });
  };

  return (
    <div className="min-h-full flex flex-col p-4 bg-black">
      {/* Header */}
      <div className="flex flex-col items-center pt-6 gap-2 relative z-10">
        <h2 className="text-white text-5xl font-black tracking-tight flex items-center gap-2">
          {displayCrystals.toLocaleString()}
        </h2>
        <div className="w-48 h-2 bg-white/10 rounded-full overflow-hidden mt-2">
          <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${(displayCrystals / MAX_CRYSTALS) * 100}%` }} />
        </div>
        <span className="text-xs text-white/50">{displayCrystals.toLocaleString()} / {MAX_CRYSTALS.toLocaleString()}</span>
      </div>

      {/* Clicker Area */}
      <div className="flex-1 flex items-center justify-center relative">
        <motion.div
          whileTap={{ scale: 0.92 }}
          onMouseDown={handleTap}
          onTouchStart={handleTap}
          className="relative select-none outline-none cursor-pointer flex items-center justify-center rounded-full"
          style={{ width: 280, height: 280, WebkitTapHighlightColor: 'transparent' }}
        >
          {/* Сияние за кристаллом */}
          <div className="absolute inset-0 bg-blue-500/20 blur-[60px] rounded-full pointer-events-none" />
          <img 
            src="/crystal/crystal.png" 
            alt="Кристалл" 
            className="w-56 h-56 object-contain relative z-10 drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]" 
            onError={(e) => (e.currentTarget.src = "https://cdn.pixabay.com/photo/2012/04/18/14/46/diamond-37025_1280.png")}
          />
        </motion.div>

        {/* Floating Numbers */}
        <AnimatePresence>
          {floatingTexts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 1, y: t.y - 100, x: t.x - 20, scale: 1 }}
              animate={{ opacity: 0, y: t.y - 200, scale: 1.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="fixed text-3xl font-black text-white pointer-events-none z-50 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]"
            >
              +{t.val}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Upgrades */}
      <div className="mt-auto pb-4 relative z-10 flex flex-col gap-2">
        <button
          disabled={currentPower >= MAX_POWER || displayCrystals < getUpgradeCost(currentPower)}
          onClick={handleUpgrade}
          className="w-full py-4 rounded-2xl flex flex-col items-center justify-center disabled:opacity-50 disabled:grayscale"
          style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(37,99,235,0.1))", border: "1px solid rgba(59,130,246,0.3)" }}
        >
          <span className="text-white font-bold flex items-center gap-2"><Zap size={16} className="text-blue-400" /> Прокачать силу клика (Текущая: {currentPower})</span>
          {currentPower < MAX_POWER && <span className="text-xs text-blue-300 mt-1">Цена: {getUpgradeCost(currentPower).toLocaleString()} 💎</span>}
          {currentPower >= MAX_POWER && <span className="text-xs text-yellow-400 mt-1">Максимальный уровень!</span>}
        </button>

        <button
          onClick={handleManualSave}
          disabled={uncommitted === 0}
          className="w-full py-3 rounded-2xl flex items-center justify-center disabled:opacity-50 transition-colors"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <span className="text-white font-semibold text-sm">💾 Сохранить вручную ({uncommitted} 💎)</span>
        </button>
      </div>
    </div>
  );
}