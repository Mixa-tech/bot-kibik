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
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a2a] to-[#0a0a1a] text-white p-6 flex flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-black tracking-tighter mb-2">СТАТЬ КРЕАТОРОМ</h1>
      <p className="text-neutral-400 mb-8">Подайте заявку, чтобы получить доступ к созданию кибиков</p>

      <div className="w-full max-w-sm bg-[#111] border border-[#333] rounded-3xl p-6 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div onClick={() => fileInputRef.current?.click()} className="w-20 h-20 rounded-full bg-[#222] flex items-center justify-center text-3xl cursor-pointer overflow-hidden">
              {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : "👤"}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
          </div>
          <div className="flex-1 text-left">
            <label className="text-xs text-neutral-400 mb-1 block">Никнейм</label>
            <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Ваше имя" className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl px-4 py-3 outline-none focus:border-purple-500" />
          </div>
        </div>
        
        <div>
          <label className="text-xs text-neutral-400 mb-1 block text-left">Telegram юзернейм</label>
          <input type="text" value={tgUsername} onChange={e => setTgUsername(e.target.value)} placeholder="@username" className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl px-4 py-3 outline-none focus:border-purple-500" />
        </div>

        <button 
          onClick={handleSubmit}
          disabled={!displayName || !tgUsername}
          className="w-full mt-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl py-4 font-bold tracking-wider transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Send size={18} /> ОТПРАВИТЬ ЗАЯВКУ
        </button>
      </div>

      <p className="text-xs text-neutral-600 mt-8">
        После отправки ваша заявка попадет на рассмотрение.<br/>
        Ожидайте решения администрации.
      </p>
    </div>
  );
}