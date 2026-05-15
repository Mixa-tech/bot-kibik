import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Package, Sparkles, CheckCircle, XCircle, ChevronRight, PlusCircle, ImagePlus } from "lucide-react";
import { useTheme, glass, tc } from "./ThemeContext";
import { useApp } from "../AppContext";

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  emoji: string;
  addedAt: Date;
}

interface HomePageProps {
  onAddItem: (item: InventoryItem) => void;
  inventory: InventoryItem[];
}

const rarityGradients = {
  common: "from-white/10 to-transparent",
  rare: "from-blue-400/20 to-transparent",
  epic: "from-purple-400/20 to-transparent",
  legendary: "from-yellow-400/20 to-transparent",
};

const rarityLabel = {
  common: "Обычный",
  rare: "Редкий",
  epic: "Эпический",
  legendary: "Легендарный",
};

export function HomePage({ onAddItem, inventory }: HomePageProps) {
  const { isDark } = useTheme();
  const c = tc(isDark);
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error" | "duplicate">("idle");
  const [lastAdded, setLastAdded] = useState<InventoryItem | null>(null);

  const { role, globalKibiks, addGlobalKibik, removeGlobalKibik } = useApp();

  // Admin form state
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewEmoji(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newRarity, setNewRarity] = useState<"common" | "rare" | "epic" | "legendary">("common");
  const [newEmoji, setNewEmoji] = useState("📦");
  const [adminStatus, setAdminStatus] = useState<"idle" | "success">("idle");

  const handleSubmit = () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    const itemData = globalKibiks[trimmed];
    if (!itemData) {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2500);
      return;
    }
    const alreadyHave = inventory.some((i) => i.code === trimmed);
    if (alreadyHave) {
      setStatus("duplicate");
      setTimeout(() => setStatus("idle"), 2500);
      return;
    }
    const newItem: InventoryItem = { ...itemData, id: `${trimmed}-${Date.now()}`, addedAt: new Date() };
    onAddItem(newItem);
    if (removeGlobalKibik) removeGlobalKibik(trimmed); // Делаем код одноразовым
    setLastAdded(newItem);
    setStatus("success");
    setCode("");
    setTimeout(() => setStatus("idle"), 3000);
  };

  const handleAdminAddKibik = () => {
    if (!newCode || !newName || !newEmoji) return;
    
    addGlobalKibik(newCode, {
      code: newCode.toUpperCase(),
      name: newName,
      rarity: newRarity,
      emoji: newEmoji,
    });
    
    setAdminStatus("success");
    setNewCode("");
    setNewName("");
    setNewEmoji("📦");
    setTimeout(() => setAdminStatus("idle"), 2000);
  };

  const recentItems = inventory.slice(-3).reverse();

  return (
    <div className="flex flex-col gap-5 p-4">
      {/* Header */}
      <div className="text-center pt-2">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-3"
          style={{ ...glass(isDark, 0.08), boxShadow: "none" }}
        >
          <Sparkles size={14} style={{ color: c.secondary }} />
          <span className="text-xs uppercase tracking-wide" style={{ color: c.secondary }}>Активировать кибик</span>
        </motion.div>
        <h1 style={{ color: c.primary }} className="text-2xl tracking-tight flex items-center justify-center gap-2">
          Введи код
          <span className="text-[10px] font-bold bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded uppercase border border-red-500/30">BETA</span>
        </h1>
        <p className="text-sm mt-1" style={{ color: c.muted }}>Получи кибик в инвентарь</p>
      </div>

      {/* Admin Panel */}
      {role === "admin" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4 flex flex-col gap-3"
          style={{
            ...glass(isDark, 0.08),
            border: "1px solid rgba(234, 179, 8, 0.3)", // golden border
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-yellow-400">👑</span>
            <h2 className="text-sm font-semibold text-yellow-400">Панель Админа: Создать Кибик</h2>
          </div>
          <input
            type="text"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value.toUpperCase())}
            placeholder="Код (например, NEW2026)"
            className="w-full rounded-xl px-3 py-2 outline-none text-sm"
            style={{ ...glass(isDark, 0.06), color: c.primary }}
          />
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Название"
            className="w-full rounded-xl px-3 py-2 outline-none text-sm"
            style={{ ...glass(isDark, 0.06), color: c.primary }}
          />
          <div className="flex gap-2">
            <div className="flex flex-1 relative">
              <input
                type="text"
                value={newEmoji}
                onChange={(e) => setNewEmoji(e.target.value)}
                placeholder="Эмодзи/URL"
                className="w-full rounded-xl px-3 py-2 pr-10 outline-none text-sm"
                style={{ ...glass(isDark, 0.06), color: c.primary }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-lg"
                style={{ ...glass(isDark, 0.1), color: c.muted }}
                title="Загрузить фото"
              >
                <ImagePlus size={14} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
            <select
              value={newRarity}
              onChange={(e) => setNewRarity(e.target.value as any)}
              className="flex-1 rounded-xl px-3 py-2 outline-none text-sm appearance-none min-w-[100px]"
              style={{ ...glass(isDark, 0.06), color: c.primary }}
            >
              <option value="common">Обычный</option>
              <option value="rare">Редкий</option>
              <option value="epic">Эпический</option>
              <option value="legendary">Легендарный</option>
            </select>
          </div>
          <button
            onClick={handleAdminAddKibik}
            className="w-full py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
            style={{
              background: isDark ? "rgba(234, 179, 8, 0.15)" : "rgba(234, 179, 8, 0.1)",
              color: "#eab308",
            }}
          >
            <PlusCircle size={16} /> Добавить в систему
          </button>
          {adminStatus === "success" && <div className="text-green-400 text-xs text-center mt-1">Успешно добавлено!</div>}
        </motion.div>
      )}

      {/* Input card */}
      <motion.div
        className="rounded-2xl p-5"
        style={{
          ...glass(isDark, 0.06),
          boxShadow: isDark
            ? "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)"
            : "0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)",
        }}
      >
        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Введи код кибика"
            maxLength={20}
            className="w-full rounded-xl px-4 py-3 outline-none tracking-widest text-center"
            style={{
              ...glass(isDark, 0.06),
              color: c.primary,
              fontSize: "1.05rem",
            }}
          />

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            className="w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2"
            style={{
              background: isDark
                ? "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(210,210,210,0.9))"
                : "linear-gradient(135deg, rgba(20,20,20,0.9), rgba(50,50,50,0.85))",
              color: isDark ? "#000" : "#fff",
              boxShadow: isDark
                ? "0 4px 20px rgba(255,255,255,0.15)"
                : "0 4px 20px rgba(0,0,0,0.2)",
            }}
          >
            <Package size={18} />
            Активировать
          </motion.button>
        </div>

        <AnimatePresence>
          {status !== "idle" && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3 flex items-center gap-2 px-3 py-2.5 rounded-xl"
              style={{
                background: status === "success" ? "rgba(74,222,128,0.12)" : "rgba(248,113,113,0.12)",
                border: `1px solid ${status === "success" ? "rgba(74,222,128,0.25)" : "rgba(248,113,113,0.25)"}`,
              }}
            >
              {status === "success" ? (
                <>
                  <CheckCircle size={16} className="text-green-400 shrink-0" />
                  <span className="text-green-400 text-sm">{lastAdded?.emoji} {lastAdded?.name} добавлен!</span>
                </>
              ) : (
                <>
                  <XCircle size={16} className="text-red-400 shrink-0" />
                  <span className="text-red-400 text-sm">
                    {status === "duplicate" ? "Этот кибик уже в инвентаре" : "Неверный код кибика"}
                  </span>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Success reveal */}
      <AnimatePresence>
        {status === "success" && lastAdded && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className={`rounded-2xl p-5 bg-gradient-to-br ${rarityGradients[lastAdded.rarity]}`}
            style={{
              ...glass(isDark, 0.08),
              boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
            }}
          >
            <div className="text-center">
              {/^(https?|data|blob):/.test(lastAdded.emoji) ? (
                <img src={lastAdded.emoji} alt={lastAdded.name} className="w-16 h-16 mx-auto mb-2 object-cover rounded-xl" />
              ) : (
                <div className="text-5xl mb-2">{lastAdded.emoji}</div>
              )}
              <div style={{ color: c.primary }} className="font-semibold">{lastAdded.name}</div>
              <div style={{ color: c.muted }} className="text-xs mt-1">{rarityLabel[lastAdded.rarity]}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent */}
      {recentItems.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-widest mb-3 px-1" style={{ color: c.muted }}>Недавно добавлено</p>
          <div className="flex flex-col gap-2">
            {recentItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={glass(isDark, 0.05)}
              >
                {item.emoji.startsWith("http") ? (
                  <img src={item.emoji} alt={item.name} className="w-8 h-8 object-cover rounded-lg" />
                ) : (
                  <span className="text-2xl">{item.emoji}</span>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate" style={{ color: c.primary }}>{item.name}</div>
                  <div className="text-xs" style={{ color: c.muted }}>{rarityLabel[item.rarity]}</div>
                </div>
                <ChevronRight size={14} style={{ color: c.muted }} />
              </motion.div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
