import { useState, useRef } from "react";
import { useApp } from "./AppContext";
import { Send } from "lucide-react";

export function CreatorApplyPage() {
  const { tgUser, applyForCreator } = useApp();
  const [displayName, setDisplayName] = useState(tgUser?.first_name || "");
  const [tgUsername, setTgUsername] = useState(tgUser?.username || "");
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setAvatar(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!displayName || !tgUsername || !tgUser) return;
    applyForCreator({
      user_id: tgUser.id.toString(),
      display_name: displayName,
      tg_username: tgUsername,
      avatar_url: avatar,
    });
  };

  return (
    <div className="min-h-screen text-white p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center scale-110" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2071&auto=format&fit=crop)', filter: 'blur(4px)' }} />
      <div className="absolute inset-0 bg-slate-900/70" />
      <div className="relative z-10 flex flex-col items-center">
        <h1 className="text-5xl font-black tracking-tighter mb-2 drop-shadow-lg">СТАТЬ КРЕАТОРОМ</h1>
        <p className="text-neutral-300 mb-8">Подайте заявку, чтобы получить доступ к созданию кибиков</p>

        <div className="w-full max-w-sm bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div onClick={() => fileInputRef.current?.click()} className="w-20 h-20 rounded-full bg-black/30 border-2 border-white/20 flex items-center justify-center text-3xl cursor-pointer overflow-hidden">
                {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : "👤"}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
            </div>
            <div className="flex-1 text-left">
              <label className="text-xs text-neutral-300 mb-1 block">Никнейм</label>
              <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Ваше имя" className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 outline-none focus:border-purple-400 transition-colors" />
            </div>
          </div>
          
          <div>
            <label className="text-xs text-neutral-300 mb-1 block text-left">Telegram юзернейм</label>
            <input type="text" value={tgUsername} onChange={e => setTgUsername(e.target.value)} placeholder="@username" className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 outline-none focus:border-purple-400 transition-colors" />
          </div>

          <button 
            onClick={handleSubmit}
            disabled={!displayName || !tgUsername}
            className="w-full mt-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl py-4 font-bold tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:bg-neutral-500"
          >
            <Send size={18} /> ОТПРАВИТЬ ЗАЯВКУ
          </button>
        </div>

        <p className="text-xs text-neutral-500 mt-8">
          После отправки ваша заявка попадет на рассмотрение.<br/>
          Ожидайте решения администрации.
        </p>
      </div>
    </div>
  );
}