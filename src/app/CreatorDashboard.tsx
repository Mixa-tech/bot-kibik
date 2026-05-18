import { Check, Crown, Gem, Shield, Star, X } from "lucide-react";
import { useApp } from "../../AppContext";

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

const tasks = [
    { name: "Выложить 5 кибиков", reward: 20, progress: 3, goal: 5 },
    { name: "Получить 10 лайков", reward: 50, progress: 8, goal: 10 },
    { name: "Продать кибик на бирже", reward: 100, progress: 0, goal: 1 },
];

export function CreatorDashboard() {
  const { creatorProfile, users, tgUser } = useApp();
  const currentUser = users.find(u => u.id === tgUser?.id.toString());

  if (!creatorProfile) return null;

  const level = levelConfig[creatorProfile.creator_level];

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a2a] to-[#0a0a1a] text-white p-4 flex flex-col gap-4">
      {/* Профиль */}
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/20 border border-white/10">
        <img src={creatorProfile.avatar_url || ''} className="w-16 h-16 rounded-full object-cover bg-neutral-700" />
        <div>
          <h1 className="font-bold text-lg">{creatorProfile.display_name}</h1>
          <div className={`flex items-center gap-1.5 text-xs font-bold ${level.color}`}>
            {level.icon} {level.label}
          </div>
        </div>
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
            {tasks.map(task => (
                <div key={task.name}>
                    <div className="flex justify-between items-center text-sm mb-1">
                        <span className="text-neutral-300">{task.name}</span>
                        <span className="text-purple-400 font-mono">+{task.reward} ©</span>
                    </div>
                    <div className="w-full bg-black/30 rounded-full h-2.5">
                        <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: `${(task.progress / task.goal) * 100}%` }}></div>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Подписки */}
      <div className="p-4 rounded-2xl bg-black/20 border border-white/10">
        <h2 className="font-bold mb-3">Подписки Cores</h2>
        <div className="grid grid-cols-3 gap-3">
            {subs.map(sub => (
                <div key={sub.name} className="p-3 rounded-xl bg-black/30 text-center flex flex-col">
                    <div className={`w-8 h-8 rounded-full mx-auto mb-2 ${sub.color}`} />
                    <div className="text-xs font-bold">{sub.name}</div>
                    <div className="text-[10px] text-neutral-400 mb-2">{sub.desc}</div>
                    <button 
                        onClick={() => alert('Покупка и сброс сохранений будут реализованы в следующем шаге!')}
                        className="mt-auto w-full text-center py-1.5 rounded-lg bg-purple-600/50 text-purple-300 text-[10px] font-bold hover:bg-purple-600/70"
                    >
                        {sub.omin} ©
                    </button>
                </div>
            ))}
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
    </div>
  );
}