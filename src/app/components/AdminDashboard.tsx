import { useState, useRef } from "react";
import { ShieldAlert, PlusCircle, Users, Package, Trash2, ImagePlus, LogOut, CheckCircle, X } from "lucide-react";
import { useApp } from "../AppContext";

export function AdminDashboard() {
  const { users, globalKibiks, addGlobalKibik, removeGlobalKibik, banUser, unbanUser, removeKibikFromUser, giveCrystals, role, tgUser, transferKibik, requestLoginCode, verifyLoginCode } = useApp();
  const myId = tgUser ? tgUser.id.toString() : "12345";
  const currentUser = users.find(u => u.id === myId);

  const [selectedUser, setSelectedUser] = useState<any>(null);

  const [banModalUser, setBanModalUser] = useState<any>(null);
  const [banDays, setBanDays] = useState("30");
  const [banReason, setBanReason] = useState("");

  const [transferModalUser, setTransferModalUser] = useState<any>(null);

  const [loginUser, setLoginUser] = useState("");
  const [loginPin, setLoginPin] = useState("");
  const [loginStep, setLoginStep] = useState<1 | 2>(1);
  const [isAuth, setIsAuth] = useState(false);
  const [globalTransfer, setGlobalTransfer] = useState<{ sourceUserId: string, itemId: string, item: any } | null>(null);

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

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4 text-white font-sans text-center">
        <div className="bg-[#111] border border-[#222] rounded-3xl p-8 max-w-md w-full shadow-2xl">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-blue-500" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.21-1.12-.33-1.08-.7.02-.19.27-.39.75-.59 2.95-1.28 4.91-2.13 5.9-2.54 2.81-1.17 3.39-1.37 3.78-1.38.09 0 .28.02.38.09.08.06.13.15.15.25.01.07.02.2 0 .31z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-black mb-2 tracking-wide">АВТОРИЗАЦИЯ</h1>
          
          {loginStep === 1 ? (
            <>
              <p className="text-sm text-neutral-400 mb-6">Введите свой @username для получения кода</p>
              <input type="text" value={loginUser} onChange={e => setLoginUser(e.target.value)} placeholder="Ваш @username" className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl px-4 py-3 mb-6 outline-none focus:border-blue-500 transition-colors text-center" />
              <button onClick={async () => {
                const ok = await requestLoginCode(loginUser);
                if (ok) setLoginStep(2);
              }} className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3.5 font-bold tracking-wider transition-colors">
                ПОЛУЧИТЬ КОД В БОТЕ
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-neutral-400 mb-6">Код отправлен в приложение (<strong>откройте саму игру</strong> на телефоне)</p>
              <input type="text" value={loginPin} onChange={e => setLoginPin(e.target.value)} placeholder="4-значный код" className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl px-4 py-3 mb-6 outline-none focus:border-blue-500 transition-colors text-center font-mono tracking-widest text-2xl" maxLength={4} />
              <button onClick={() => {
                if (verifyLoginCode(loginUser, loginPin)) {
                  setIsAuth(true);
                }
              }} className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3.5 font-bold tracking-wider transition-colors mb-2">ВОЙТИ</button>
              <button onClick={() => setLoginStep(1)} className="w-full bg-transparent text-neutral-500 hover:text-white rounded-xl py-3 text-sm transition-colors">Назад</button>
            </>
          )}
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
          <button onClick={() => { window.location.search = ""; }} className="flex items-center gap-2 text-neutral-400 hover:text-white bg-[#1a1a1a] px-4 py-2 rounded-lg transition-colors border border-[#333]">
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
                      <button onClick={() => setTransferModalUser(u)} className="bg-purple-500/10 text-purple-500 border border-purple-500/20 hover:bg-purple-500/20 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors" title="Передать кибик">🎁</button>

                      <button onClick={() => {
                        const amountStr = window.prompt(`Выдать кристаллы игроку ${u.name}?\nВведите количество (можно с минусом, чтобы забрать):`);
                        if (!amountStr) return;
                        const amount = parseInt(amountStr, 10);
                        if (!isNaN(amount) && amount !== 0) {
                          giveCrystals(u.id, amount);
                        }
                      }} className="bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 hover:bg-cyan-500/20 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors" title="Выдать кристаллы">+💎</button>

                      <button onClick={() => setSelectedUser(u)} className="bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500/20 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">Инвентарь</button>
                      
                      {(role === "admin" || (role === "creator" && u.role !== "admin" && u.role !== "creator")) && (
                        isBanned ? (
                          <button onClick={() => unbanUser(u.id)} className="bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/20 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">Разбан</button>
                        ) : (
                          <button onClick={() => { setBanModalUser(u); setBanDays("30"); setBanReason(""); }} className="bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">Бан</button>
                        )
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
                    <button onClick={() => setGlobalTransfer({ sourceUserId: u.id, itemId: item.id, item })} className="absolute top-2 right-10 p-1.5 bg-purple-500/10 text-purple-500 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-purple-500/20 transition-all" title="Передать игроку">
                      🎁
                    </button>
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

      {/* Ban Modal */}
      {banModalUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-[#222] rounded-3xl p-6 w-full max-w-sm flex flex-col shadow-2xl">
            <h2 className="text-xl font-bold mb-2">Забанить {banModalUser.name}</h2>
            <p className="text-xs text-neutral-400 mb-4">Укажите срок и причину блокировки</p>
            <input type="number" value={banDays} onChange={e => setBanDays(e.target.value)} placeholder="Количество дней" className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl px-4 py-3 mb-3 outline-none focus:border-red-500 transition-colors" />
            <input type="text" value={banReason} onChange={e => setBanReason(e.target.value)} placeholder="Причина бана" className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl px-4 py-3 mb-6 outline-none focus:border-red-500 transition-colors" />
            <div className="flex gap-3">
              <button onClick={() => setBanModalUser(null)} className="flex-1 py-3 rounded-xl bg-[#222] text-white hover:bg-[#333] transition-colors font-semibold">Отмена</button>
              <button onClick={() => {
                const days = parseInt(banDays) || 30;
                const d = new Date(); d.setDate(d.getDate() + days);
                banUser(banModalUser.id, d, banReason || "Нарушение правил");
                setBanModalUser(null);
              }} className="flex-1 py-3 rounded-xl bg-red-600/20 text-red-500 hover:bg-red-600/30 border border-red-500/30 transition-colors font-semibold">Подтвердить</button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {transferModalUser && (() => {
        const myInv = currentUser?.inventory || [];
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#111] border border-[#222] rounded-3xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold">Передать кибик</h2>
                  <p className="text-sm text-neutral-400">Выберите кибик из своего инвентаря для {transferModalUser.name}</p>
                </div>
                <button onClick={() => setTransferModalUser(null)} className="p-2 bg-[#222] hover:bg-[#333] rounded-full transition-colors"><X size={20} /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 scrollbar-thin">
                {myInv.length === 0 && <p className="text-neutral-500 col-span-full text-center py-10">Ваш инвентарь пуст</p>}
                {myInv.map((item: any) => (
                  <div key={item.id} onClick={() => {
                    transferKibik(myId, transferModalUser.id, item.id);
                    setTransferModalUser(null);
                  }} className="bg-[#0a0a0a] border border-[#222] rounded-xl p-3 flex flex-col items-center gap-2 cursor-pointer group hover:border-purple-500 transition-colors">
                    {/^(https?|data|blob):/.test(item.emoji) ? (
                      <img src={item.emoji} alt={item.name} className="w-10 h-10 object-cover rounded-lg mb-1" />
                    ) : (
                      <div className="text-4xl mb-1">{item.emoji}</div>
                    )}
                    <div className="text-xs font-bold text-center w-full truncate">{item.name}</div>
                    <div className="mt-2 w-full py-1.5 rounded-lg bg-purple-500/10 text-purple-400 text-[10px] text-center font-bold opacity-0 group-hover:opacity-100 transition-opacity">Передать</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Global Transfer Modal (Admin transferring any user's kibik) */}
      {globalTransfer && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-[#222] rounded-3xl p-6 w-full max-w-md flex flex-col shadow-2xl max-h-[80vh]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Кому передать {globalTransfer.item.name}?</h2>
              <button onClick={() => setGlobalTransfer(null)} className="p-2 bg-[#222] hover:bg-[#333] rounded-full"><X size={16} /></button>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-2 scrollbar-thin">
              {users.filter(u => u.id !== globalTransfer.sourceUserId).map(u => (
                 <button key={u.id} onClick={() => {
                   transferKibik(globalTransfer.sourceUserId, u.id, globalTransfer.itemId);
                   setGlobalTransfer(null);
                 }} className="flex items-center gap-3 p-3 rounded-xl bg-[#0a0a0a] hover:bg-[#1a1a1a] border border-[#222] transition-colors text-left">
                   <div className="w-8 h-8 rounded-lg bg-[#222] flex items-center justify-center">{u.avatar}</div>
                   <div>
                     <div className="text-sm font-bold">{u.name}</div>
                     <div className="text-xs text-neutral-500">{u.username}</div>
                   </div>
                 </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}