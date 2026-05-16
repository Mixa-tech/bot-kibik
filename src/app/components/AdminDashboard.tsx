import { useState, useRef } from "react";
import { ShieldAlert, PlusCircle, Users, Package, Trash2, ImagePlus, LogOut, CheckCircle, X } from "lucide-react";
import { useApp } from "../AppContext";

export function AdminDashboard() {
  const { users, globalKibiks, addGlobalKibik, removeGlobalKibik, banUser, unbanUser, removeKibikFromUser } = useApp();
  const [pin, setPin] = useState("");
  const [auth, setAuth] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const ADMIN_PIN = "7777"; // СЕКРЕТНЫЙ ПИНКОД (Можешь поменять на любой свой)

  // Admin form state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newRarity, setNewRarity] = useState<"common" | "rare" | "epic" | "legendary">("common");
  const [newEmoji, setNewEmoji] = useState("📦");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleAdd = () => {
    const code = newCode.trim().toUpperCase();
    const name = newName.trim();
    if (!code || !name) {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2500);
      return;
    }
    addGlobalKibik(code, {
      code,
      name,
      rarity: newRarity,
      emoji: newEmoji,
    });
    setStatus("success");
    setNewCode("");
    setNewName("");
    setNewEmoji("📦");
    setTimeout(() => setStatus("idle"), 2000);
  };

  if (!auth) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4 text-white font-sans">
        <div className="bg-[#111] border border-[#222] rounded-3xl p-10 flex flex-col items-center max-w-md w-full shadow-2xl">
          <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 border border-blue-500/20">
            <ShieldAlert size={40} className="text-blue-500" />
          </div>
          <h1 className="text-2xl font-black mb-2 tracking-wide">АДМИН ПАНЕЛЬ</h1>
          <p className="text-sm text-neutral-400 mb-8 text-center">Введите секретный PIN-код для доступа к управлению</p>
          
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && pin === ADMIN_PIN) setAuth(true); }}
            className="bg-[#0a0a0a] border border-[#333] rounded-xl px-4 py-4 text-center tracking-[1em] text-2xl outline-none focus:border-blue-500 w-full mb-4 font-mono transition-colors"
            placeholder="••••"
            maxLength={4}
          />
          
          <button
            onClick={() => { if (pin === ADMIN_PIN) setAuth(true); else { setPin(""); alert("Неверный пинкод!"); } }}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-4 font-bold tracking-wider transition-colors"
          >
            ВОЙТИ В СИСТЕМУ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-[#111] border border-[#222] p-5 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="bg-blue-500/20 p-3 rounded-xl border border-blue-500/30">
              <ShieldAlert className="text-blue-500" size={28}/>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-wider">KIBIK DASHBOARD</h1>
              <p className="text-sm text-neutral-400">Панель управления администратора</p>
            </div>
          </div>
          <button onClick={() => {setAuth(false); setPin("");}} className="flex items-center gap-2 text-neutral-400 hover:text-white bg-[#1a1a1a] px-4 py-2 rounded-lg transition-colors border border-[#333]">
            <LogOut size={16} /> Выйти
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Колонна 1: Создание */}
          <div className="bg-[#111] border border-[#222] rounded-3xl p-6 flex flex-col gap-5">
            <h2 className="text-lg font-bold flex items-center gap-2 text-green-400"><PlusCircle size={20}/> Создать Кибик</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-neutral-400 mb-1 block uppercase tracking-wider">Код кибика</label>
                <input type="text" value={newCode} onChange={(e) => setNewCode(e.target.value.toUpperCase())} placeholder="Например: MEGA2026" className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl px-4 py-3 outline-none focus:border-green-500 transition-colors" />
              </div>
              <div>
                <label className="text-xs text-neutral-400 mb-1 block uppercase tracking-wider">Название</label>
                <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Золотой куб" className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl px-4 py-3 outline-none focus:border-green-500 transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-400 mb-1 block uppercase tracking-wider">Картинка</label>
                  <div className="relative">
                    <input type="text" value={newEmoji} onChange={(e) => setNewEmoji(e.target.value)} className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl px-4 py-3 pr-10 outline-none focus:border-green-500 transition-colors" />
                    <button onClick={() => fileInputRef.current?.click()} className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white bg-[#222] p-1.5 rounded-lg"><ImagePlus size={16} /></button>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-neutral-400 mb-1 block uppercase tracking-wider">Редкость</label>
                  <select value={newRarity} onChange={(e) => setNewRarity(e.target.value as any)} className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl px-4 py-3 outline-none focus:border-green-500 transition-colors appearance-none">
                    <option value="common">Обычный</option>
                    <option value="rare">Редкий</option>
                    <option value="epic">Эпический</option>
                    <option value="legendary">Легендарный</option>
                  </select>
                </div>
              </div>
            </div>
            <button onClick={handleAdd} className="mt-auto w-full bg-green-600 hover:bg-green-500 text-white rounded-xl py-4 font-bold tracking-wider transition-colors flex items-center justify-center gap-2">
              <PlusCircle size={18} /> СОЗДАТЬ
            </button>
            {status === "success" && <p className="text-green-400 text-center text-sm flex items-center justify-center gap-1"><CheckCircle size={14}/> Успешно создано!</p>}
            {status === "error" && <p className="text-red-400 text-center text-sm">Заполните все поля!</p>}
          </div>

          {/* Колонна 2: Активные коды */}
          <div className="bg-[#111] border border-[#222] rounded-3xl p-6 flex flex-col gap-4 lg:h-[600px]">
            <h2 className="text-lg font-bold flex items-center gap-2 text-purple-400"><Package size={20}/> Доступные коды ({Object.keys(globalKibiks).length})</h2>
            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-2 scrollbar-thin">
              {Object.values(globalKibiks).length === 0 && <p className="text-neutral-500 text-center mt-10">Нет активных кодов</p>}
              {Object.values(globalKibiks).reverse().map(k => (
                <div key={k.code} className="bg-[#0a0a0a] border border-[#222] rounded-xl p-3 flex justify-between items-center group hover:border-[#444] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#1a1a1a] rounded-lg flex items-center justify-center text-2xl overflow-hidden shrink-0">
                      {k.emoji.startsWith("http") || k.emoji.startsWith("data") ? <img src={k.emoji} className="w-full h-full object-cover" /> : k.emoji}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white">{k.name}</div>
                      <div className="text-xs font-mono text-purple-400 mt-1 bg-purple-500/10 px-2 py-0.5 rounded inline-block">{k.code}</div>
                    </div>
                  </div>
                  <button onClick={() => removeGlobalKibik(k.code)} className="text-neutral-600 hover:text-red-500 p-2 transition-colors" title="Удалить код">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Колонна 3: Пользователи */}
          <div className="bg-[#111] border border-[#222] rounded-3xl p-6 flex flex-col gap-4 lg:h-[600px]">
            <h2 className="text-lg font-bold flex items-center gap-2 text-blue-400"><Users size={20}/> Игроки ({users.length})</h2>
            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-2 scrollbar-thin">
              {users.map(u => {
                const isBanned = u.bannedUntil && new Date(u.bannedUntil) > new Date();
                return (
                  <div key={u.id} className="bg-[#0a0a0a] border border-[#222] rounded-xl p-3 flex justify-between items-center hover:border-[#333] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#1a1a1a] rounded-lg flex items-center justify-center font-bold text-neutral-400 shrink-0">
                        {u.avatar}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white flex items-center gap-1">
                          {u.name}
                          {u.role === "admin" && <span className="text-yellow-500 text-[10px] ml-1">👑</span>}
                        </div>
                        <div className="text-xs text-neutral-500 mt-0.5 flex gap-2">
                          <span>Ур.{u.level}</span>
                          <span>💎{u.crystals || 0}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setSelectedUser(u)} className="bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500/20 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">Инвентарь</button>
                      {isBanned ? (
                        <button onClick={() => unbanUser(u.id)} className="bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/20 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">Разбан</button>
                      ) : (
                        <button onClick={() => {
                          const d = new Date(); d.setDate(d.getDate() + 30);
                          banUser(u.id, d, "Бан администратором из панели");
                        }} className="bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">Бан</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* User Inventory Modal */}
      {selectedUser && (() => {
        const u = users.find(user => user.id === selectedUser.id) || selectedUser;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#111] border border-[#222] rounded-3xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#1a1a1a] rounded-xl flex items-center justify-center text-xl">{u.avatar}</div>
                  <div>
                    <h2 className="text-xl font-bold">Инвентарь: {u.name}</h2>
                    <p className="text-sm text-neutral-400">{u.inventory?.length || 0} кибиков</p>
                  </div>
                </div>
                <button onClick={() => setSelectedUser(null)} className="p-2 bg-[#222] hover:bg-[#333] rounded-full transition-colors"><X size={20} /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 scrollbar-thin">
                {(!u.inventory || u.inventory.length === 0) && <p className="text-neutral-500 col-span-full text-center py-10">Инвентарь пуст</p>}
                {u.inventory?.map((item: any) => (
                  <div key={item.id} className="bg-[#0a0a0a] border border-[#222] rounded-xl p-3 flex flex-col items-center gap-2 relative group hover:border-[#444] transition-colors">
                    {/^(https?|data|blob):/.test(item.emoji) ? (
                      <img src={item.emoji} alt={item.name} className="w-10 h-10 object-cover rounded-lg mb-1" />
                    ) : (
                      <div className="text-4xl mb-1">{item.emoji}</div>
                    )}
                    <div className="text-xs font-bold text-center w-full truncate">{item.name}</div>
                    <div className="text-[10px] text-neutral-500">{item.rarity}</div>
                    <button onClick={() => removeKibikFromUser(u.id, item.id)} className="absolute top-2 right-2 p-1.5 bg-red-500/10 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all" title="Удалить предмет">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}