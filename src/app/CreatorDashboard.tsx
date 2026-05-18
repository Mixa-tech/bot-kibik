import { useState, useRef } from "react";
import { Check, Crown, Gem, Pencil, Shield, Star, X } from "lucide-react";
import { TASKS_CONFIG, type CreatorProfile, useApp } from "./AppContext";

const levelConfig = {
  creator: { label: "Creator", color: "text-neutral-400", icon: <Star size={14} /> },
  verified: { label: "Verified Creator", color: "text-blue-400", icon: <Check size={14} /> },
  super: { label: "Super Creator", color: "text-yellow-400", icon: <Crown size={14} /> },
};

const subs = [
    { name: "Cores Basic", price: 1000, omin: 100, color: "bg-neutral-700", desc: "Значок в профиле" },
    { name: "Cores Gold", price: 5000, omin: 500, color: "bg-yellow-500", desc: "Золотой профиль" },
    { name: "Cores +", price: 10000, omin: 1000, color: "bg-gradient-to-r from-purple-500 to-pink-500", desc: "Особые функции" },
];

export function CreatorDashboard() {
  const { creatorProfile, users, tgUser, purchaseSubscription, editMyCreatorProfile } = useApp();
  const currentUser = users.find(u => u.id === tgUser?.id.toString());

  if (!creatorProfile) return null;

  const level = levelConfig[creatorProfile.creator_level];
  const activeSubName = creatorProfile.active_subscription;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState(creatorProfile.display_name);
  const [editAvatar, setEditAvatar] = useState<string | null>(creatorProfile.avatar_url);

  const tasks = Object.entries(TASKS_CONFIG).map(([key, config]) => ({
    ...config, key, progress: creatorProfile.task_progress?.[key] || 0,
  }));

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a2a] to-[#0a0a1a] text-white p-4 flex flex-col gap-4">
      {/* Профиль */}
      <div className={`flex items-center gap-4 p-4 rounded-2xl bg-black/20 border transition-colors relative ${activeSubName === 'Cores Gold' ? 'border-yellow-400/50 bg-yellow-900/20' : 'border-white/10'}`}>
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

      {/* Задания */}
      <div className="p-4 rounded-2xl bg-black/20 border border-white/10">
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

      {/* Подписки */}
      <div className="p-4 rounded-2xl bg-black/20 border border-white/10">
        <h2 className="font-bold mb-3">Подписки Cores</h2>
        <div className="grid grid-cols-3 gap-3">
            {subs.map(sub => {
                const isActive = activeSubName === sub.name;
                return (
                <div key={sub.name} className={`p-3 rounded-xl bg-black/30 text-center flex flex-col border ${isActive ? 'border-purple-500' : 'border-transparent'}`}>
                    <div className={`w-8 h-8 rounded-full mx-auto mb-2 ${sub.color}`} />
                    <div className="text-xs font-bold">{sub.name}</div>
                    <div className="text-[10px] text-neutral-400 mb-2">{sub.desc}</div>
                    {isActive ? (
                        <div className="mt-auto w-full text-center py-1.5 rounded-lg bg-green-500/20 text-green-400 text-[10px] font-bold">Активна</div>
                    ) : (
                        <button 
                            onClick={() => purchaseSubscription(sub)}
                            disabled={creatorProfile.ominicoins < sub.omin}
                            className="mt-auto w-full text-center py-1.5 rounded-lg bg-purple-600/50 text-purple-300 text-[10px] font-bold hover:bg-purple-600/70 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {sub.omin} ©
                        </button>
                    )}
                </div>
            )})}
        </div>
      </div>

      {/* Сброс при покупке на бирже */}
       <div className="p-4 rounded-2xl bg-black/20 border border-white/10">
        <h2 className="font-bold mb-2 text-yellow-400">Предупреждение</h2>
        <p className="text-xs text-neutral-400">
            При покупке подписки или предмета на бирже все ваши сохранения в кликере (кристаллы и сила клика) будут **сброшены**. 
            Это обязательное условие для поддержания баланса экономики.
        </p>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
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
  );
}