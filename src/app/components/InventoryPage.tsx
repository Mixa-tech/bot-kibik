import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Package2, Filter, X } from "lucide-react";
import { useTheme, glass, tc } from "./ThemeContext";
import { useApp } from "../AppContext";
import type { InventoryItem } from "./HomePage";

interface InventoryPageProps {
  inventory: InventoryItem[];
}

const rarityStyles = {
  common: {
    bg: "rgba(255,255,255,0.07)", border: "rgba(255,255,255,0.15)",
    glow: "rgba(255,255,255,0.04)", label: "Обычный", badge: "rgba(255,255,255,0.15)",
  },
  rare: {
    bg: "rgba(59,130,246,0.12)", border: "rgba(96,165,250,0.3)",
    glow: "rgba(59,130,246,0.08)", label: "Редкий", badge: "rgba(59,130,246,0.25)",
  },
  epic: {
    bg: "rgba(168,85,247,0.12)", border: "rgba(192,132,252,0.3)",
    glow: "rgba(168,85,247,0.08)", label: "Эпический", badge: "rgba(168,85,247,0.25)",
  },
  legendary: {
    bg: "rgba(234,179,8,0.12)", border: "rgba(253,224,71,0.35)",
    glow: "rgba(234,179,8,0.1)", label: "Легендарный", badge: "rgba(234,179,8,0.25)",
  },
};

const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
type FilterType = "all" | "common" | "rare" | "epic" | "legendary";

