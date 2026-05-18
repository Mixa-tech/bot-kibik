import { useState, useRef } from "react";
import { useApp } from "./AppContext";
import { Send, ImagePlus } from "lucide-react";

export function CreatorApplyPage() {
  const { tgUser, applyForCreator } = useApp();
  const [displayName, setDisplayName] = useState(tgUser?.first_name || "");
  const [tgUsername, setTgUsername] = useState(tgUser?.username || "");
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [kibikCode, setKibikCode] = useState("");
  const [kibikName, setKibikName] = useState("");
  const [kibikRarity, setKibikRarity] = useState<"common" | "rare" | "epic" | "legendary">("common");
  const [kibikEmoji, setKibikEmoji] = useState("📦");
  const kibikFileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setAvatar(event.target?.result as string);
      reader.readAsDataURL(file);
    }
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
          if (width > height) { if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } } 
          else { if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; } }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          setKibikEmoji(canvas.toDataURL("image/jpeg", 0.7));
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!displayName || !tgUsername || !tgUser || !kibikCode || !kibikName) return;
    applyForCreator({
      user_id: tgUser.id.toString(),
      display_name: displayName,
      tg_username: tgUsername,
      avatar_url: avatar,
    }, {
      code: kibikCode.trim().toUpperCase(),
      name: kibikName.trim(),
      rarity: kibikRarity,
      emoji: kibikEmoji
    });
  };

  return (
    <div className="min-h-screen text-white p-6 pb-20 flex flex-col items-center justify-center text-center relative overflow-hidden overflow-y-auto">
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
        </div>

        <div className="w-full max-w-sm mt-4 bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-neutral-300">Ваш первый кибик (для модерации)</h2>
          <input type="text" value={kibikCode} onChange={e => setKibikCode(e.target.value.toUpperCase())} placeholder="Код (например: HELLO)" className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 outline-none focus:border-purple-400 transition-colors" />
          <input type="text" value={kibikName} onChange={e => setKibikName(e.target.value)} placeholder="Название кибика" className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 outline-none focus:border-purple-400 transition-colors" />
          <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                  <input type="text" value={kibikEmoji} onChange={(e) => setKibikEmoji(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pr-10 outline-none focus:border-purple-400 text-sm" />
                  <button onClick={() => kibikFileInputRef.current?.click()} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-neutral-400 hover:text-white bg-white/10"><ImagePlus size={16} /></button>
                  <input type="file" ref={kibikFileInputRef} onChange={handleKibikUpload} accept="image/*" className="hidden" />
              </div>
              <select value={kibikRarity} onChange={(e) => setKibikRarity(e.target.value as any)} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 outline-none focus:border-purple-400 text-sm appearance-none text-white">
                  <option value="common" className="bg-neutral-900">Обычный</option>
                  <option value="rare" className="bg-neutral-900">Редкий</option>
                  <option value="epic" className="bg-neutral-900">Эпический</option>
                  <option value="legendary" className="bg-neutral-900">Легендарный</option>
              </select>
          </div>
        </div>

          <button 
            onClick={handleSubmit}
          disabled={!displayName || !tgUsername || !kibikCode || !kibikName}
          className="w-full max-w-sm mt-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl py-4 font-bold tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:bg-neutral-500"
          >
            <Send size={18} /> ОТПРАВИТЬ ЗАЯВКУ
          </button>

        <p className="text-xs text-neutral-500 mt-8">
          После отправки ваша заявка попадет на рассмотрение.<br/>
          Ожидайте решения администрации.
        </p>
      </div>
    </div>
  );
}