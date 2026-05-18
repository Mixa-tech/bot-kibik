import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Wallet, Crown, Lock } from "lucide-react";
import { useTheme, glass, tc } from "./ThemeContext";
import { useApp } from "../AppContext";

const subs = [
    { name: "Cores Basic", passcoin: 10, omin: 100, color: "bg-neutral-700", desc: "Значок + x1.5 клик" },
    { name: "Cores Gold", passcoin: 50, omin: 500, color: "bg-yellow-500", desc: "Золото + x2.5 клик" },
    { name: "Cores +", passcoin: 100, omin: 1000, color: "bg-gradient-to-r from-purple-500 to-pink-500", desc: "Анимация + x5 клик" },
];

export function ShopPage() {
  const { isDark } = useTheme();
  const c = tc(isDark);
  const { convertPasscoins, purchaseSubscription, creatorProfile, tgUser, users } = useApp();
  const currentUser = users.find(u => u.id === tgUser?.id?.toString());
  const [subAnimation, setSubAnimation] = useState<string | null>(null);

  const activeSubName = creatorProfile?.active_subscription;
  const isCreator = creatorProfile && creatorProfile.status === 'approved';

  const handleBuy = async (sub: any, method: 'omin' | 'passcoin') => {
    const ok = await purchaseSubscription(sub, method);
    if (ok) {
      setSubAnimation(sub.name);
      setTimeout(() => setSubAnimation(null), 4000);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 pb-6">
      {/* Header */}
      <div className="pt-2">
        <h1 style={{ color: c.primary }} className="text-xl tracking-tight font-bold">Магазин</h1>
        <p className="text-xs mt-0.5" style={{ color: c.muted }}>Обмен валют и подписки</p>
      </div>

      {/* Обменник */}
      <div className="p-5 rounded-2xl flex flex-col gap-3" style={glass(isDark, 0.05)}>
        <div className="flex justify-between items-center text-sm mb-1">
            <span className="font-bold flex items-center gap-2" style={{ color: c.primary }}><Wallet size={18} className="text-yellow-500"/> Обменник</span>
            <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full border border-blue-500/20 font-bold tracking-wide">Курс: 100k 💎 = 10 PC</span>
        </div>
        <div className="flex items-center justify-between mt-2 mb-2">
            <div className="text-sm" style={{ color: c.muted }}>Ваш баланс:</div>
            <div className="flex gap-3">
                <span className="text-sm font-bold text-blue-400">{currentUser?.crystals?.toLocaleString() || 0} 💎</span>
                <span className="text-sm font-bold text-yellow-500">{currentUser?.passcoins || 0} PC</span>
            </div>
        </div>
        <button 
            onClick={convertPasscoins}
            className="w-full py-3.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 border border-yellow-500/30 rounded-xl text-sm font-bold transition-colors"
        >
            Купить 10 Passcoins
        </button>
      </div>

      {/* Подписки Cores */}
      <div className="p-5 rounded-2xl flex flex-col gap-3" style={glass(isDark, 0.05)}>
        <div className="flex justify-between items-center mb-2">
            <h2 className="font-bold flex items-center gap-2" style={{ color: c.primary }}><Crown size={18} className="text-purple-500"/> Подписки Cores</h2>
        </div>
        
        {!isCreator && (
            <div className="p-3 mb-2 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-start gap-3">
                <Lock size={16} className="text-orange-500 shrink-0 mt-0.5" />
                <p className="text-xs text-orange-400/90 leading-relaxed">Для покупки и использования подписок необходимо иметь одобренный статус <strong>Креатора</strong>.</p>
            </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {subs.map(sub => {
                const isActive = activeSubName === sub.name;
                return (
                <div key={sub.name} className={`p-4 rounded-xl flex flex-col items-center border transition-colors ${isActive ? 'border-purple-500 bg-purple-500/10' : 'border-transparent bg-black/20'}`} style={!isActive ? glass(isDark, 0.03) : undefined}>
                    <div className={`w-10 h-10 rounded-full mb-3 ${sub.color}`} />
                    <div className="text-sm font-bold mb-1" style={{ color: c.primary }}>{sub.name}</div>
                    <div className="text-xs text-center mb-4 min-h-[32px]" style={{ color: c.muted }}>{sub.desc}</div>
                    
                    {isActive ? (
                        <div className="mt-auto w-full text-center py-2 rounded-xl bg-green-500/20 text-green-400 text-xs font-bold">Активна</div>
                    ) : (
                        <div className="mt-auto flex flex-col gap-2 w-full">
                            <button 
                                onClick={() => handleBuy(sub, 'omin')} 
                                disabled={!isCreator || sub.omin > (creatorProfile?.ominicoins || 0)} 
                                className="w-full text-center py-2 rounded-xl bg-purple-600/50 text-purple-300 text-xs font-bold hover:bg-purple-600/70 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                {sub.omin} ©
                            </button>
                            <button 
                                onClick={() => handleBuy(sub, 'passcoin')} 
                                disabled={!isCreator || sub.passcoin > (currentUser?.passcoins || 0)} 
                                className="w-full text-center py-2 rounded-xl bg-yellow-600/50 text-yellow-400 text-xs font-bold hover:bg-yellow-600/70 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                {sub.passcoin} PC
                            </button>
                        </div>
                    )}
                </div>
            )})}
        </div>
      </div>

      {/* Анимация при покупке подписки */}
      <AnimatePresence>
        {subAnimation && (
          <motion.div
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center backdrop-blur-2xl"
            style={{ background: subAnimation === 'Cores Gold' ? 'radial-gradient(circle, rgba(234,179,8,0.2) 0%, rgba(0,0,0,0.9) 100%)' : subAnimation === 'Cores +' ? 'radial-gradient(circle, rgba(168,85,247,0.2) 0%, rgba(0,0,0,0.9) 100%)' : 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.9) 100%)' }}
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 50 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              transition={{ type: "spring", damping: 12, stiffness: 100 }}
              className="flex flex-col items-center text-center"
            >
               <div className={`w-32 h-32 rounded-full mb-6 flex items-center justify-center shadow-[0_0_80px_rgba(255,255,255,0.2)] ${subAnimation === 'Cores Gold' ? 'bg-yellow-500 shadow-yellow-500/50' : subAnimation === 'Cores +' ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-purple-500/50' : 'bg-neutral-600'}`}>
                  <Crown size={60} className="text-white drop-shadow-md" />
               </div>
               <h1 className="text-4xl font-black text-white tracking-widest drop-shadow-lg mb-2">ПОЗДРАВЛЯЕМ!</h1>
               <p className="text-xl text-neutral-300">Активирована подписка</p>
               <div className={`text-3xl font-black mt-2 bg-clip-text text-transparent ${subAnimation === 'Cores Gold' ? 'bg-gradient-to-r from-yellow-300 to-yellow-600' : subAnimation === 'Cores +' ? 'bg-gradient-to-r from-purple-400 to-pink-500' : 'bg-gradient-to-r from-neutral-300 to-neutral-500'}`}>
                 {subAnimation}
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}