export function InventoryPage({ inventory }: InventoryPageProps) {
  const { isDark } = useTheme();
  const c = tc(isDark);
  const [filter, setFilter] = useState<FilterType>("all");
  const [selected, setSelected] = useState<InventoryItem | null>(null);
  const [isSelling, setIsSelling] = useState(false);
  const [sellPrice, setSellPrice] = useState("");

  const { tgUser, sellKibik } = useApp();
  const myId = tgUser ? tgUser.id.toString() : "12345";

  const filtered = inventory
    .filter((i) => filter === "all" || i.rarity === filter)
    .sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]);

  const counts: Record<FilterType, number> = {
    all: inventory.length,
    common: inventory.filter((i) => i.rarity === "common").length,
    rare: inventory.filter((i) => i.rarity === "rare").length,
    epic: inventory.filter((i) => i.rarity === "epic").length,
    legendary: inventory.filter((i) => i.rarity === "legendary").length,
  };

  const filters: { key: FilterType; label: string; emoji: string }[] = [
    { key: "all", label: "Все", emoji: "📦" },
    { key: "legendary", label: "Легенд", emoji: "👑" },
    { key: "epic", label: "Эпик", emoji: "🔮" },
    { key: "rare", label: "Рейр", emoji: "💎" },
    { key: "common", label: "Обычн", emoji: "🧊" },
  ];

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 style={{ color: c.primary }} className="text-xl tracking-tight">Инвентарь</h1>
          <p className="text-xs mt-0.5" style={{ color: c.muted }}>{inventory.length} кибиков</p>
        </div>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={glass(isDark, 0.08)}
        >
          <Filter size={16} style={{ color: c.secondary }} />
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {filters.map((f) => {
          const active = filter === f.key;
          return (
            <motion.button
              key={f.key}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(f.key)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
              style={{
                background: active ? (isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.12)") : (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"),
                border: `1px solid ${active ? (isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.2)") : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)")}`,
                backdropFilter: "blur(10px)",
                color: active ? c.primary : c.muted,
              }}
            >
              <span>{f.emoji}</span>
              <span>{f.label}</span>
              {counts[f.key] > 0 && (
                <span
                  className="rounded-full px-1.5 py-0.5 text-[10px]"
                  style={{ background: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)" }}
                >
                  {counts[f.key]}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 gap-3"
        >
          <Package2 size={40} style={{ color: c.muted, opacity: 0.4 }} />
          <p className="text-sm" style={{ color: c.muted }}>
            {inventory.length === 0 ? "Инвентарь пустой — введи код на главной" : "Нет кибиков этой редкости"}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <AnimatePresence>
            {filtered.map((item, i) => {
              const rs = rarityStyles[item.rarity];
              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setSelected(item)}
                  className="rounded-2xl p-4 flex flex-col items-center gap-2"
                  style={{
                    background: rs.bg,
                    border: `1px solid ${rs.border}`,
                    backdropFilter: "blur(20px)",
                    boxShadow: `0 4px 20px ${rs.glow}, inset 0 1px 0 rgba(255,255,255,0.06)`,
                  }}
                >
                  {/^(https?|data|blob):/.test(item.emoji) ? (
                    <img src={item.emoji} alt={item.name} className="w-12 h-12 object-cover rounded-xl" />
                  ) : (
                    <div className="text-4xl">{item.emoji}</div>
                  )}
                  <div className="text-xs text-center leading-tight" style={{ color: c.primary }}>{item.name}</div>
                  <div
                    className="px-2 py-0.5 rounded-full text-[10px]"
                    style={{ background: rs.badge, color: "rgba(255,255,255,0.85)" }}
                  >
                    {rs.label}
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Detail modal */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
              onClick={() => setSelected(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 80 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="fixed bottom-20 left-4 right-4 z-50 rounded-3xl p-6"
              style={{
                background: isDark ? "rgba(12,12,20,0.95)" : "rgba(250,250,255,0.95)",
                border: `1px solid ${rarityStyles[selected.rarity].border}`,
                backdropFilter: "blur(40px)",
                boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 40px ${rarityStyles[selected.rarity].glow}`,
              }}
            >
              <button
                onClick={() => { setSelected(null); setIsSelling(false); setSellPrice(""); }}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
                style={glass(isDark, 0.1)}
              >
                <X size={14} style={{ color: c.secondary }} />
              </button>
              <div className="text-center">
                <div className="text-7xl mb-4">{selected.emoji}</div>
                <h3 className="text-lg mb-1" style={{ color: c.primary }}>{selected.name}</h3>
                <div
                  className="inline-block px-3 py-1 rounded-full text-xs mb-4"
                  style={{ background: rarityStyles[selected.rarity].badge, color: "rgba(255,255,255,0.9)" }}
                >
                  {rarityStyles[selected.rarity].label}
                </div>
                <div className="text-xs mb-6" style={{ color: c.muted }}>
                  Код: {selected.code} · {selected.addedAt.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" })}
                </div>

                {isSelling ? (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex flex-col gap-3">
                    <div className="relative">
                      <input
                        type="number"
                        value={sellPrice}
                        onChange={(e) => setSellPrice(e.target.value)}
                        placeholder="Цена (до 10 000 000)"
                        max="10000000"
                        className="w-full rounded-xl px-4 py-3 outline-none text-center bg-transparent border text-sm"
                        style={{ borderColor: rarityStyles[selected.rarity].border, color: c.primary }}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50">💎</span>
                    </div>
                    <button
                      onClick={() => {
                        const p = parseInt(sellPrice);
                        if (p > 0 && p <= 10000000) { sellKibik(myId, selected.id, p); setSelected(null); setIsSelling(false); setSellPrice(""); }
                      }}
                      className="w-full py-3 rounded-xl font-bold text-white transition-opacity disabled:opacity-50"
                      style={{ background: "#3b82f6", boxShadow: "0 4px 20px rgba(59,130,246,0.3)" }}
                      disabled={!parseInt(sellPrice) || parseInt(sellPrice) <= 0 || parseInt(sellPrice) > 10000000}
                    >
                      Выставить на продажу
                    </button>
                  </motion.div>
                ) : (
                  <button onClick={() => setIsSelling(true)} className="w-full py-3 rounded-xl font-medium transition-colors" style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa" }}>Продать на бирже</button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
