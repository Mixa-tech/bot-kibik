import { useState, useRef } from "react";
import { ShieldAlert, PlusCircle, Users, Package, Trash2, ImagePlus, LogOut, CheckCircle, X, Download, ToggleLeft, Crown, UserCheck, ShieldX, Pencil, Sun, Moon, Check, ShieldCheck, RefreshCw } from "lucide-react";
import { type CreatorProfile, useApp } from "../AppContext";
import { glass } from "./ThemeContext";

export function AdminDashboard() {
  const { users, globalKibiks, addGlobalKibik, removeGlobalKibik, banUser, unbanUser, removeKibikFromUser, editUserSave, role, tgUser, transferKibik, requestLoginCode, verifyLoginCode, toggleUserMaintenance, toggleUserTrust, creatorProfiles, updateCreatorStatus, editCreatorProfile, pendingKibiks, approvePendingKibik, rejectPendingKibik } = useApp();
  const myId = tgUser ? tgUser.id.toString() : "12345";
  const currentUser = users.find(u => u.id === myId);

  const [selectedUser, setSelectedUser] = useState<any>(null);

  const [banModalUser, setBanModalUser] = useState<any>(null);
  const [banDays, setBanDays] = useState("30");
  const [banReason, setBanReason] = useState("");

  const [transferModalUser, setTransferModalUser] = useState<any>(null);

  const [editSaveUser, setEditSaveUser] = useState<any>(null);
  const [editCrystals, setEditCrystals] = useState("0");
  const [editPasscoins, setEditPasscoins] = useState("0");
  const [editPower, setEditPower] = useState("1");

  const [loginUser, setLoginUser] = useState("");
  const [loginPin, setLoginPin] = useState("");
  const [loginStep, setLoginStep] = useState<1 | 2>(1);
  const [isAuth, setIsAuth] = useState(false);
  const [globalTransfer, setGlobalTransfer] = useState<{ sourceUserId: string, itemId: string, item: any } | null>(null);
  const [activeTab, setActiveTab] = useState<'main' | 'users' | 'apps' | 'settings'>('main');
  const [isAdminDark, setIsAdminDark] = useState(true);

  const [editingCreator, setEditingCreator] = useState<CreatorProfile | null>(null);
  const [editOminicoins, setEditOminicoins] = useState("0");
  const [editCreatorLevel, setEditCreatorLevel] = useState<CreatorProfile['creator_level']>('creator');
  const [editSub, setEditSub] = useState<string>("null");

  const ADMIN_TABS = [
    { key: 'main' as const, label: 'Главная', Icon: PlusCircle },
    { key: 'users' as const, label: 'Игроки', Icon: Users },
    { key: 'apps' as const, label: 'Модерация', Icon: ShieldCheck },
    { key: 'settings' as const, label: 'Настройки', Icon: ToggleLeft },
  ];

  const TABS_INFO = [
    { key: "home", label: "Главная" },
    { key: "inventory", label: "Инвентарь" },
    { key: "market", label: "Биржа" },
    { key: "clicker", label: "Кликер" },
    { key: "profile", label: "Профиль" },
  ];

  const isMaintenance = !!globalKibiks["SYSTEM_MAINTENANCE"];
  const toggleMaintenance = () => {
    if (isMaintenance) {
      removeGlobalKibik("SYSTEM_MAINTENANCE");
    } else {
      const text = window.prompt("Введите текст для экрана технических работ:", "Ведутся технические работы. Ожидайте новостей!");
      if (text === null) return; // Если админ нажал "Отмена"
      addGlobalKibik("SYSTEM_MAINTENANCE", {
        code: "SYSTEM_MAINTENANCE",
        name: text || "Ведутся технические работы. Ожидайте новостей!",
        rarity: "legendary",
        emoji: "🛠"
      });
    }
  };

  // Admin form state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [codeType, setCodeType] = useState<"kibik" | "sub">("kibik");
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newSub, setNewSub] = useState("Cores Basic");
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
    if (!code || (codeType === "kibik" && !newName.trim())) {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2500);
      return;
    }
    
    if (codeType === "sub") {
      addGlobalKibik(code, { code, name: `Подписка ${newSub}`, rarity: "legendary", emoji: `SUB:${newSub}` });
    } else {
      addGlobalKibik(code, { code, name: newName.trim(), rarity: newRarity, emoji: newEmoji });
    }
    
    setStatus("success");
    setNewCode("");
    setNewName("");
    setNewSub("Cores Basic");
    setNewEmoji("📦");
    setTimeout(() => setStatus("idle"), 2000);
  };

  // Проверка на бан администратора/креатора
  const isBanned = currentUser?.bannedUntil && new Date(currentUser.bannedUntil) > new Date();
  if (isBanned) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center text-[#ef4444] font-sans">
        <ShieldAlert size={80} className="mb-6 text-red-600 animate-pulse" />
        <h1 className="text-4xl font-black mb-3 tracking-widest">ВЫ ЗАБАНЕНЫ</h1>
        <p className="text-sm text-red-400/80 mb-8 font-medium">Доступ к панели управления строго ограничен.</p>
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 w-full text-left max-w-sm">
          <p className="text-sm mb-3"><strong className="text-white">Причина:</strong> {currentUser.banReason || "Нарушение правил"}</p>
          <p className="text-sm"><strong className="text-white">Окончание:</strong> {new Date(currentUser.bannedUntil!).toLocaleString("ru-RU", {day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"})}</p>
        </div>
      </div>
    );
  }

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
                const ok = await requestLoginCode(loginUser, true);
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
    <div className="min-h-screen p-6 md:p-10 font-sans transition-colors" style={{ background: isAdminDark ? '#0a0a0a' : '#f0f0f8', color: isAdminDark ? '#fff' : '#111' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 p-5 rounded-2xl" style={glass(isAdminDark)}>
          <div className="flex items-center gap-4 ">
            <div className="bg-blue-500/20 p-3 rounded-xl border border-blue-500/30">
              <ShieldAlert className="text-blue-500" size={28}/>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-wider">KIBIK DASHBOARD</h1>
              <p className="text-sm" style={{ color: isAdminDark ? '#888' : '#666' }}>Панель управления администратора</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => window.location.reload()} className="flex items-center justify-center w-10 h-10 rounded-lg transition-colors" style={glass(isAdminDark, 0.1)} title="Обновить">
              <RefreshCw size={18} className={isAdminDark ? "text-neutral-300" : "text-neutral-600"} />
            </button>
            <button onClick={() => setIsAdminDark(d => !d)} className="flex items-center justify-center w-10 h-10 rounded-lg transition-colors" style={glass(isAdminDark, 0.1)}>
              {isAdminDark ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-blue-500" />}
            </button>
            <button onClick={() => { window.location.search = ""; }} className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors" style={{...glass(isAdminDark, 0.1), color: isAdminDark ? '#aaa' : '#555'}}>
              <LogOut size={16} /> Выйти
            </button>
          </div>
        </div>

        {/* Admin Tabs Nav */}
        <div className="flex items-center gap-2 mb-6 p-2 rounded-2xl relative" style={glass(isAdminDark, 0.08)}>
          {ADMIN_TABS.map(tab => {
            const isActive = activeTab === tab.key;
            if (role !== 'admin' && (tab.key === 'users' || tab.key === 'apps' || tab.key === 'settings')) {
              return null;
            }
            return (
              <button 
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all relative ${isActive ? (isAdminDark ? 'text-white' : 'text-blue-600') : (isAdminDark ? 'text-neutral-400 hover:bg-white/5' : 'text-neutral-500 hover:bg-black/5')}`}
              >
                {isActive && <div className="absolute inset-0 rounded-xl z-0" style={{ background: isAdminDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.6)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />}
                <div className="relative z-10 flex items-center gap-2">
                  <tab.Icon size={16} />
                  <span>{tab.label}</span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Main content */}
        <div className="p-6 rounded-3xl" style={glass(isAdminDark)}>

        {activeTab === 'main' && (
          <div className={`grid grid-cols-1 ${role === 'admin' ? 'lg:grid-cols-2' : 'lg:grid-cols-2'} gap-6`}>
          {/* Колонна 1: Создание */}
          <div className="rounded-2xl p-6 flex flex-col gap-5" style={glass(isAdminDark, 0.05)}>
            <div className="flex items-center justify-between">
              <h2 className={`text-lg font-bold flex items-center gap-2 ${isAdminDark ? 'text-green-400' : 'text-green-600'}`}><PlusCircle size={20}/> Создать промокод</h2>
              <select value={codeType} onChange={(e) => setCodeType(e.target.value as any)} className="bg-transparent font-bold text-sm outline-none cursor-pointer" style={{ color: isAdminDark ? '#888' : '#666' }}>
                <option value="kibik">Предмет (Кибик)</option>
                <option value="sub">Подписка (Cores)</option>
              </select>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className={`text-xs mb-1 block uppercase tracking-wider ${isAdminDark ? 'text-neutral-400' : 'text-neutral-500'}`}>Код</label>
                <input type="text" value={newCode} onChange={(e) => setNewCode(e.target.value.toUpperCase())} placeholder="Например: MEGA2026" className="w-full rounded-xl px-4 py-3 outline-none focus:border-green-500 transition-colors font-mono tracking-wider" style={{ background: isAdminDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)', border: `1px solid ${isAdminDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }} />
              </div>
              
              {codeType === "kibik" ? (
                <div>
                  <div>
                    <label className={`text-xs mb-1 block uppercase tracking-wider ${isAdminDark ? 'text-neutral-400' : 'text-neutral-500'}`}>Название предмета</label>
                    <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Золотой куб" className="w-full rounded-xl px-4 py-3 outline-none focus:border-green-500 transition-colors" style={{ background: isAdminDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)', border: `1px solid ${isAdminDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`text-xs mb-1 block uppercase tracking-wider ${isAdminDark ? 'text-neutral-400' : 'text-neutral-500'}`}>Картинка</label>
                      <div className="relative">
                        <input type="text" value={newEmoji} onChange={(e) => setNewEmoji(e.target.value)} className="w-full rounded-xl px-4 py-3 pr-10 outline-none focus:border-green-500 transition-colors" style={{ background: isAdminDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)', border: `1px solid ${isAdminDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }} />
                        <button onClick={() => fileInputRef.current?.click()} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg ${isAdminDark ? 'text-neutral-400 hover:text-white bg-white/5' : 'text-neutral-500 hover:text-black bg-black/5'}`}><ImagePlus size={16} /></button>
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                      </div>
                    </div>
                    <div>
                      <label className={`text-xs mb-1 block uppercase tracking-wider ${isAdminDark ? 'text-neutral-400' : 'text-neutral-500'}`}>Редкость</label>
                      <select value={newRarity} onChange={(e) => setNewRarity(e.target.value as any)} className="w-full rounded-xl px-4 py-3 outline-none focus:border-green-500 transition-colors appearance-none" style={{ background: isAdminDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)', border: `1px solid ${isAdminDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
                        <option value="common">Обычный</option>
                        <option value="rare">Редкий</option>
                        <option value="epic">Эпический</option>
                        <option value="legendary">Легендарный</option>
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className={`text-xs mb-1 block uppercase tracking-wider ${isAdminDark ? 'text-neutral-400' : 'text-neutral-500'}`}>Уровень подписки</label>
                  <select value={newSub} onChange={(e) => setNewSub(e.target.value)} className="w-full rounded-xl px-4 py-3 outline-none focus:border-purple-500 transition-colors appearance-none" style={{ background: isAdminDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)', border: `1px solid ${isAdminDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
                    <option value="Cores Basic">Cores Basic</option>
                    <option value="Cores Gold">Cores Gold</option>
                    <option value="Cores +">Cores +</option>
                  </select>
                </div>
              )}
            </div>
            <button onClick={handleAdd} className="mt-auto w-full bg-green-500 hover:bg-green-600 text-white rounded-xl py-4 font-bold tracking-wider transition-colors flex items-center justify-center gap-2">
              <PlusCircle size={18} /> СОЗДАТЬ
            </button>
            {status === "success" && <p className="text-green-400 text-center text-sm flex items-center justify-center gap-1"><CheckCircle size={14}/> Успешно создано!</p>}
            {status === "error" && <p className="text-red-400 text-center text-sm">Заполните все поля!</p>}
          </div>

          {/* Колонна 2: Активные коды */}
          <div className="rounded-2xl p-6 flex flex-col gap-4 lg:h-[600px]" style={glass(isAdminDark, 0.05)}>
            <h2 className={`text-lg font-bold flex items-center gap-2 ${isAdminDark ? 'text-purple-400' : 'text-purple-600'}`}><Package size={20}/> Доступные коды ({Object.keys(globalKibiks).filter(k => !k.startsWith("TAB_DISABLED_") && k !== "SYSTEM_MAINTENANCE").length})</h2>
            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-2 scrollbar-thin">
              {Object.values(globalKibiks).filter(k => !k.code.startsWith("TAB_DISABLED_") && k.code !== "SYSTEM_MAINTENANCE").length === 0 && <p className="text-neutral-500 text-center mt-10">Нет активных кодов</p>}
              {Object.values(globalKibiks).filter(k => !k.code.startsWith("TAB_DISABLED_") && k.code !== "SYSTEM_MAINTENANCE").reverse().map(k => (
                <div key={k.code} className="rounded-xl p-3 flex justify-between items-center group transition-colors" style={{...glass(isAdminDark, 0.1), border: `1px solid ${isAdminDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`}}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl overflow-hidden shrink-0" style={glass(isAdminDark, 0.05)}>
                      {k.emoji.startsWith("http") || k.emoji.startsWith("data") ? <img src={k.emoji} className="w-full h-full object-cover" /> : k.emoji}
                    </div>
                    <div>
                      <div className="font-bold text-sm">{k.name}</div>
                      <div className={`text-xs font-mono mt-1 bg-purple-500/10 px-2 py-0.5 rounded inline-block ${isAdminDark ? 'text-purple-400' : 'text-purple-600'}`}>{k.code}</div>
                    </div>
                  </div>
                  <button onClick={() => removeGlobalKibik(k.code)} className={`${isAdminDark ? 'text-neutral-500' : 'text-neutral-400'} hover:text-red-500 p-2 transition-colors`} title="Удалить код">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          </div>
        )}

        {activeTab === 'users' && role === "admin" && (
          <div className="flex flex-col gap-2">
            <h2 className={`text-lg font-bold flex items-center gap-2 mb-2 ${isAdminDark ? 'text-blue-400' : 'text-blue-600'}`}><Users size={20}/> Игроки ({users.length})</h2>
            {users.map(u => {
              const isBanned = u.bannedUntil && new Date(u.bannedUntil) > new Date();
              return (
                <div key={u.id} className="rounded-xl p-3 flex justify-between items-center transition-colors" style={{...glass(isAdminDark, 0.1), border: `1px solid ${isAdminDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`}}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-neutral-500 shrink-0" style={glass(isAdminDark, 0.05)}>
                      {u.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-sm flex items-center gap-1">
                        {u.name}
                        {u.role === "admin" && <span className="text-yellow-500 text-[10px] ml-1">👑</span>}
                      </div>
                      <div className={`text-xs mt-0.5 flex gap-2 ${isAdminDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                        <span>Ур.{u.level}</span>
                        <span>💎{u.crystals || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleUserMaintenance(u.id, !u.showMaintenance)} className={`border text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${u.showMaintenance ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20' : 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20 hover:bg-neutral-500/20'}`} title="Экран тех. работ">{u.showMaintenance ? "Снять" : "Блок"}</button>
                    <button onClick={() => toggleUserTrust(u.id, !u.untrusted)} className={`border text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${u.untrusted ? 'bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20' : 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20 hover:bg-neutral-500/20'}`} title="Статус доверия">{u.untrusted ? "Доверять" : "Недовер."}</button>
                    <button onClick={() => setTransferModalUser(u)} className="bg-purple-500/10 text-purple-500 border border-purple-500/20 hover:bg-purple-500/20 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors" title="Передать кибик">🎁</button>
                    <button onClick={() => {
                      setEditSaveUser(u);
                      setEditPasscoins(u.passcoins?.toString() || "0");
                      setEditCrystals(u.crystals?.toString() || "0");
                      setEditPower(u.clickPower?.toString() || "1");
                    }} className="bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 hover:bg-cyan-500/20 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors" title="Редактировать сохранение">💾</button>
                    <button onClick={() => setSelectedUser(u)} className="bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500/20 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">Инв.</button>
                    {isBanned ? (
                      <button onClick={() => unbanUser(u.id)} className="bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/20 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">Разбан</button>
                    ) : (
                      <button onClick={() => { setBanModalUser(u); setBanDays("30"); setBanReason(""); }} className="bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">Бан</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'apps' && role === "admin" && (
          <div className="flex flex-col gap-3">
            <h2 className={`text-lg font-bold flex items-center gap-2 mb-2 ${isAdminDark ? 'text-purple-400' : 'text-purple-600'}`}><Crown size={20}/> Заявки Креаторов</h2>
            {creatorProfiles.map(profile => (
              <div key={profile.id} className="p-4 rounded-2xl flex items-center gap-4" style={{...glass(isAdminDark, 0.1), border: `1px solid ${isAdminDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`}}>
                <img src={profile.avatar_url || ''} className="w-14 h-14 rounded-full object-cover" style={{ background: isAdminDark ? '#333' : '#eee' }} />
                <div className="flex-1">
                  <div className="font-bold">{profile.display_name}</div>
                  <div className={`text-sm ${isAdminDark ? 'text-neutral-400' : 'text-neutral-600'}`}>{profile.tg_username}</div>
                  <div className={`text-xs font-mono mt-1 ${isAdminDark ? 'text-neutral-500' : 'text-neutral-500'}`}>ID: {profile.user_id}</div>
                </div>
                
                {profile.status === 'pending' && (
                  <div className="flex gap-2">
                    <button onClick={() => updateCreatorStatus(profile.id, 'approved')} className="p-3 bg-green-500/10 text-green-500 rounded-xl hover:bg-green-500/20"><Check /></button>
                    <button onClick={() => updateCreatorStatus(profile.id, 'rejected')} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20"><X /></button>
                  </div>
                )}

                {profile.status === 'approved' && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-green-500 flex items-center gap-1.5"><UserCheck size={16}/> Одобрен</span>
                    <button onClick={() => {
                        setEditingCreator(profile);
                        setEditOminicoins(profile.ominicoins.toString());
                        setEditCreatorLevel(profile.creator_level);
                        setEditSub(profile.active_subscription || "null");
                    }} className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20" title="Редактировать"><Pencil size={16} /></button>
                    <button onClick={() => updateCreatorStatus(profile.id, 'untrusted')} className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg hover:bg-yellow-500/20" title="Сделать недоверенным">
                      <ShieldX size={16} />
                    </button>
                  </div>
                )}

                {profile.status === 'untrusted' && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-yellow-500 flex items-center gap-1.5"><ShieldX size={16}/> Недоверенный</span>
                     <button onClick={() => {
                        setEditingCreator(profile);
                        setEditOminicoins(profile.ominicoins.toString());
                        setEditCreatorLevel(profile.creator_level);
                        setEditSub(profile.active_subscription || "null");
                    }} className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20" title="Редактировать"><Pencil size={16} /></button>
                    <button onClick={() => updateCreatorStatus(profile.id, 'approved')} className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20" title="Вернуть доверие">
                      <UserCheck size={16} />
                    </button>
                  </div>
                )}

                {profile.status === 'rejected' && (
                  <span className="text-sm font-bold text-red-500">Отклонен</span>
                )}
              </div>
            ))}

            {/* Предложенные кибики */}
            <h2 className={`text-lg font-bold flex items-center gap-2 mt-8 mb-2 ${isAdminDark ? 'text-green-400' : 'text-green-600'}`}><Package size={20}/> Кибики на модерации ({pendingKibiks.length})</h2>
            {pendingKibiks.length === 0 && <p className="text-neutral-500 text-sm">Новых предложений нет</p>}
            {pendingKibiks.map(k => (
                <div key={k.id} className="p-4 rounded-2xl flex items-center justify-between gap-4" style={{...glass(isAdminDark, 0.1), border: `1px solid ${isAdminDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`}}>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl overflow-hidden shrink-0" style={glass(isAdminDark, 0.05)}>
                            {k.emoji.startsWith("http") || k.emoji.startsWith("data") ? <img src={k.emoji} className="w-full h-full object-cover" /> : k.emoji}
                        </div>
                        <div>
                            <div className="font-bold text-sm">{k.name} <span className="text-[10px] text-neutral-500 font-normal">от {k.creator_id}</span></div>
                            <div className={`text-xs font-mono mt-1 bg-purple-500/10 px-2 py-0.5 rounded inline-block ${isAdminDark ? 'text-purple-400' : 'text-purple-600'}`}>{k.code}</div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => approvePendingKibik(k)} className="p-2 bg-green-500/10 text-green-500 rounded-xl hover:bg-green-500/20" title="Одобрить"><Check size={18}/></button>
                        <button onClick={() => rejectPendingKibik(k.id)} className="p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20" title="Отклонить"><X size={18}/></button>
                    </div>
                </div>
            ))}
          </div>
        )}

        {activeTab === 'settings' && role === "admin" && (
          <div>
            <h2 className={`text-lg font-bold flex items-center gap-2 mb-4 ${isAdminDark ? 'text-orange-400' : 'text-orange-600'}`}><ToggleLeft size={20}/> Настройки</h2>
            <div className="rounded-2xl p-4 mb-4" style={glass(isAdminDark, 0.05)}>
              <h3 className="font-bold mb-3">Технические работы</h3>
              <button onClick={toggleMaintenance} className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors border ${isMaintenance ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20'}`}>
                <ShieldAlert size={16} /> {isMaintenance ? "Выключить тех. работы" : "Включить тех. работы"}
              </button>
            </div>
            <div className="rounded-2xl p-4" style={glass(isAdminDark, 0.05)}>
              <h3 className="font-bold mb-3">Управление вкладками</h3>
              <div className="flex flex-wrap gap-3">
                {TABS_INFO.map(tab => {
                  const code = `TAB_DISABLED_${tab.key.toUpperCase()}`;
                  const isDisabled = !!globalKibiks[code];
                  return (
                    <button 
                      key={tab.key}
                      onClick={() => {
                        if (isDisabled) removeGlobalKibik(code);
                        else addGlobalKibik(code, { code, name: `Вкладка ${tab.label}`, rarity: "common", emoji: "🚫" });
                      }}
                      className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-sm font-bold border transition-colors ${
                        isDisabled ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20'
                      }`}
                    >
                      {tab.label}: {isDisabled ? "ОТКЛЮЧЕНО" : "РАБОТАЕТ"}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* User Inventory Modal */}
      {selectedUser && (() => {
        const u = users.find(user => user.id === selectedUser.id) || selectedUser;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="rounded-3xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl" style={{ background: isAdminDark ? '#111' : '#fff', color: isAdminDark ? '#fff' : '#000', border: `1px solid ${isAdminDark ? '#333' : '#ddd'}`}}>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={glass(isAdminDark, 0.05)}>{u.avatar}</div>
                  <div>
                    <h2 className="text-xl font-bold">Инвентарь: {u.name}</h2>
                    <p className={`text-sm ${isAdminDark ? 'text-neutral-400' : 'text-neutral-500'}`}>{u.inventory?.length || 0} кибиков</p>
                  </div>
                </div>
                <button onClick={() => setSelectedUser(null)} className="p-2 rounded-full transition-colors" style={glass(isAdminDark, 0.1)}><X size={20} /></button>
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
                    {u.id !== myId && (
                      <button onClick={() => transferKibik(u.id, myId, item.id)} className="absolute top-2 right-[72px] p-1.5 bg-green-500/10 text-green-500 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-green-500/20 transition-all flex items-center justify-center" title="Забрать себе">
                        <Download size={14} />
                      </button>
                    )}
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
          <div className="rounded-3xl p-6 w-full max-w-sm flex flex-col shadow-2xl" style={{ background: isAdminDark ? '#111' : '#fff', color: isAdminDark ? '#fff' : '#000', border: `1px solid ${isAdminDark ? '#333' : '#ddd'}`}}>
            <h2 className="text-xl font-bold mb-2">Забанить {banModalUser.name}</h2>
            <p className={`text-xs mb-4 ${isAdminDark ? 'text-neutral-400' : 'text-neutral-500'}`}>Укажите срок и причину блокировки</p>
            <input type="number" value={banDays} onChange={e => setBanDays(e.target.value)} placeholder="Количество дней" className="w-full rounded-xl px-4 py-3 mb-3 outline-none focus:border-red-500 transition-colors" style={{ background: isAdminDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)', border: `1px solid ${isAdminDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }} />
            <input type="text" value={banReason} onChange={e => setBanReason(e.target.value)} placeholder="Причина бана" className="w-full rounded-xl px-4 py-3 mb-6 outline-none focus:border-red-500 transition-colors" style={{ background: isAdminDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)', border: `1px solid ${isAdminDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }} />
            <div className="flex gap-3">
              <button onClick={() => setBanModalUser(null)} className="flex-1 py-3 rounded-xl transition-colors font-semibold" style={{...glass(isAdminDark, 0.1), color: isAdminDark ? '#fff' : '#000'}}>Отмена</button>
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
            <div className="rounded-3xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl" style={{ background: isAdminDark ? '#111' : '#fff', color: isAdminDark ? '#fff' : '#000', border: `1px solid ${isAdminDark ? '#333' : '#ddd'}`}}>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold">Передать кибик</h2>
                  <p className={`text-sm ${isAdminDark ? 'text-neutral-400' : 'text-neutral-500'}`}>Выберите кибик из своего инвентаря для {transferModalUser.name}</p>
                </div>
                <button onClick={() => setTransferModalUser(null)} className="p-2 rounded-full transition-colors" style={glass(isAdminDark, 0.1)}><X size={20} /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 scrollbar-thin">
                {myInv.length === 0 && <p className="text-neutral-500 col-span-full text-center py-10">Ваш инвентарь пуст</p>}
                {myInv.map((item: any) => (
                  <div key={item.id} onClick={() => {
                    transferKibik(myId, transferModalUser.id, item.id);
                    setTransferModalUser(null);
                  }} className="rounded-xl p-3 flex flex-col items-center gap-2 cursor-pointer group hover:border-purple-500 transition-colors" style={{...glass(isAdminDark, 0.05), border: `1px solid ${isAdminDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`}}>
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

      {/* Edit Save Modal */}
      {editSaveUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="rounded-3xl p-6 w-full max-w-sm flex flex-col shadow-2xl" style={{ background: isAdminDark ? '#111' : '#fff', color: isAdminDark ? '#fff' : '#000', border: `1px solid ${isAdminDark ? '#333' : '#ddd'}`}}>
            <h2 className="text-xl font-bold mb-2">Сохранение: {editSaveUser.name}</h2>
            <p className={`text-xs mb-4 ${isAdminDark ? 'text-neutral-400' : 'text-neutral-500'}`}>Установите новые значения для аккаунта</p>
            
            <div className="mb-3">
              <label className={`text-xs mb-1 block uppercase tracking-wider ${isAdminDark ? 'text-neutral-400' : 'text-neutral-500'}`}>Кристаллы</label>
              <input type="number" value={editCrystals} onChange={e => setEditCrystals(e.target.value)} className="w-full rounded-xl px-4 py-3 outline-none focus:border-cyan-500 transition-colors" style={{ background: isAdminDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)', border: `1px solid ${isAdminDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }} />
            </div>
            
            <div className="mb-3">
              <label className={`text-xs mb-1 block uppercase tracking-wider ${isAdminDark ? 'text-neutral-400' : 'text-neutral-500'}`}>Passcoins</label>
              <input type="number" value={editPasscoins} onChange={e => setEditPasscoins(e.target.value)} className="w-full rounded-xl px-4 py-3 outline-none focus:border-yellow-500 transition-colors" style={{ background: isAdminDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)', border: `1px solid ${isAdminDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }} />
            </div>
            <div className="mb-4">
              <label className={`text-xs mb-1 block uppercase tracking-wider ${isAdminDark ? 'text-neutral-400' : 'text-neutral-500'}`}>Сила клика</label>
              <input type="number" value={editPower} onChange={e => setEditPower(e.target.value)} className="w-full rounded-xl px-4 py-3 outline-none focus:border-cyan-500 transition-colors" style={{ background: isAdminDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)', border: `1px solid ${isAdminDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }} />
            </div>
            
            <div className="flex gap-3">
              <button onClick={() => setEditSaveUser(null)} className="flex-1 py-3 rounded-xl transition-colors font-semibold" style={{...glass(isAdminDark, 0.1), color: isAdminDark ? '#fff' : '#000'}}>Отмена</button>
              <button onClick={() => {
                const c = parseInt(editCrystals) || 0;
                const p = parseInt(editPower) || 1;
                const pass = parseInt(editPasscoins) || 0;
                editUserSave(editSaveUser.id, c, p, pass);
                setEditSaveUser(null);
              }} className="flex-1 py-3 rounded-xl bg-cyan-600/20 text-cyan-500 hover:bg-cyan-600/30 border border-cyan-500/30 transition-colors font-semibold">Сохранить</button>
            </div>
          </div>
        </div>
      )}

      {/* Global Transfer Modal (Admin transferring any user's kibik) */}
      {globalTransfer && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="rounded-3xl p-6 w-full max-w-md flex flex-col shadow-2xl max-h-[80vh]" style={{ background: isAdminDark ? '#111' : '#fff', color: isAdminDark ? '#fff' : '#000', border: `1px solid ${isAdminDark ? '#333' : '#ddd'}`}}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Кому передать {globalTransfer.item.name}?</h2>
              <button onClick={() => setGlobalTransfer(null)} className="p-2 rounded-full" style={glass(isAdminDark, 0.1)}><X size={16} /></button>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-2 scrollbar-thin">
              {users.filter(u => u.id !== globalTransfer.sourceUserId).map(u => (
                 <button key={u.id} onClick={() => {
                   transferKibik(globalTransfer.sourceUserId, u.id, globalTransfer.itemId);
                   setGlobalTransfer(null);
                 }} className="flex items-center gap-3 p-3 rounded-xl border transition-colors text-left" style={{...glass(isAdminDark, 0.05), border: `1px solid ${isAdminDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`}}>
                   <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={glass(isAdminDark, 0.1)}>{u.avatar}</div>
                   <div>
                     <div className="text-sm font-bold">{u.name}</div>
                     <div className={`text-xs ${isAdminDark ? 'text-neutral-400' : 'text-neutral-500'}`}>{u.username}</div>
                   </div>
                 </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Creator Profile Edit Modal */}
      {editingCreator && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="rounded-3xl p-6 w-full max-w-sm flex flex-col shadow-2xl" style={{ background: isAdminDark ? '#111' : '#fff', color: isAdminDark ? '#fff' : '#000', border: `1px solid ${isAdminDark ? '#333' : '#ddd'}`}}>
            <h2 className="text-xl font-bold mb-2">Профиль: {editingCreator.display_name}</h2>
            <p className={`text-xs mb-4 ${isAdminDark ? 'text-neutral-400' : 'text-neutral-500'}`}>Редактирование Ominicoins и уровня</p>
            
            <div className="mb-3">
              <label className={`text-xs mb-1 block uppercase tracking-wider ${isAdminDark ? 'text-neutral-400' : 'text-neutral-500'}`}>Ominicoins ©</label>
              <input type="number" value={editOminicoins} onChange={e => setEditOminicoins(e.target.value)} className="w-full rounded-xl px-4 py-3 outline-none focus:border-purple-500 transition-colors" style={{ background: isAdminDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)', border: `1px solid ${isAdminDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }} />
            </div>
            
            <div className="mb-3">
              <label className={`text-xs mb-1 block uppercase tracking-wider ${isAdminDark ? 'text-neutral-400' : 'text-neutral-500'}`}>Подписка</label>
              <select value={editSub} onChange={e => setEditSub(e.target.value)} className="w-full rounded-xl px-4 py-3 outline-none focus:border-purple-500 transition-colors appearance-none" style={{ background: isAdminDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)', border: `1px solid ${isAdminDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
                <option value="null">Нет подписки</option>
                <option value="Cores Basic">Cores Basic</option>
                <option value="Cores Gold">Cores Gold</option>
                <option value="Cores +">Cores +</option>
              </select>
            </div>
            <div className="mb-4">
              <label className={`text-xs mb-1 block uppercase tracking-wider ${isAdminDark ? 'text-neutral-400' : 'text-neutral-500'}`}>Уровень креатора</label>
              <select value={editCreatorLevel} onChange={e => setEditCreatorLevel(e.target.value as any)} className="w-full rounded-xl px-4 py-3 outline-none focus:border-purple-500 transition-colors appearance-none" style={{ background: isAdminDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)', border: `1px solid ${isAdminDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
                <option value="creator">Creator</option>
                <option value="verified">Verified Creator</option>
                <option value="super">Super Creator</option>
                <option value="mythic">Mythic Creator</option>
                <option value="legendary">Legendary Creator</option>
              </select>
            </div>
            
            <div className="flex gap-3">
              <button onClick={() => setEditingCreator(null)} className="flex-1 py-3 rounded-xl transition-colors font-semibold" style={{...glass(isAdminDark, 0.1), color: isAdminDark ? '#fff' : '#000'}}>Отмена</button>
              <button onClick={() => {
                const coins = parseInt(editOminicoins) || 0;
                editCreatorProfile(editingCreator.id, { ominicoins: coins, creator_level: editCreatorLevel, active_subscription: editSub === "null" ? null : editSub });
                setEditingCreator(null);
              }} className="flex-1 py-3 rounded-xl bg-purple-600/20 text-purple-500 hover:bg-purple-600/30 border border-purple-500/30 transition-colors font-semibold">Сохранить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}