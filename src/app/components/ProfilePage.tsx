import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Users, Package2, Crown, Star, Zap, ChevronRight, X, ShieldAlert, Ban, ArrowRightLeft, Wallet, Check, Gem, Gift, PlusCircle, ImagePlus, Lock, Package } from "lucide-react";
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

  const [showTradeModal, setShowTradeModal] = useState(false);
  const [tradeOffer, setTradeOffer] = useState<InventoryItem | null>(null);
  const [tradeRequest, setTradeRequest] = useState<InventoryItem | null>(null);

  const { role: myRole, users, updateUserRole, banUser, unbanUser, tgUser, trades, createTrade, acceptTrade, declineTrade, convertPasscoins, creatorProfiles, creatorProfile, submitKibikForReview, claimDailyBonus } = useApp();
  const myId = tgUser ? tgUser.id.toString() : "12345";
  const pendingIncoming = trades.filter((t) => t.receiver_id === myId && t.status === "pending");
  const pendingOutgoing = trades.filter((t) => t.sender_id === myId && t.status === "pending");
  const currentUser = users.find((u) => u.id === myId);

  const myStats = {
    legendary: inventory.filter((i) => i.rarity === "legendary").length,
    epic: inventory.filter((i) => i.rarity === "epic").length,
    rare: inventory.filter((i) => i.rarity === "rare").length,
    common: inventory.filter((i) => i.rarity === "common").length,
  };
  const myLevel = Math.max(1, Math.floor(inventory.length / 3) + 1);

  // Cores+ Features
  const activeSubName = creatorProfile?.active_subscription;
  const isCreator = creatorProfile?.status === 'approved';

  const createdKibiksCount = creatorProfile?.task_progress?.CREATED_KIBIKS || 0;
  const lastCreationDate = creatorProfile?.last_kibik_creation_date ? new Date(creatorProfile.last_kibik_creation_date) : new Date(0);
  const now = new Date();
  const isSameMonth = lastCreationDate.getMonth() === now.getMonth() && lastCreationDate.getFullYear() === now.getFullYear();
  const createdThisMonth = isSameMonth ? (creatorProfile?.task_progress?.CREATED_THIS_MONTH || 0) : 0;
  
  const monthlyLimit = activeSubName ? (10 * myLevel) : 0;
  const canCreate = (isCreator && createdKibiksCount < 20) || (activeSubName && createdThisMonth < monthlyLimit);
  
  const lastDaily = creatorProfile?.last_daily_bonus ? new Date(creatorProfile.last_daily_bonus).getTime() : 0;
  const canClaimDaily = activeSubName === 'Cores +' && (Date.now() - lastDaily > 24 * 60 * 60 * 1000);

  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newRarity, setNewRarity] = useState<"common" | "rare" | "epic" | "legendary">("common");
  const [newEmoji, setNewEmoji] = useState("📦");
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleKibikUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_SIZE = 256;
          let width = img.width; let height = img.height;
          if (width > height) { if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } } 
          else { if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; } }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          setNewEmoji(canvas.toDataURL("image/jpeg", 0.7));
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitKibik = () => {
    const code = newCode.trim().toUpperCase();
    const name = newName.trim();
    if (!code || !name) { setSubmitStatus("error"); setTimeout(() => setSubmitStatus("idle"), 2500); return; }
    submitKibikForReview({ code, name, rarity: newRarity, emoji: newEmoji, creator_id: creatorProfile?.user_id || myId });
    setSubmitStatus("success"); setNewCode(""); setNewName(""); setNewEmoji("📦"); setTimeout(() => setSubmitStatus("idle"), 3000);
  };

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
      (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.username || "").toLowerCase().includes(search.toLowerCase())
  );

  const RoleBadge = ({ role, userId }: { role?: "admin" | "creator" | "user", userId: string }) => {
    if (role === "admin") return <Crown size={14} className="text-yellow-400 shrink-0" />;
    if (role === "creator") {
      const profile = creatorProfiles.find(p => p.user_id === userId);
      if (profile?.creator_level === "legendary") return <Gem size={14} className="text-orange-500 shrink-0" title="Legendary Creator" />;
      if (profile?.creator_level === "mythic") return <Zap size={14} className="text-purple-400 shrink-0" title="Mythic Creator" />;
      if (profile?.creator_level === "super") return <Crown size={14} className="text-yellow-400 shrink-0" title="Super Creator" />;
      if (profile?.creator_level === "verified") return <Check size={14} className="text-blue-400 shrink-0" title="Verified Creator" />;
      return <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 shrink-0 leading-none" style={{ fontSize: '15px' }} title="Creator">C</span>;
    }
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
                <RoleBadge role={myRole} userId={myId} />
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
          <div className="text-center shrink-0 flex flex-col gap-1 items-end">
            <div className="flex items-center gap-1 font-bold text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-lg border border-yellow-500/20 mb-1">
                <Wallet size={12}/> {currentUser?.passcoins || 0} PC
            </div>
            <div>
            <div className="text-2xl" style={{ color: c.primary }}>{inventory.length}</div>
            <div className="text-[10px]" style={{ color: c.muted }}>кибиков</div>
            </div>
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

      {/* Cores+ Panel */}
      {activeSubName === 'Cores +' && (
          <div className="mt-2 p-4 rounded-2xl" style={{ ...glass(isDark, 0.05), border: `1px solid ${isDark ? 'rgba(168,85,247,0.3)' : 'rgba(168,85,247,0.5)'}`, background: isDark ? 'rgba(168,85,247,0.1)' : 'rgba(168,85,247,0.05)' }}>
            <h2 className="font-bold mb-3 flex items-center gap-2 text-purple-500"><Gift size={18}/> Ежедневный Бонус Cores+</h2>
            <div className="flex gap-2">
                {isCreator && <button disabled={!canClaimDaily} onClick={() => claimDailyBonus('omin')} className="flex-1 py-3 bg-purple-500/20 text-purple-500 rounded-xl font-bold text-xs disabled:opacity-50 transition-colors">10 Ominicoins ©</button>}
                <button disabled={!canClaimDaily} onClick={() => claimDailyBonus('crystals')} className="flex-1 py-3 bg-blue-500/20 text-blue-500 rounded-xl font-bold text-xs disabled:opacity-50 transition-colors">5,000 Кристаллов 💎</button>
            </div>
            {!canClaimDaily && <p className="text-[10px] text-center mt-2" style={{ color: c.muted }}>Бонус уже получен сегодня.</p>}
          </div>
      )}

      {isCreator && (
          <div className="mt-2 p-4 rounded-2xl" style={glass(isDark, 0.05)}>
            <h2 className="font-bold mb-3 flex items-center gap-2 text-green-500"><PlusCircle size={18}/> Создать Кибик {createdKibiksCount < 20 ? `(${createdKibiksCount}/20)` : (activeSubName ? `(${createdThisMonth}/${monthlyLimit} в мес.)` : "(Нужна подписка)")}</h2>
            {canCreate ? (
              <div className="flex flex-col gap-3">
                <input type="text" value={newCode} onChange={(e) => setNewCode(e.target.value.toUpperCase())} placeholder="Код (например: MYKIBIK)" className="w-full rounded-xl px-4 py-3 outline-none text-sm" style={{ background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)', color: c.primary, border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }} />
                <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Название кибика" className="w-full rounded-xl px-4 py-3 outline-none text-sm" style={{ background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)', color: c.primary, border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }} />
                <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                        <input type="text" value={newEmoji} onChange={(e) => setNewEmoji(e.target.value)} className="w-full rounded-xl px-4 py-3 pr-10 outline-none text-sm" style={{ background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)', color: c.primary, border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }} />
                        <button onClick={() => fileInputRef.current?.click()} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-neutral-500 hover:text-current" style={glass(isDark, 0.1)}><ImagePlus size={16} /></button>
                        <input type="file" ref={fileInputRef} onChange={handleKibikUpload} accept="image/*" className="hidden" />
                    </div>
                    <select value={newRarity} onChange={(e) => setNewRarity(e.target.value as any)} className="w-full rounded-xl px-4 py-3 outline-none text-sm appearance-none" style={{ background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)', color: c.primary, border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
                        <option value="common">Обычный</option>
                        <option value="rare">Редкий</option>
                        <option value="epic">Эпический</option>
                        <option value="legendary">Легендарный</option>
                    </select>
                </div>
                <button onClick={handleSubmitKibik} className="w-full bg-green-500/20 text-green-500 border border-green-500/30 hover:bg-green-500/30 rounded-xl py-3 font-bold flex items-center justify-center gap-2 mt-1 transition-colors">
                    <Package size={16} /> ОТПРАВИТЬ НА ПРОВЕРКУ
                </button>
                {submitStatus === "success" && <p className="text-green-500 text-center text-xs">Кибик отправлен на модерацию!</p>}
                {submitStatus === "error" && <p className="text-red-500 text-center text-xs">Заполните код и название!</p>}
                <p className="text-[10px] mt-1 text-center" style={{ color: c.muted }}>Ваш кибик появится в игре после проверки администратором.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-4 text-center">
                  <Lock size={32} style={{ color: c.muted }} className="mb-2" />
                  <p className="text-sm font-bold" style={{ color: c.primary }}>Лимит исчерпан</p>
                  <p className="text-xs mt-1" style={{ color: c.muted }}>{activeSubName ? `Ваш лимит: ${monthlyLimit} в месяц.` : "Доступно 20 бесплатных кибиков."}</p>
              </div>
            )}
          </div>)}
      )}

      {/* Trades Section */}
      {(pendingIncoming.length > 0 || pendingOutgoing.length > 0) && (
        <div className="flex flex-col gap-3 mt-2 mb-2">
          {pendingIncoming.map(trade => {
            const sender = users.find(u => u.id === trade.sender_id);
            return (
              <div key={trade.id} className="p-4 rounded-2xl flex flex-col gap-3 border border-blue-500/30" style={{ background: isDark ? "rgba(59,130,246,0.1)" : "rgba(59,130,246,0.05)" }}>
                <div className="flex justify-between items-center text-sm">
                  <span style={{ color: c.primary }} className="font-medium">Входящий трейд от {sender?.name || "Неизвестного"}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-xl" style={glass(isDark, 0.05)}>
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-2xl mb-1">{trade.offer_item.emoji}</span>
                    <span className="text-[10px] text-center w-full truncate" style={{ color: c.primary }}>{trade.offer_item.name}</span>
                    <span className="text-[9px]" style={{ color: c.muted }}>Предлагает</span>
                  </div>
                  <ArrowRightLeft size={16} style={{ color: c.muted }} className="shrink-0 mx-2" />
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-2xl mb-1">{trade.request_item.emoji}</span>
                    <span className="text-[10px] text-center w-full truncate" style={{ color: c.primary }}>{trade.request_item.name}</span>
                    <span className="text-[9px]" style={{ color: c.muted }}>Просит твой</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => acceptTrade(trade.id)} className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-semibold transition-colors">Принять</button>
                  <button onClick={() => declineTrade(trade.id)} className="flex-1 py-2.5 bg-red-500/20 text-red-400 rounded-xl text-xs font-semibold hover:bg-red-500/30 transition-colors">Отклонить</button>
                </div>
              </div>
            )
          })}
          {pendingOutgoing.map(trade => {
            const receiver = users.find(u => u.id === trade.receiver_id);
            return (
              <div key={trade.id} className="p-4 rounded-2xl flex flex-col gap-3 border border-transparent" style={glass(isDark, 0.05)}>
                <div className="flex justify-between items-center text-sm">
                  <span style={{ color: c.muted }}>Трейд для {receiver?.name || "Неизвестного"}</span>
                  <span className="text-[10px] text-yellow-400">Ожидает</span>
                </div>
                <button onClick={() => declineTrade(trade.id)} className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-semibold transition-colors">Отменить предложение</button>
              </div>
            )
          })}
        </div>
      )}

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
                  <RoleBadge role={user.role} userId={user.id} />
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
              className="fixed bottom-20 left-4 right-4 z-50 rounded-3xl p-6 overflow-y-auto max-h-[75vh] scrollbar-none"
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
                    <RoleBadge role={selectedUser.role} userId={selectedUser.id} />
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
                
                {/* User trade button */}
                {selectedUser.id !== myId && (
                  <button
                    onClick={() => { setTradeOffer(null); setTradeRequest(null); setShowTradeModal(true); }}
                    className="w-full mt-3 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                    style={{ background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa" }}
                  >
                    <ArrowRightLeft size={16} /> Предложить обмен кибиками
                  </button>
                )}

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
                    
                    {selectedUser.bannedUntil && selectedUser.bannedUntil > new Date() && (
                      <button
                        onClick={() => {
                          unbanUser(selectedUser.id);
                          setSelectedUser({ ...selectedUser, bannedUntil: null as any, banReason: undefined });
                        }}
                        className="w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 mt-2"
                        style={{ background: "rgba(74, 222, 128, 0.15)", color: "#4ade80" }}
                      >
                        <ShieldAlert size={16} /> Снять бан
                      </button>
                    )}
                  </div>
                )}
                
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Trade Creation Modal Overlay */}
      <AnimatePresence>
        {showTradeModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 z-[70] flex flex-col p-4"
            style={{ background: isDark ? "#080810" : "#ededf5" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold" style={{ color: c.primary }}>Трейд с {selectedUser.name}</h2>
              <button onClick={() => setShowTradeModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center" style={glass(isDark, 0.1)}>
                <X size={16} style={{ color: c.muted }} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col gap-6" style={{ paddingBottom: 80 }}>
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-medium px-1" style={{ color: c.primary }}>Что ты отдаешь:</h3>
                <div className="grid grid-cols-3 gap-2">
                  {inventory.map(item => (
                    <button key={item.id} onClick={() => setTradeOffer(item)} className="flex flex-col items-center p-3 rounded-xl border transition-all" style={{ ...glass(isDark, 0.05), borderColor: tradeOffer?.id === item.id ? "#3b82f6" : "transparent", background: tradeOffer?.id === item.id ? "rgba(59, 130, 246, 0.15)" : undefined }}>
                      <span className="text-3xl mb-2">{item.emoji}</span>
                      <span className="text-[10px] text-center leading-tight truncate w-full" style={{ color: c.primary }}>{item.name}</span>
                    </button>
                  ))}
                  {inventory.length === 0 && <span className="text-xs px-1" style={{ color: c.muted }}>У тебя нет кибиков</span>}
                </div>
              </div>

              <div className="flex justify-center"><div className="p-3 rounded-full" style={glass(isDark, 0.1)}><ArrowRightLeft size={20} style={{ color: c.secondary }} /></div></div>

              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-medium px-1" style={{ color: c.primary }}>Что хочешь получить:</h3>
                <div className="grid grid-cols-3 gap-2">
                  {selectedUser.inventory?.map(item => (
                    <button key={item.id} onClick={() => setTradeRequest(item)} className="flex flex-col items-center p-3 rounded-xl border transition-all" style={{ ...glass(isDark, 0.05), borderColor: tradeRequest?.id === item.id ? "#3b82f6" : "transparent", background: tradeRequest?.id === item.id ? "rgba(59, 130, 246, 0.15)" : undefined }}>
                      <span className="text-3xl mb-2">{item.emoji}</span>
                      <span className="text-[10px] text-center leading-tight truncate w-full" style={{ color: c.primary }}>{item.name}</span>
                    </button>
                  ))}
                  {(!selectedUser.inventory || selectedUser.inventory.length === 0) && <span className="text-xs px-1" style={{ color: c.muted }}>У пользователя нет кибиков</span>}
                </div>
              </div>
            </div>

            <div className="absolute bottom-4 left-4 right-4">
              <button disabled={!tradeOffer || !tradeRequest} onClick={() => { if(tradeOffer && tradeRequest) { createTrade(selectedUser.id, tradeOffer, tradeRequest); setShowTradeModal(false); setSelectedUser(null); } }} className="w-full py-4 rounded-xl font-semibold text-white disabled:opacity-50 transition-opacity flex justify-center items-center gap-2" style={{ background: "#3b82f6", boxShadow: "0 4px 20px rgba(59, 130, 246, 0.3)" }}>
                Отправить предложение
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}