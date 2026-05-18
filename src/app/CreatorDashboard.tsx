import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Crown, Gem, Pencil, Shield, Star, X, PlusCircle, ImagePlus, Package, Gift, Lock, Zap } from "lucide-react";
import { TASKS_CONFIG, type CreatorProfile, useApp } from "./AppContext";

const levelConfig = {
  creator: { label: "Creator", color: "text-neutral-400", icon: <Star size={14} /> },
  verified: { label: "Verified Creator", color: "text-blue-400", icon: <Check size={14} /> },
  super: { label: "Super Creator", color: "text-yellow-400", icon: <Crown size={14} /> },
  mythic: { label: "Mythic Creator", color: "text-purple-400", icon: <Zap size={14} /> },
  legendary: { label: "Legendary Creator", color: "text-orange-500", icon: <Gem size={14} /> },
};

export function CreatorDashboard() {
  const { creatorProfile, users, tgUser, editMyCreatorProfile, submitKibikForReview, claimDailyBonus } = useApp();
  const currentUser = users.find(u => u.id === tgUser?.id.toString());

  if (!creatorProfile) return null;

  const level = levelConfig[creatorProfile.creator_level];
  const activeSubName = creatorProfile.active_subscription;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState(creatorProfile.display_name);
  const [editAvatar, setEditAvatar] = useState<string | null>(creatorProfile.avatar_url);

  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newRarity, setNewRarity] = useState<"common" | "rare" | "epic" | "legendary">("common");
  const [newEmoji, setNewEmoji] = useState("📦");
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const tasks = Object.entries(TASKS_CONFIG).map(([key, config]) => ({
    ...config, key, progress: creatorProfile.task_progress?.[key] || 0,
  }));

  // Ограничения Cores+
  const lastCreation = creatorProfile.last_kibik_creation_date ? new Date(creatorProfile.last_kibik_creation_date).getTime() : 0;
  const canCreate = activeSubName === 'Cores +' && (Date.now() - lastCreation > 30 * 24 * 60 * 60 * 1000);
  
  const lastDaily = creatorProfile.last_daily_bonus ? new Date(creatorProfile.last_daily_bonus).getTime() : 0;
  const canClaimDaily = activeSubName === 'Cores +' && (Date.now() - lastDaily > 24 * 60 * 60 * 1000);

  // Если пользователь "недоверенный"
  if (creatorProfile.status === 'untrusted') {
    return (
      <div className="min-h-screen bg-[#111] text-white p-4">
        <div className="p-6 rounded-2xl bg-neutral-800 border border-neutral-700 text-center">
          <Shield size={40} className="mx-auto text-neutral-500 mb-4" />
          <h2 className="font-bold text-lg text-neutral-300">Доступ ограничен</h2>
          <p className="text-xs text-neutral-400 mt-1">Ваш аккаунт имеет статус "недоверенный". Некоторые функции отключены.</p>
        </div>
      </div>
    );
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setEditAvatar(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSave = () => {
    if (!editDisplayName) return;
    editMyCreatorProfile({
        display_name: editDisplayName,
        avatar_url: editAvatar,
    });
    setIsEditing(false);
  };

  const handleKibikUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_SIZE = 256;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
          } else {
            if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
          }
          canvas.width = width;
          canvas.height = height;
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
    submitKibikForReview({ code, name, rarity: newRarity, emoji: newEmoji, creator_id: creatorProfile.user_id });
    setSubmitStatus("success"); setNewCode(""); setNewName(""); setNewEmoji("📦"); setTimeout(() => setSubmitStatus("idle"), 3000);
  };

  return (
    <div className="min-h-screen text-white p-4 relative">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2071&auto=format&fit=crop)' }} />
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <div className="relative z-10 flex flex-col gap-4">
      {/* Профиль */}
      <div className={`flex items-center gap-4 p-4 rounded-2xl bg-black/30 backdrop-blur-lg border transition-colors relative ${activeSubName === 'Cores Gold' ? 'border-yellow-400/50 bg-yellow-900/20' : 'border-white/10'}`}>
        <div className="relative">
            <div className={`w-16 h-16 rounded-full object-cover bg-neutral-700 overflow-hidden ${activeSubName === 'Cores +' ? 'p-0.5' : ''}`}>
                {activeSubName === 'Cores +' && (
                    <div className="absolute inset-0 z-0 w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 animate-spin" style={{ animationDuration: '3s' }}/>
                )}
                <img src={creatorProfile.avatar_url || ''} className="relative z-10 w-full h-full rounded-full object-cover bg-neutral-800" />
            </div>
        </div>
        <div>
          <h1 className="font-bold text-lg flex items-center gap-2">
            {creatorProfile.display_name}
            {activeSubName === 'Cores Basic' && <div className="w-2.5 h-2.5 rounded-full bg-neutral-400" title="Cores Basic"/>}
          </h1>
          <div className={`flex items-center gap-1.5 text-xs font-bold ${level.color}`}>
            {level.icon} {level.label}
          </div>
        </div>
        <button onClick={() => setIsEditing(true)} className="absolute top-3 right-3 p-2 bg-white/10 rounded-full hover:bg-white/20">
            <Pencil size={14} />
        </button>
        <div className="ml-auto text-right">
            <div className="font-bold text-xl text-purple-400 flex items-center gap-2 justify-end">
                {creatorProfile.ominicoins} <span className="text-purple-400 text-2xl">©</span>
            </div>
            <div className="text-xs text-neutral-500">Ominicoins</div>
        </div>
      </div>

      {/* Ежедневный Бонус (Только Cores +) */}
      {activeSubName === 'Cores +' && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/30 to-pink-900/30 backdrop-blur-lg border border-purple-500/30">
            <h2 className="font-bold mb-3 flex items-center gap-2 text-purple-400"><Gift size={18}/> Ежедневный Бонус Cores+</h2>
            <div className="flex gap-2">
                <button disabled={!canClaimDaily} onClick={() => claimDailyBonus('omin')} className="flex-1 py-3 bg-purple-500/20 text-purple-300 rounded-xl font-bold text-xs disabled:opacity-50 transition-colors">10 Ominicoins ©</button>
                <button disabled={!canClaimDaily} onClick={() => claimDailyBonus('crystals')} className="flex-1 py-3 bg-blue-500/20 text-blue-300 rounded-xl font-bold text-xs disabled:opacity-50 transition-colors">5,000 Кристаллов 💎</button>
            </div>
            {!canClaimDaily && <p className="text-[10px] text-center mt-2 text-neutral-400">Бонус уже получен сегодня.</p>}
        </div>
      )}

      {/* Создание Кибика */}
      <div className="p-4 rounded-2xl bg-black/30 backdrop-blur-lg border border-white/10">
        <h2 className="font-bold mb-3 flex items-center gap-2 text-green-400"><PlusCircle size={18}/> Создать Кибик</h2>
        {canCreate ? (
        <>
        <div className="flex flex-col gap-3">
            <input type="text" value={newCode} onChange={(e) => setNewCode(e.target.value.toUpperCase())} placeholder="Код (например: MYKIBIK)" className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-green-400 text-sm" />
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Название кибика" className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-green-400 text-sm" />
            
            <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                    <input type="text" value={newEmoji} onChange={(e) => setNewEmoji(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 pr-10 outline-none focus:border-green-400 text-sm" />
                    <button onClick={() => fileInputRef.current?.click()} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-neutral-400 hover:text-white bg-white/10"><ImagePlus size={16} /></button>
                    <input type="file" ref={fileInputRef} onChange={handleKibikUpload} accept="image/*" className="hidden" />
                </div>
                <select value={newRarity} onChange={(e) => setNewRarity(e.target.value as any)} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-green-400 text-sm appearance-none text-white">
                    <option value="common" className="bg-neutral-900">Обычный</option>
                    <option value="rare" className="bg-neutral-900">Редкий</option>
                    <option value="epic" className="bg-neutral-900">Эпический</option>
                    <option value="legendary" className="bg-neutral-900">Легендарный</option>
                </select>
            </div>
            
            <button onClick={handleSubmitKibik} className="w-full bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 rounded-xl py-3 font-bold flex items-center justify-center gap-2 mt-1 transition-colors">
                <Package size={16} /> ОТПРАВИТЬ НА ПРОВЕРКУ
            </button>
            {submitStatus === "success" && <p className="text-green-400 text-center text-xs">Кибик отправлен на модерацию!</p>}
            {submitStatus === "error" && <p className="text-red-400 text-center text-xs">Заполните код и название!</p>}
        </div>
        <p className="text-[10px] text-neutral-400 mt-3 text-center">Ваш кибик появится в игре после проверки администратором.</p>
        </>
        ) : (
            <div className="flex flex-col items-center justify-center p-4 text-center">
                <Lock size={32} className="text-neutral-500 mb-2" />
                <p className="text-sm font-bold text-neutral-300">Доступно только для Cores+</p>
                <p className="text-xs text-neutral-500 mt-1">Или вы уже создавали кибик в этом месяце.</p>
            </div>
        )}
      </div>

      {/* Задания */}
      <div className="p-4 rounded-2xl bg-black/30 backdrop-blur-lg border border-white/10">
        <h2 className="font-bold mb-3">Задания</h2>
        <div className="flex flex-col gap-3">
            {tasks.map(task => {
                const isCompleted = task.progress >= task.goal;
                return (
                <div key={task.name}>
                    <div className="flex justify-between items-center text-sm mb-1">
                        <span className="text-neutral-300">{task.name}</span>
                        <span className="text-purple-400 font-mono">+{task.reward} ©</span>
                    </div>
                    <div className="w-full bg-black/30 rounded-full h-2.5">
                        <div className={`${isCompleted ? 'bg-green-500' : 'bg-purple-500'} h-2.5 rounded-full transition-all`} style={{ width: `${Math.min(100, (task.progress / task.goal) * 100)}%` }}></div>
                    </div>
                </div>
                )
            })}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#111] border border-[#222] rounded-3xl p-6 w-full max-w-sm flex flex-col shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Редактировать профиль</h2>
            
            <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                    <div onClick={() => fileInputRef.current?.click()} className="w-20 h-20 rounded-full bg-[#222] flex items-center justify-center text-3xl cursor-pointer overflow-hidden">
                    {editAvatar ? <img src={editAvatar} className="w-full h-full object-cover" /> : "👤"}
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
                </div>
                <div className="flex-1 text-left">
                    <label className="text-xs text-neutral-400 mb-1 block">Никнейм</label>
                    <input type="text" value={editDisplayName} onChange={e => setEditDisplayName(e.target.value)} placeholder="Ваше имя" className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl px-4 py-3 outline-none focus:border-purple-500" />
                </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button onClick={() => setIsEditing(false)} className="flex-1 py-3 rounded-xl bg-[#222] text-white hover:bg-[#333] transition-colors font-semibold">Отмена</button>
              <button 
                onClick={handleProfileSave}
                disabled={!editDisplayName}
                className="flex-1 py-3 rounded-xl bg-purple-600/80 text-white hover:bg-purple-600 transition-colors font-semibold disabled:opacity-50"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}