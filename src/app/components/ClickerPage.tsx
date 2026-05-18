import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Zap, X, Trash2, FolderOpen, Save, Download } from "lucide-react";
import { useTheme, glass, tc } from "./ThemeContext";
import { useApp } from "../AppContext";

const getUpgradeCost = (currentPower: number) => {
  if (currentPower <= 10) return 10000;
  if (currentPower <= 20) return 50000;
  return 100000;
};

interface SaveSlot {
  id: string;
  date: number;
  crystals: number;
  power: number;
}

export function ClickerPage() {
  const { isDark } = useTheme();
  const c = tc(isDark);
  const { tgUser, users, syncClicker, handleCheatBan, creatorProfile, buyAutoClicker } = useApp();
  
  const myId = tgUser ? tgUser.id.toString() : "12345";
  const currentUser = users.find(u => u.id === myId);
  
  const dbCrystals = currentUser?.crystals || 0;
  const currentPower = currentUser?.clickPower || 1;
  const level = Math.max(1, Math.floor((currentUser?.inventory?.length || 0) / 3) + 1);

  let multiplier = 1;
  if (creatorProfile?.active_subscription === 'Cores Basic') multiplier = 1.5;
  if (creatorProfile?.active_subscription === 'Cores Gold') multiplier = 2.5;
  if (creatorProfile?.active_subscription === 'Cores +') multiplier = 5;
  
  const effectivePower = Math.floor(currentPower * multiplier);

  const auto1 = currentUser?.auto_clickers?.level1 || 0;
  const auto2 = currentUser?.auto_clickers?.level2 || 0;
  const autoPps = ((auto1 * 1) + (auto2 * 3)) * multiplier;
  
  const [uncommitted, setUncommitted] = useState(() => {
    try {
      const saved = localStorage.getItem(`kibik_clicks_${myId}`);
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch (e) {
      return 0;
    }
  });
  const displayCrystals = dbCrystals + uncommitted;
  
  const [floatingTexts, setFloatingTexts] = useState<{ id: number; x: number; y: number; val: number }[]>([]);

  const [saves, setSaves] = useState<SaveSlot[]>(() => {
    try {
      const saved = localStorage.getItem(`kibik_saves_${myId}`);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [showSaveModal, setShowSaveModal] = useState(false);

  const clickTimes = useRef<number[]>([]);

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

  // Сохраняем слоты сохранений в память устройства
  useEffect(() => {
    localStorage.setItem(`kibik_saves_${myId}`, JSON.stringify(saves));
  }, [saves, myId]);

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

  const createSaveSlot = () => {
    const newSave: SaveSlot = {
      id: Date.now().toString(),
      date: Date.now(),
      crystals: displayCrystals,
      power: currentPower,
    };
    setSaves(prev => [newSave, ...prev]);
    syncClicker(myId, displayCrystals, currentPower);
    setUncommitted(0);
    localStorage.removeItem(`kibik_clicks_${myId}`);
  };

  const loadSaveSlot = (save: SaveSlot) => {
    syncClicker(myId, save.crystals, save.power);
    setUncommitted(0);
    localStorage.removeItem(`kibik_clicks_${myId}`);
    setShowSaveModal(false);
  };

  const deleteSaveSlot = (id: string) => setSaves(prev => prev.filter(s => s.id !== id));

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

  // Эффект автокликера
  useEffect(() => {
    if (autoPps <= 0) return;
    const interval = setInterval(() => {
      setUncommitted(prev => {
        if (dbCrystals + prev >= MAX_CRYSTALS) return prev;
        return prev + autoPps;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [autoPps, dbCrystals, MAX_CRYSTALS]);

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

    const amount = Math.min(effectivePower, MAX_CRYSTALS - displayCrystals);
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
        {autoPps > 0 && <span className="text-[10px] text-green-400 mt-1 font-bold tracking-widest text-center">АВТОКЛИКЕР: +{autoPps} / СЕК</span>}
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

      {/* Auto-clickers */}
      <div className="flex gap-2 mb-2 relative z-10">
        {(creatorProfile?.active_subscription === 'Cores Gold' || creatorProfile?.active_subscription === 'Cores +') && (
          <button
            onClick={() => buyAutoClicker(1)}
            disabled={auto1 >= 5 || displayCrystals < 25000}
            className="flex-1 py-2 rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-xs font-bold disabled:opacity-50 flex flex-col items-center justify-center transition-colors"
          >
            <span>Автоклик 1ур ({auto1}/5)</span>
            <span className="text-[9px] opacity-70">25,000 💎</span>
          </button>
        )}
        {creatorProfile?.active_subscription === 'Cores +' && (
          <button
            onClick={() => buyAutoClicker(2)}
            disabled={auto2 >= 4 || displayCrystals < 50000}
            className="flex-1 py-2 rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs font-bold disabled:opacity-50 flex flex-col items-center justify-center transition-colors"
          >
            <span>Автоклик 2ур ({auto2}/4)</span>
            <span className="text-[9px] opacity-70">50,000 💎</span>
          </button>
        )}
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
          {multiplier > 1 && <span className="text-xs font-bold text-green-400 mt-0.5">Активен буст от подписки: x{multiplier} (Клик: +{effectivePower})</span>}
          {currentPower < MAX_POWER && <span className="text-xs text-blue-300 mt-1">Цена: {getUpgradeCost(currentPower).toLocaleString()} 💎</span>}
          {currentPower >= MAX_POWER && <span className="text-xs text-yellow-400 mt-1">Максимальный уровень!</span>}
        </button>

        <div className="flex gap-2">
          <button
            onClick={handleManualSave}
            disabled={uncommitted === 0}
            className="flex-1 py-3 rounded-2xl flex items-center justify-center disabled:opacity-50 transition-colors"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <span className="text-white font-semibold text-sm">💾 В базу ({uncommitted})</span>
          </button>
          
          <button
            onClick={() => setShowSaveModal(true)}
            className="flex-1 py-3 rounded-2xl flex items-center justify-center transition-colors"
            style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)" }}
          >
            <span className="text-blue-400 font-semibold text-sm flex items-center gap-2"><FolderOpen size={16}/> Слоты</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showSaveModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm" onClick={() => setShowSaveModal(false)} />
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-10 left-4 right-4 z-50 rounded-3xl p-6 flex flex-col max-h-[70vh]" style={{ background: isDark ? "#111" : "#fff", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold" style={{ color: c.primary }}>Сохранения</h3>
                <button onClick={() => setShowSaveModal(false)} className="p-2 rounded-full" style={glass(isDark, 0.1)}><X size={16} style={{ color: c.primary }} /></button>
              </div>
              <button onClick={createSaveSlot} className="w-full py-3 mb-4 rounded-xl font-bold flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-500 transition-colors">
                <Save size={18} /> Создать точку сохранения
              </button>
              <div className="flex-1 overflow-y-auto flex flex-col gap-2 scrollbar-none pr-1">
                {saves.length === 0 && <p className="text-center text-sm py-4" style={{ color: c.muted }}>Нет сохранений</p>}
                {saves.map(save => (
                  <div key={save.id} className="p-3 rounded-xl flex items-center justify-between border" style={{ ...glass(isDark, 0.05), borderColor: "rgba(255,255,255,0.05)" }}>
                    <div>
                      <div className="text-xs font-mono mb-1" style={{ color: c.muted }}>{new Date(save.date).toLocaleString()}</div>
                      <div className="text-sm font-bold text-blue-400">{save.crystals.toLocaleString()} 💎</div>
                      <div className="text-[10px]" style={{ color: c.muted }}>Сила клика: {save.power}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => loadSaveSlot(save)} className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors" title="Загрузить"><Download size={16} /></button>
                      <button onClick={() => deleteSaveSlot(save.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors" title="Удалить"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}