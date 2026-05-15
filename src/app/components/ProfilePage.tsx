import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Users, Package2, Crown, Star, Zap, ChevronRight, X, ShieldAlert, Ban } from "lucide-react";
import { useTheme, glass, tc } from "./ThemeContext";
import type { InventoryItem } from "./HomePage";
import { useApp } from "../AppContext";
import type { MockUser as User } from "../data/mockData";

const statusCfg = {
  online:  { color: "#4ade80", label: "Онлайн" },
  offline: { color: "#6b7280", label: "Офлайн" },
  away:    { color: "#facc15", label: "Отошёл" },
};

export function ProfilePage({ inventory, myName = "Алекс" }: { inventory: InventoryItem[]; myName?: string }) {
  const { isDark } = useTheme();
  const c = tc(isDark);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showBanForm, setShowBanForm] = useState(false);
  const [banDays, setBanDays] = useState("1");
  const [banReason, setBanReason] = useState("");

  const { role: myRole, users, updateUserRole, banUser } = useApp();

  const myStats = {
    legendary: inventory.filter((i) => i.rarity === "legendary").length,
    epic: inventory.filter((i) => i.rarity === "epic").length,
    rare: inventory.filter((i) => i.rarity === "rare").length,
    common: inventory.filter((i) => i.rarity === "common").length,
  };
  const myLevel = Math.max(1, Math.floor(inventory.length / 3) + 1);

  const handleBan = () => {
    if (!selectedUser) return;
    const days = parseInt(banDays) || 1;
    const bannedUntil = new Date();
    bannedUntil.setDate(bannedUntil.getDate() + days);
    
    if (banUser) {
      banUser(selectedUser.id, bannedUntil, banReason);
    }
    
    setSelectedUser({ ...selectedUser, bannedUntil, banReason });
    setShowBanForm(false);
    setBanReason("");
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase())
  );

  const RoleBadge = ({ role }: { role?: "admin" | "creator" | "user" }) => {
    if (role === "admin") return <Crown size={14} className="text-yellow-400 shrink-0" />;
    if (role === "creator") return <span className="flex items-center justify-center w-[14px] h-[14px] rounded-full bg-purple-500 text-white text-[9px] font-bold shrink-0">C</span>;
    return null;
  };

  return (
    <div className="flex flex-col gap-4 p-4 pb-6">
      {/* My Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5"
        style={{
          ...glass(isDark, 0.07),
          boxShadow: isDark
            ? "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)"
            : "0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)",
        }}
      >
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-lg"
              style={{
                ...glass(isDark, 0.15),
                color: c.primary,
              }}
            >
              {myName.slice(0, 2).toUpperCase()}
            </div>
            <div
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2"
              style={{
                background: statusCfg.online.color,
                borderColor: isDark ? "rgba(10,10,15,0.9)" : "#f0f0f8",
                boxShadow: `0 0 8px ${statusCfg.online.color}`,
              }}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base truncate flex items-center gap-1" style={{ color: c.primary }}>
                {myName}
                <RoleBadge role={myRole} />
              </h2>
              <div
                className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                style={{ background: "rgba(250,204,21,0.15)", border: "1px solid rgba(250,204,21,0.25)" }}
              >
                <Star size={10} className="text-yellow-400" />
                <span className="text-yellow-400 text-[10px]">Ур. {myLevel}</span>
              </div>
            </div>
            <p className="text-xs mt-0.5" style={{ color: c.muted }}>{myRole === "admin" ? "Администратор" : myRole === "creator" ? "Креатор" : "Пользователь"}</p>
            <div className="flex items-center gap-1 mt-1.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: statusCfg.online.color, boxShadow: `0 0 4px ${statusCfg.online.color}` }}
              />
              <span className="text-xs" style={{ color: statusCfg.online.color }}>Онлайн</span>
            </div>
          </div>

          {/* Count */}
          <div className="text-center shrink-0">
            <div className="text-2xl" style={{ color: c.primary }}>{inventory.length}</div>
            <div className="text-[10px]" style={{ color: c.muted }}>кибиков</div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          {[
            { count: myStats.legendary, label: "Легенд", emoji: "👑" },
            { count: myStats.epic,      label: "Эпик",   emoji: "🔮" },
            { count: myStats.rare,      label: "Рейр",   emoji: "💎" },
            { count: myStats.common,    label: "Общих",  emoji: "📦" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl p-2 text-center"
              style={glass(isDark, 0.05)}
            >
              <div className="text-sm">{s.emoji}</div>
              <div className="text-xs mt-0.5" style={{ color: c.primary }}>{s.count}</div>
              <div className="text-[9px]" style={{ color: c.muted }}>{s.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Search */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Users size={14} style={{ color: c.muted }} />
          <span className="text-xs uppercase tracking-widest" style={{ color: c.muted }}>Найти пользователя</span>
        </div>
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={glass(isDark, 0.06)}
        >
          <Search size={16} style={{ color: c.muted }} className="shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Имя или @username..."
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: c.primary }}
          />
          {search && (
            <button onClick={() => setSearch("")}>
              <X size={14} style={{ color: c.muted }} />
            </button>
          )}
        </div>
      </div>

      {/* Users list */}
      <div className="flex flex-col gap-2">
        <AnimatePresence>
          {filteredUsers.map((user, i) => (
            <motion.button
              key={user.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: i * 0.04 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelectedUser(user);
                setShowBanForm(false);
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-left w-full"
              style={glass(isDark, 0.05)}
            >
              <div className="relative shrink-0">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-sm"
                  style={{ ...glass(isDark, 0.1), color: c.primary }}
                >
                  {user.avatar}
                </div>
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border"
                  style={{
                    background: statusCfg[user.status].color,
                    borderColor: isDark ? "rgba(10,10,15,0.9)" : "#f0f0f8",
                  }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm truncate" style={{ color: c.primary }}>{user.name}</span>
                  <RoleBadge role={user.role} />
                </div>
                <div className="text-xs truncate" style={{ color: c.muted }}>{user.username}</div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-lg">{user.topEmoji}</span>
                <div className="text-center">
                  <div className="text-sm" style={{ color: c.primary }}>{user.kibiks}</div>
                  <div className="text-[10px]" style={{ color: c.muted }}>кибик</div>
                </div>
                <ChevronRight size={14} style={{ color: c.muted }} />
              </div>
            </motion.button>
          ))}
        </AnimatePresence>

        {filteredUsers.length === 0 && search && (
          <div className="text-center py-8">
            <p className="text-sm" style={{ color: c.muted }}>Пользователь не найден</p>
          </div>
        )}
      </div>

      {/* User modal */}
      <AnimatePresence>
        {selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
              onClick={() => setSelectedUser(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 80 }}
              className="fixed bottom-20 left-4 right-4 z-50 rounded-3xl p-6"
              style={{
                background: isDark ? "rgba(12,12,20,0.96)" : "rgba(248,248,255,0.96)",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.1)"}`,
                backdropFilter: "blur(40px)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              }}
            >
              <button
                onClick={() => setSelectedUser(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
                style={glass(isDark, 0.1)}
              >
                <X size={14} style={{ color: c.secondary }} />
              </button>

              <div className="flex flex-col items-center text-center gap-3">
                <div className="relative">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center text-xl"
                    style={{ ...glass(isDark, 0.12), color: c.primary }}
                  >
                    {selectedUser.avatar}
                  </div>
                  <div
                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2"
                    style={{
                      background: statusCfg[selectedUser.status].color,
                      borderColor: isDark ? "rgba(12,12,20,0.96)" : "rgba(248,248,255,0.96)",
                      boxShadow: `0 0 10px ${statusCfg[selectedUser.status].color}`,
                    }}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-center gap-2">
                    <h3 style={{ color: c.primary }}>{selectedUser.name}</h3>
                    <RoleBadge role={selectedUser.role} />
                  </div>
                  <p className="text-sm" style={{ color: c.muted }}>{selectedUser.username}</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <div className="w-2 h-2 rounded-full" style={{ background: statusCfg[selectedUser.status].color }} />
                    <span className="text-xs" style={{ color: statusCfg[selectedUser.status].color }}>
                      {statusCfg[selectedUser.status].label}
                    </span>
                  </div>
                  
                  {selectedUser.bannedUntil && selectedUser.bannedUntil > new Date() && (
                    <div className="mt-2 bg-red-500/10 border border-red-500/30 rounded-lg p-2 text-xs text-red-400 text-left w-full">
                      <strong>Забанен до:</strong> {selectedUser.bannedUntil.toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" })}<br/>
                      <strong>Причина:</strong> {selectedUser.banReason || "Не указана"}
                    </div>
                  )}
                </div>

                <p className="text-sm px-2" style={{ color: c.secondary }}>{selectedUser.bio || "Нет описания"}</p>

                <div className="grid grid-cols-2 gap-3 w-full mt-1">
                  <div className="rounded-xl p-3 flex items-center gap-2" style={glass(isDark, 0.07)}>
                    <Package2 size={16} style={{ color: c.muted }} />
                    <div>
                      <div className="text-sm" style={{ color: c.primary }}>{selectedUser.kibiks}</div>
                      <div className="text-[10px]" style={{ color: c.muted }}>кибиков</div>
                    </div>
                  </div>
                  <div className="rounded-xl p-3 flex items-center gap-2" style={glass(isDark, 0.07)}>
                    <Zap size={16} style={{ color: c.muted }} />
                    <div>
                      <div className="text-sm" style={{ color: c.primary }}>{selectedUser.level}</div>
                      <div className="text-[10px]" style={{ color: c.muted }}>уровень</div>
                    </div>
                  </div>
                </div>
                
                {/* Admin Actions */}
                {myRole === "admin" && selectedUser.role !== "admin" && (
                  <div className="w-full mt-2 flex flex-col gap-2 pt-4" style={{ borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}` }}>
                    <p className="text-[10px] uppercase tracking-widest text-left" style={{ color: c.muted }}>Управление</p>
                    {selectedUser.role !== "creator" ? (
                      <button
                        onClick={() => {
                          updateUserRole(selectedUser.id, "creator");
                          setSelectedUser({ ...selectedUser, role: "creator" });
                        }}
                        className="w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                        style={{
                          background: "rgba(168, 85, 247, 0.15)",
                          color: "#c084fc",
                        }}
                      >
                        <ShieldAlert size={16} /> Назначить Креатором
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          updateUserRole(selectedUser.id, "user");
                          setSelectedUser({ ...selectedUser, role: "user" });
                        }}
                        className="w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                        style={{
                          background: "rgba(248, 113, 113, 0.15)",
                          color: "#f87171",
                        }}
                      >
                        <X size={16} /> Забрать статус Креатора
                      </button>
                    )}

                    <button
                      onClick={() => setShowBanForm(!showBanForm)}
                      className="w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 mt-1"
                      style={{
                        background: "rgba(239, 68, 68, 0.15)",
                        color: "#ef4444",
                      }}
                    >
                      <Ban size={16} /> {showBanForm ? "Отмена" : "Забанить пользователя"}
                    </button>

                    {showBanForm && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="flex flex-col gap-2 mt-1 p-3 rounded-xl border border-red-500/20"
                        style={glass(isDark, 0.05)}
                      >
                        <input
                          type="number"
                          min="1"
                          value={banDays}
                          onChange={(e) => setBanDays(e.target.value)}
                          placeholder="Срок (дней)"
                          className="w-full rounded-lg px-3 py-2 outline-none text-sm bg-transparent border border-red-500/30 text-red-400 placeholder-red-400/50"
                        />
                        <input
                          type="text"
                          value={banReason}
                          onChange={(e) => setBanReason(e.target.value)}
                          placeholder="Причина бана..."
                          className="w-full rounded-lg px-3 py-2 outline-none text-sm bg-transparent border border-red-500/30 text-red-400 placeholder-red-400/50"
                        />
                        <button
                          onClick={handleBan}
                          className="w-full py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-sm font-medium mt-1 hover:bg-red-500/30 transition-colors"
                        >
                          Подтвердить бан
                        </button>
                      </motion.div>
                    )}
                  </div>
                )}
                
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}