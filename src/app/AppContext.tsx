import { createContext, useContext, useEffect, useState } from "react";
import type { InventoryItem } from "./components/HomePage";
import { MOCK_USERS, type MockUser } from "./data/mockData";
import { supabase } from "./supabaseClient";

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export type Role = "admin" | "creator" | "user";

export interface Trade {
  id: string;
  sender_id: string;
  receiver_id: string;
  offer_item: InventoryItem;
  request_item: InventoryItem;
  status: "pending" | "accepted" | "declined";
}

export interface MarketListing {
  id: string;
  seller_id: string;
  item: InventoryItem;
  price: number;
}

export interface CreatorProfile {
  id: string;
  user_id: string;
  tg_username: string;
  display_name: string;
  avatar_url: string | null;
  status: "pending" | "approved" | "rejected" | "untrusted";
  creator_level: "creator" | "verified" | "super" | "mythic" | "legendary";
  ominicoins: number;
  active_subscription: string | null;
  task_progress: Record<string, number> | null;
  completed_tasks_count: number;
  last_kibik_creation_date: string | null;
  last_daily_bonus: string | null;
}

export const TASKS_CONFIG: Record<string, { name: string; reward: number; goal: number }> = {
  CREATE_1_CODE: {
    name: "Создать 1 промокод",
    reward: 10,
    goal: 1,
  },
  LIST_5_KIBIKS: {
    name: "Выставить 5 кибиков на биржу",
    reward: 20,
    goal: 5,
  },
  SELL_1_KIBIK: {
    name: "Продать 1 кибик на бирже",
    reward: 100,
    goal: 1,
  },
};

export interface PendingKibik {
  id: string;
  code: string;
  name: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  emoji: string;
  creator_id: string;
  created_at: string;
}

export interface AppState {
  tgUser: TelegramUser | null;
  role: Role;
  users: MockUser[];
  globalKibiks: Record<string, Omit<InventoryItem, "id" | "addedAt">>;
  setUsers: React.Dispatch<React.SetStateAction<MockUser[]>>;
  addGlobalKibik: (code: string, kibik: Omit<InventoryItem, "id" | "addedAt">) => void;
  removeGlobalKibik: (code: string) => void;
  updateUserRole: (userId: string, newRole: Role) => void;
  banUser: (userId: string, until: Date, reason: string) => void;
  unbanUser: (userId: string) => void;
  handleCheatBan: (userId: string) => void;
  toggleUserMaintenance: (userId: string, show: boolean) => void;
  toggleUserTrust: (userId: string, untrusted: boolean) => void;
  requestLoginCode: (username: string, requireAdmin?: boolean) => Promise<boolean>;
  verifyLoginCode: (username: string, code: string) => boolean;
  clearLoginCode: () => void;
  editUserSave: (userId: string, crystals: number, clickPower: number) => void;
  addKibikToUser: (userId: string, item: InventoryItem) => void;
  transferKibik: (senderId: string, receiverId: string, kibikId: string) => void;
  removeKibikFromUser: (userId: string, kibikId: string) => void;
  appError: string | null;
  trades: Trade[];
  marketListings: MarketListing[];
  sellKibik: (userId: string, kibikId: string, price: number) => void;
  buyKibik: (buyerId: string, listingId: string) => void;
  cancelListing: (sellerId: string, listingId: string) => void;
  syncClicker: (userId: string, crystals: number, clickPower: number) => void;
  createTrade: (receiverId: string, offer: InventoryItem, request: InventoryItem) => void;
  acceptTrade: (tradeId: string) => void;
  declineTrade: (tradeId: string) => void;
  // --- Creator Portal ---
  creatorProfile: CreatorProfile | null | undefined; // undefined = loading
  applyForCreator: (profile: Omit<CreatorProfile, "id" | "status" | "creator_level" | "ominicoins" | "active_subscription" | "task_progress" | "completed_tasks_count" | "last_kibik_creation_date" | "last_daily_bonus">, initialKibik: Omit<PendingKibik, "id" | "creator_id" | "created_at">) => Promise<void>;
  creatorProfiles: CreatorProfile[];
  updateCreatorStatus: (profileId: string, status: CreatorProfile['status']) => void;
  purchaseSubscription: (sub: { name: string, omin: number, passcoin: number }, method: 'omin' | 'passcoin') => Promise<boolean>;
  grantSubscription: (subName: string) => Promise<boolean>;
  editCreatorProfile: (profileId: string, data: { ominicoins: number, creator_level: CreatorProfile['creator_level'], active_subscription: string | null }) => void;
  editMyCreatorProfile: (data: { display_name: string, avatar_url: string | null }) => void;
  pendingKibiks: PendingKibik[];
  submitKibikForReview: (kibik: Omit<PendingKibik, "id" | "created_at">) => void;
  approvePendingKibik: (kibik: PendingKibik) => void;
  rejectPendingKibik: (id: string) => void;
  convertPasscoins: () => void;
  claimDailyBonus: (rewardType: 'omin' | 'crystals') => void;
  buyAutoClicker: (level: 1 | 2) => void;
  editUserSave: (userId: string, crystals: number, clickPower: number, passcoins?: number) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [tgUser, setTgUser] = useState<TelegramUser | null>(null);
  const [role, setRole] = useState<Role>("user");
  const [users, setUsers] = useState<MockUser[]>(MOCK_USERS);
  const [globalKibiks, setGlobalKibiks] = useState<Record<string, Omit<InventoryItem, "id" | "addedAt">>>({});
  const [appError, setAppError] = useState<string | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [marketListings, setMarketListings] = useState<MarketListing[]>([]);
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null | undefined>(undefined);
  const [creatorProfiles, setCreatorProfiles] = useState<CreatorProfile[]>([]);
  const [pendingKibiks, setPendingKibiks] = useState<PendingKibik[]>([]);


  useEffect(() => {
    const initApp = async () => {
      const tg = (window as any).Telegram?.WebApp;
      const tgUser = tg?.initDataUnsafe?.user;
      let currentUser: any = null;

      // 1. Инициализация пользователя
      if (tgUser) {
        tg.ready();
        tg.expand();
        setTgUser(tgUser);
        const isMixazx = tgUser.username?.toLowerCase() === "mixazx";
        setRole(isMixazx ? "admin" : "user");
        
        currentUser = {
          id: tgUser.id.toString(),
          name: `${tgUser.first_name} ${tgUser.last_name || ""}`.trim(),
          username: tgUser.username ? `@${tgUser.username}` : "@user",
          avatar: tgUser.first_name.slice(0, 2).toUpperCase(),
          status: "online",
          kibiks: 0,
          level: 1,
          bio: "",
          topEmoji: "🧊",
          role: isMixazx ? "admin" : "user",
          crystals: 0,
          clickPower: 1,
          inventory: [],
        };
      } else {
        setTgUser({ id: 12345, first_name: "Web", username: "Guest" });
        setRole("user");
        currentUser = {
          id: "12345",
          name: "Web Guest",
          username: "@guest",
          avatar: "LO",
          status: "online",
          kibiks: 0,
          level: 1,
          bio: "Локальный тест",
          topEmoji: "🧊",
          role: "user",
          crystals: 0,
          clickPower: 1,
          banCount: 0,
          passcoins: 0,
          auto_clickers: { level1: 0, level2: 0 },
          inventory: [],
        };
      }

      try {
        // 2. Скачиваем пользователей из Supabase
        const { data: dbUsers, error: selectError } = await supabase.from("users").select("*");
        if (selectError) throw selectError;

        let merged = [...(dbUsers || [])];
        
        merged = merged.map((u: any) => {
          if (u.bannedUntil) u.bannedUntil = new Date(u.bannedUntil);
          if (u.inventory) {
            u.inventory = u.inventory.map((item: any) => ({ ...item, addedAt: new Date(item.addedAt) }));
          }
          return u;
        });

        // 3. Добавляем пользователя локально СРАЗУ, чтобы избежать бага пустого инвентаря
        const meInDb = merged.find((u) => u.id === currentUser.id);
        if (!meInDb) {
          merged = [currentUser, ...merged];
          
          // Параллельно отправляем в базу
          const { error: insertError } = await supabase.from("users").insert(currentUser);
          if (insertError) {
            setAppError(`Ошибка сохранения: ${insertError.message}`);
            console.error("Ошибка при сохранении в Supabase:", insertError);
          }
        } else if (meInDb) {
          // Если юзер уже есть в БД, обновляем роль до актуальной
          setRole(meInDb.role);
        }

        // Гарантированно обновляем стейт
        setUsers(merged);

        // 4. Скачиваем доступные глобальные кибики (промокоды)
        const { data: dbKibiks, error: kibiksError } = await supabase.from("kibiks").select("*");
        if (kibiksError) {
          setAppError(`Ошибка таблицы kibiks: ${kibiksError.message}`);
        } else if (dbKibiks) {
          const kibiksMap: Record<string, any> = {};
          dbKibiks.forEach((k: any) => (kibiksMap[k.code] = k));
          setGlobalKibiks(kibiksMap);
        }

        // 5. Скачиваем трейды (входящие и исходящие)
        const { data: dbTrades, error: tradesError } = await supabase.from("trades").select("*").or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`);
        if (tradesError) {
          setAppError((prev) => prev ? `${prev} | Ошибка trades: ${tradesError.message}` : `Ошибка trades: ${tradesError.message}`);
        } else if (dbTrades) {
          setTrades(dbTrades);
        }

        // 6. Скачиваем лоты с биржи
        const { data: dbMarket, error: marketError } = await supabase.from("market").select("*");
        if (marketError) console.error("Ошибка биржи:", marketError);
        else if (dbMarket) setMarketListings(dbMarket);

        // 7. Загружаем профиль креатора (если есть)
        const { data: creatorProfileDataArr, error: creatorProfileError } = await supabase.from("creator_profiles").select("*").eq("user_id", currentUser.id).limit(1);
        if (creatorProfileError) console.error("Ошибка профиля креатора:", creatorProfileError);
        else setCreatorProfile(creatorProfileDataArr?.[0] || null);

        // 8. Для админки грузим все заявки
        const { data: allProfiles, error: allProfilesError } = await supabase.from("creator_profiles").select("*").order('created_at', { ascending: false });
        if (allProfilesError) console.error("Ошибка загрузки заявок:", allProfilesError);
        else setCreatorProfiles(allProfiles);

        // 9. Загружаем предложенные кибики
        const { data: dbPendingKibiks } = await supabase.from("pending_kibiks").select("*");
        if (dbPendingKibiks) setPendingKibiks(dbPendingKibiks);

      } catch (err) {
        setAppError(`Ошибка БД: ${err.message || String(err)}`);
        console.error("Критическая ошибка Supabase:", err);
      }
    };

    initApp();
  }, []);

  const handleTaskProgress = async (userId: string, taskKey: keyof typeof TASKS_CONFIG) => {
    let profile: CreatorProfile | null = creatorProfiles.find(p => p.user_id === userId) || (creatorProfile?.user_id === userId ? creatorProfile : null);

    if (!profile) {
        const { data } = await supabase.from('creator_profiles').select('*').eq('user_id', userId).single();
        profile = data;
    }

    if (!profile || profile.status !== 'approved') return;

    const task = TASKS_CONFIG[taskKey];
    if (!task) return;

    const currentProgress = profile.task_progress?.[taskKey] || 0;
    if (currentProgress >= task.goal) return; // Already completed

    const newProgress = currentProgress + 1;
    let newOminicoins = profile.ominicoins;
    const taskProgressUpdate = { ...profile.task_progress, [taskKey]: newProgress };
    let newCompletedTasks = profile.completed_tasks_count || 0;
    let newCreatorLevel = profile.creator_level;

    if (newProgress >= task.goal) {
        newOminicoins += task.reward;
        newCompletedTasks += 1;

        if (newCompletedTasks >= 50 && newCreatorLevel !== 'super') {
            newCreatorLevel = 'super';
        } else if (newCompletedTasks >= 5 && newCreatorLevel === 'creator') {
            newCreatorLevel = 'verified';
        }
    }

    const updateFn = (p: CreatorProfile) => ({ ...p, ominicoins: newOminicoins, task_progress: taskProgressUpdate, completed_tasks_count: newCompletedTasks, creator_level: newCreatorLevel });

    if (profile.id === creatorProfile?.id) {
        setCreatorProfile(prev => prev ? updateFn(prev) : null);
    }
    setCreatorProfiles(prev => prev.map(p => p.id === profile.id ? updateFn(p) : p));

    await supabase.from('creator_profiles').update({ ominicoins: newOminicoins, task_progress: taskProgressUpdate, completed_tasks_count: newCompletedTasks, creator_level: newCreatorLevel }).eq('id', profile.id);
  };

  const addGlobalKibik = (code: string, kibik: Omit<InventoryItem, "id" | "addedAt">) => {
    setGlobalKibiks((prev) => ({ ...prev, [code.toUpperCase()]: kibik }));
    // Отправляем новый кибик в базу данных
    supabase.from("kibiks").insert({
      code: code.toUpperCase(),
      name: kibik.name,
      rarity: kibik.rarity,
      emoji: kibik.emoji
    }).then(({ error }) => { 
      if (error) {
        console.error("Ошибка сохранения кибика:", error);
        setAppError(`Ошибка создания кода: ${error.message}`);
      }
    }).catch(err => setAppError(`Сбой сети: ${err.message || String(err)}`));

    // Handle task progress
    if (creatorProfile && creatorProfile.status === 'approved') {
      handleTaskProgress(creatorProfile.user_id, 'CREATE_1_CODE');
    }
  };

  const removeGlobalKibik = (code: string) => {
    setGlobalKibiks((prev) => {
      const newState = { ...prev };
      delete newState[code.toUpperCase()];
      return newState;
    });
    // Удаляем кибик из базы (чтобы он был одноразовым для всех)
    supabase.from("kibiks").delete().eq("code", code.toUpperCase())
      .then(({ error }) => { if (error) console.error(error); })
      .catch(console.error);
  };

  const updateUserRole = (userId: string, newRole: Role) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    // Отправляем новую роль в базу Supabase
    supabase.from("users").update({ role: newRole }).eq("id", userId).then(({ error }) => {
      if (error) console.error("Ошибка обновления роли:", error);
    });
  };

  const banUser = (userId: string, until: Date, reason: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, bannedUntil: until, banReason: reason } : u))
    );
    // Отправляем информацию о бане в базу Supabase
    supabase.from("users").update({ bannedUntil: until, banReason: reason }).eq("id", userId).then(({ error }) => {
      if (error) console.error("Ошибка выдачи бана:", error);
    });
  };

  const unbanUser = (userId: string) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, bannedUntil: null as any, banReason: undefined } : u)));
    supabase.from("users").update({ bannedUntil: null, banReason: null }).eq("id", userId).then();
  };

  const handleCheatBan = (userId: string) => {
    setUsers((prev) => {
      const user = prev.find(u => u.id === userId);
      if (!user) return prev;
      const count = user.banCount || 0;
      const until = new Date();
      if (count === 0) until.setDate(until.getDate() + 30); // Первый раз 30 дней
      else until.setFullYear(until.getFullYear() + 100); // Навсегда
      
      supabase.from("users").update({ bannedUntil: until, banReason: "Использование автокликера" }).eq("id", userId).then();
      return prev.map(u => u.id === userId ? { ...u, bannedUntil: until, banReason: "Автокликер", banCount: count + 1 } : u);
    });
  };

  const toggleUserMaintenance = (userId: string, show: boolean) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, showMaintenance: show } : u));
    supabase.from("users").update({ showMaintenance: show }).eq("id", userId).then();
  };

  const toggleUserTrust = (userId: string, untrusted: boolean) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, untrusted } : u));
    supabase.from("users").update({ untrusted }).eq("id", userId).then();
  };

  const requestLoginCode = async (username: string, requireAdmin = false) => {
    const formatted = username.startsWith("@") ? username.toLowerCase() : `@${username.toLowerCase()}`;
    const user = users.find(u => u.username?.toLowerCase() === formatted);
    if (!user) { alert("Пользователь не найден в базе!"); return false; }
    if (requireAdmin && user.role !== "admin" && user.role !== "creator") { alert("У вас нет прав доступа!"); return false; }
    
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    console.log("🔑 СЕКРЕТНЫЙ КОД (для разработчика, если не работает база):", code);
    const { error } = await supabase.from("users").update({ loginCode: code }).eq("id", user.id);
    if (error) { alert("Ошибка при отправке кода. Добавьте колонку loginCode в БД!"); return false; }
      
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, loginCode: code } : u));
    return true;
  };

  const verifyLoginCode = (username: string, code: string) => {
    const formatted = username.startsWith("@") ? username.toLowerCase() : `@${username.toLowerCase()}`;
    const user = users.find(u => u.username?.toLowerCase() === formatted);
    if (!user || user.loginCode !== code) { alert("Неверный код!"); return false; }
    
    supabase.from("users").update({ loginCode: null }).eq("id", user.id).then();
    
    setTgUser({ id: parseInt(user.id) || 12345, first_name: user.name, username: user.username.replace("@", "") });
    setRole(user.role as Role);
    return true;
  };

  const clearLoginCode = () => {
    const currentId = tgUser ? tgUser.id.toString() : "12345";
    supabase.from("users").update({ loginCode: null }).eq("id", currentId).then();
    setUsers(prev => prev.map(u => u.id === currentId ? { ...u, loginCode: null } : u));
  };

  const editUserSave = (userId: string, crystals: number, clickPower: number, passcoins?: number) => {
    setUsers((prev) => {
      const user = prev.find(u => u.id === userId);
      if (!user) return prev;
      
      const updateData: any = { crystals, clickPower };
      if (passcoins !== undefined) updateData.passcoins = passcoins;
      supabase.from("users").update(updateData).eq("id", userId)
        .then(({ error }) => {
          if (error) {
            console.error("Ошибка обновления сохранения:", error);
            setAppError(`Ошибка: ${error.message}`);
          }
        }).catch(err => setAppError(`Сбой сети: ${err.message || String(err)}`));

      return prev.map((u) => 
        u.id === userId ? { ...u, crystals, clickPower, passcoins: passcoins !== undefined ? passcoins : u.passcoins } : u
      );
    });
  };

  const syncClicker = (userId: string, crystals: number, clickPower: number) => {
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, crystals, clickPower } : u));
    supabase.from("users").update({ crystals, clickPower }).eq("id", userId).then(({ error }) => {
      if (error) console.error("Ошибка сохранения кликера:", error);
    });
  };

  const addKibikToUser = (userId: string, item: InventoryItem) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const newInventory = [...(user.inventory || []), item];
    const newKibiks = newInventory.length;
    const newLevel = Math.max(1, Math.floor(newKibiks / 3) + 1);

    // 1. Быстро обновляем интерфейс
    setUsers((prev) => prev.map((u) => 
      u.id === userId ? { ...u, inventory: newInventory, kibiks: newKibiks, level: newLevel } : u
    ));

    // 2. Отправляем в БД (исправлен баг "side-effect inside setState")
    supabase.from("users").update({ inventory: newInventory, kibiks: newKibiks, level: newLevel }).eq("id", userId)
      .then(({ error }) => {
        if (error) {
          console.error("Ошибка обновления инвентаря:", error);
          setAppError(`Ошибка инвентаря: ${error.message}`);
        }
      }).catch(err => setAppError(`Сбой сети инвентаря: ${err.message || String(err)}`));
  };

  const transferKibik = (senderId: string, receiverId: string, kibikId: string) => {
    setUsers((prev) => {
      const sender = prev.find(u => u.id === senderId);
      const receiver = prev.find(u => u.id === receiverId);
      if (!sender || !receiver) return prev;
      
      const kibik = sender.inventory?.find(i => i.id === kibikId);
      if (!kibik) return prev;

      const newSenderInv = sender.inventory!.filter(i => i.id !== kibikId);
      const newReceiverInv = [...(receiver.inventory || []), { ...kibik, addedAt: new Date() }];

      const sKibiks = newSenderInv.length;
      const rKibiks = newReceiverInv.length;
      const sLevel = Math.max(1, Math.floor(sKibiks / 3) + 1);
      const rLevel = Math.max(1, Math.floor(rKibiks / 3) + 1);

      supabase.from("users").update({ inventory: newSenderInv, kibiks: sKibiks, level: sLevel }).eq("id", senderId).then();
      supabase.from("users").update({ inventory: newReceiverInv, kibiks: rKibiks, level: rLevel }).eq("id", receiverId).then();

      return prev.map(u => {
        if (u.id === senderId) return { ...u, inventory: newSenderInv, kibiks: sKibiks, level: sLevel };
        if (u.id === receiverId) return { ...u, inventory: newReceiverInv, kibiks: rKibiks, level: rLevel };
        return u;
      });
    });
  };

  const removeKibikFromUser = (userId: string, kibikId: string) => {
    setUsers((prev) => {
      const user = prev.find(u => u.id === userId);
      if (!user) return prev;
      
      const newInventory = (user.inventory || []).filter(i => i.id !== kibikId);
      const newKibiks = newInventory.length;
      const newLevel = Math.max(1, Math.floor(newKibiks / 3) + 1);

      supabase.from("users").update({ inventory: newInventory, kibiks: newKibiks, level: newLevel }).eq("id", userId)
        .then(({ error }) => {
          if (error) {
            console.error("Ошибка удаления инвентаря:", error);
            setAppError(`Ошибка инвентаря: ${error.message}`);
          }
        }).catch(err => setAppError(`Сбой сети инвентаря: ${err.message || String(err)}`));

      return prev.map((u) => 
        u.id === userId ? { ...u, inventory: newInventory, kibiks: newKibiks, level: newLevel } : u
      );
    });
  };

  const createTrade = async (receiverId: string, offer: InventoryItem, request: InventoryItem) => {
    const currentUserId = tgUser ? tgUser.id.toString() : "12345";
    const newTrade = {
      sender_id: currentUserId,
      receiver_id: receiverId,
      offer_item: offer,
      request_item: request,
      status: "pending"
    };
    const { data, error } = await supabase.from("trades").insert(newTrade).select().single();
    if (error) console.error("Ошибка трейда:", error);
    if (data) setTrades(prev => [data, ...prev]);
  };

  const acceptTrade = async (tradeId: string) => {
    const trade = trades.find(t => t.id === tradeId);
    if (!trade) return;
    const senderId = trade.sender_id;
    const receiverId = trade.receiver_id;
    const sender = users.find(u => u.id === senderId);
    const receiver = users.find(u => u.id === receiverId);
    if (!sender || !receiver) return;

    const senderInv = sender.inventory?.filter(i => i.id !== trade.offer_item.id) || [];
    senderInv.push({ ...trade.request_item, addedAt: new Date() });
    const receiverInv = receiver.inventory?.filter(i => i.id !== trade.request_item.id) || [];
    receiverInv.push({ ...trade.offer_item, addedAt: new Date() });

    const sKibiks = senderInv.length;
    const rKibiks = receiverInv.length;
    await supabase.from("users").update({ inventory: senderInv, kibiks: sKibiks, level: Math.max(1, Math.floor(sKibiks / 3) + 1) }).eq("id", senderId);
    await supabase.from("users").update({ inventory: receiverInv, kibiks: rKibiks, level: Math.max(1, Math.floor(rKibiks / 3) + 1) }).eq("id", receiverId);
    await supabase.from("trades").update({ status: "accepted" }).eq("id", tradeId);

    setTrades(prev => prev.map(t => t.id === tradeId ? { ...t, status: "accepted" } : t));
    setUsers(prev => prev.map(u => {
      if (u.id === senderId) return { ...u, inventory: senderInv, kibiks: sKibiks };
      if (u.id === receiverId) return { ...u, inventory: receiverInv, kibiks: rKibiks };
      return u;
    }));
  };

  const declineTrade = async (tradeId: string) => {
    await supabase.from("trades").update({ status: "declined" }).eq("id", tradeId);
    setTrades(prev => prev.map(t => t.id === tradeId ? { ...t, status: "declined" } : t));
  };

  const sellKibik = async (userId: string, kibikId: string, price: number) => {
    if (price <= 0 || price > 10000000) return;
    const user = users.find(u => u.id === userId);
    if (!user) return;
    const kibik = user.inventory?.find(i => i.id === kibikId);
    if (!kibik) return;

    const newInv = user.inventory!.filter(i => i.id !== kibikId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, inventory: newInv, kibiks: newInv.length } : u));
    
    await supabase.from("users").update({ inventory: newInv, kibiks: newInv.length }).eq("id", userId);
    await supabase.from("market").insert({ seller_id: userId, item: kibik, price });

    // Handle task progress
    if (creatorProfile && creatorProfile.user_id === userId && creatorProfile.status === 'approved') {
      handleTaskProgress(userId, 'LIST_5_KIBIKS');
    }
  };

  const buyKibik = async (buyerId: string, listingId: string) => {
    const listing = marketListings.find(l => l.id === listingId);
    if (!listing) return;
    const buyer = users.find(u => u.id === buyerId);
    if (!buyer || (buyer.crystals || 0) < listing.price) {
      setAppError("Недостаточно кристаллов!");
      setTimeout(() => setAppError(null), 2000);
      return;
    }

    const { data: buyerCreatorProfile } = await supabase.from("creator_profiles").select("status").eq("user_id", buyerId).single();
    const isCreator = buyerCreatorProfile?.status === 'approved';

    const seller = users.find(u => u.id === listing.seller_id);
    let sellerEarn = listing.price;
    
    // Умная комиссия
    if (seller) {
      const { data: sellerProfile } = await supabase.from("creator_profiles").select("active_subscription").eq("user_id", seller.id).maybeSingle();
      let comm = 30; // Базовая комиссия 30%
      if (sellerProfile?.active_subscription === 'Cores Basic') comm = 20;
      if (sellerProfile?.active_subscription === 'Cores Gold') comm = 10;
      if (sellerProfile?.active_subscription === 'Cores +') comm = 0;
      sellerEarn = Math.floor(listing.price * ((100 - comm) / 100));
    }

    const buyerCrystals = isCreator ? 0 : (buyer.crystals || 0) - listing.price;
    const buyerClickPower = isCreator ? 1 : buyer.clickPower || 1;
    const buyerInv = [...(buyer.inventory || []), { ...listing.item, addedAt: new Date() }];
    
    setUsers(prev => prev.map(u => {
      if (u.id === buyerId) return { ...u, crystals: buyerCrystals, clickPower: buyerClickPower, inventory: buyerInv, kibiks: buyerInv.length };
      if (seller && u.id === seller.id) return { ...u, crystals: (u.crystals || 0) + sellerEarn };
      return u;
    }));
    
    await supabase.from("users").update({ crystals: buyerCrystals, clickPower: buyerClickPower, inventory: buyerInv, kibiks: buyerInv.length }).eq("id", buyerId);
    if (seller) {
      await supabase.from("users").update({ crystals: (seller.crystals || 0) + sellerEarn }).eq("id", seller.id);
      handleTaskProgress(seller.id, 'SELL_1_KIBIK');
    }
    await supabase.from("market").delete().eq("id", listingId);
  };

  const cancelListing = async (sellerId: string, listingId: string) => {
    const listing = marketListings.find(l => l.id === listingId);
    if (!listing || listing.seller_id !== sellerId) return;
    const seller = users.find(u => u.id === sellerId);
    if (!seller) return;
    
    const newInv = [...(seller.inventory || []), listing.item];
    setUsers(prev => prev.map(u => u.id === sellerId ? { ...u, inventory: newInv, kibiks: newInv.length } : u));
    await supabase.from("users").update({ inventory: newInv, kibiks: newInv.length }).eq("id", sellerId);
    await supabase.from("market").delete().eq("id", listingId);
  };

  const applyForCreator = async (profileData: any, initialKibik: any) => {
    const { data, error } = await supabase.from("creator_profiles").insert(profileData).select().single();
    if (error) {
      setAppError(error.message);
      console.error(error);
    } else if (data) {
      setCreatorProfile(data);
      submitKibikForReview({ ...initialKibik, creator_id: data.user_id });
    }
  };

  const updateCreatorStatus = async (profileId: string, status: CreatorProfile['status']) => {
    setCreatorProfiles(prev => prev.map(p => p.id === profileId ? { ...p, status } : p));
    const { error } = await supabase.from("creator_profiles").update({ status }).eq("id", profileId);
    if (error) {
      setAppError(error.message);
      console.error(error);
    }

    const profile = creatorProfiles.find(p => p.id === profileId);
    if (profile) {
      if (status === 'approved') updateUserRole(profile.user_id, "creator");
      else if (status === 'rejected' || status === 'untrusted') updateUserRole(profile.user_id, "user");
    }
  };

  const purchaseSubscription = async (sub: { name: string, omin: number, passcoin: number }, method: 'omin' | 'passcoin') => {
    if (!tgUser) return false;
    const userId = tgUser.id.toString();
    const currentUser = users.find(u => u.id === userId);

    let newOminicoins = creatorProfile?.ominicoins || 0;
    let newPasscoins = currentUser?.passcoins || 0;

    if (method === 'omin') {
      if (!creatorProfile) {
        setAppError("Только креаторы могут платить Ominicoins!");
        setTimeout(() => setAppError(null), 3000);
        return false;
      }
      if (newOminicoins < sub.omin) { setAppError("Недостаточно Ominicoins!"); setTimeout(() => setAppError(null), 3000); return false; }
      newOminicoins -= sub.omin;
    } else {
      if (newPasscoins < sub.passcoin) {
        setAppError("Недостаточно Passcoins!");
        setTimeout(() => setAppError(null), 3000);
        return false;
      }
      newPasscoins -= sub.passcoin;
    }

    let newCrystals = 0;
    if (sub.name === 'Cores Basic') newCrystals = 20000;
    if (sub.name === 'Cores Gold') newCrystals = 60000;
    if (sub.name === 'Cores +') newCrystals = 90000;

    editUserSave(userId, newCrystals, 1, newPasscoins);

    if (!creatorProfile) {
      const newProfile: any = {
          user_id: userId,
          tg_username: currentUser?.username || "",
          display_name: currentUser?.name || "",
          status: 'pending',
          creator_level: 'creator',
          ominicoins: newOminicoins,
          active_subscription: sub.name,
          completed_tasks_count: 0
      };
      const { data, error } = await supabase.from("creator_profiles").insert(newProfile).select().single();
      if (error) { setAppError(`Ошибка покупки: ${error.message}`); return false; }
      if (data) setCreatorProfile(data);
    } else {
      setCreatorProfile(prev => prev ? { ...prev, ominicoins: newOminicoins, active_subscription: sub.name } : null);
      const { error } = await supabase.from("creator_profiles").update({
          ominicoins: newOminicoins,
          active_subscription: sub.name
      }).eq("id", creatorProfile.id);
      if (error) { setAppError(`Ошибка покупки: ${error.message}`); return false; }
    }
    return true;
  };

  const grantSubscription = async (subName: string) => {
    if (!tgUser) return false;
    const userId = tgUser.id.toString();
    const currentUser = users.find(u => u.id === userId);
    
    let newCrystals = 0;
    if (subName === 'Cores Basic') newCrystals = 20000;
    if (subName === 'Cores Gold') newCrystals = 60000;
    if (subName === 'Cores +') newCrystals = 90000;

    editUserSave(userId, newCrystals, 1, users.find(u => u.id === userId)?.passcoins);
    setCreatorProfile(prev => prev ? { ...prev, active_subscription: subName } : null);

    const { error } = await supabase.from("creator_profiles").update({ active_subscription: subName }).eq("id", creatorProfile.id);
    if (error) { setAppError(`Ошибка: ${error.message}`); return false; }
    
    return true;
  };

  const editCreatorProfile = (profileId: string, data: { ominicoins: number, creator_level: CreatorProfile['creator_level'], active_subscription: string | null }) => {
    setCreatorProfiles(prev => prev.map(p => p.id === profileId ? { ...p, ...data } : p));
    const { error } = supabase.from("creator_profiles").update(data).eq("id", profileId);
    if (error) {
      setAppError(error.message);
      console.error(error);
    }
  };

  const editMyCreatorProfile = (data: { display_name: string, avatar_url: string | null }) => {
    if (!creatorProfile) return;

    setCreatorProfile(prev => prev ? { ...prev, ...data } : null);
    setCreatorProfiles(prev => prev.map(p => p.id === creatorProfile.id ? { ...p, ...data } : p));

    const { error } = supabase.from("creator_profiles").update(data).eq("id", creatorProfile.id);
    if (error) {
      setAppError(error.message);
      console.error(error);
    }
  };

  const convertPasscoins = () => {
    const userId = tgUser?.id.toString();
    if (!userId) return;
    const user = users.find(u => u.id === userId);
    if (!user || (user.crystals || 0) < 100000) { setAppError("Недостаточно кристаллов (нужно 100,000)!"); setTimeout(() => setAppError(null), 3000); return; }
    const newCrystals = user.crystals! - 100000;
    const newPasscoins = (user.passcoins || 0) + 10;
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, crystals: newCrystals, passcoins: newPasscoins } : u));
    supabase.from("users").update({ crystals: newCrystals, passcoins: newPasscoins }).eq("id", userId).then();
  };

  const claimDailyBonus = async (rewardType: 'omin' | 'crystals') => {
    if (!creatorProfile || !tgUser) return;
    const userId = tgUser.id.toString();
    
    const now = new Date();
    setCreatorProfile(prev => prev ? { ...prev, last_daily_bonus: now.toISOString(), ominicoins: rewardType === 'omin' ? prev.ominicoins + 10 : prev.ominicoins } : null);
    
    await supabase.from("creator_profiles").update({ 
      last_daily_bonus: now.toISOString(), 
      ominicoins: rewardType === 'omin' ? creatorProfile.ominicoins + 10 : creatorProfile.ominicoins 
    }).eq("id", creatorProfile.id);

    if (rewardType === 'crystals') {
      const u = users.find(u => u.id === userId);
      const newCrystals = (u?.crystals || 0) + 5000;
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, crystals: newCrystals } : u));
      await supabase.from("users").update({ crystals: newCrystals }).eq("id", userId);
    }
  };

  const buyAutoClicker = async (level: 1 | 2) => {
    const userId = tgUser?.id.toString();
    const user = users.find(u => u.id === userId);
    if (!user || !userId) return;
    
    const cost = level === 1 ? 25000 : 50000;
    if ((user.crystals || 0) < cost) { setAppError("Недостаточно кристаллов!"); setTimeout(() => setAppError(null), 3000); return; }
    
    const ac = user.auto_clickers || { level1: 0, level2: 0 };
    const newAc = { ...ac, [`level${level}`]: ac[`level${level}` as keyof typeof ac] + 1 };
    const newCrystals = user.crystals! - cost;

    setUsers(prev => prev.map(u => u.id === userId ? { ...u, crystals: newCrystals, auto_clickers: newAc } : u));
    await supabase.from("users").update({ crystals: newCrystals, auto_clickers: newAc }).eq("id", userId);
  };

  const submitKibikForReview = async (kibik: Omit<PendingKibik, "id" | "created_at">) => {
    if (creatorProfile) {
      await supabase.from("creator_profiles").update({ last_kibik_creation_date: new Date().toISOString() }).eq("id", creatorProfile.id);
      setCreatorProfile(prev => prev ? { ...prev, last_kibik_creation_date: new Date().toISOString() } : null);
    }
    
    const { data, error } = await supabase.from("pending_kibiks").insert(kibik).select().single();
    if (data) setPendingKibiks(prev => [data, ...prev]);
    if (error) setAppError(`Ошибка отправки на модерацию: ${error.message}`);
  };

  const approvePendingKibik = async (kibik: PendingKibik) => {
    addGlobalKibik(kibik.code, { code: kibik.code, name: kibik.name, rarity: kibik.rarity, emoji: kibik.emoji });
    rejectPendingKibik(kibik.id);
  };

  const rejectPendingKibik = async (id: string) => {
    setPendingKibiks(prev => prev.filter(p => p.id !== id));
    await supabase.from("pending_kibiks").delete().eq("id", id);
  };

  // Эффект для прослушивания базы данных в реальном времени для всех пользователей
  useEffect(() => {
    const channel = supabase.channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, (payload) => {
        const currentId = tgUser?.id.toString();
        setUsers((prev) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const u = payload.new as any;
            if (u.bannedUntil) u.bannedUntil = new Date(u.bannedUntil);
            if (u.inventory) {
              u.inventory = u.inventory.map((item: any) => ({ ...item, addedAt: new Date(item.addedAt) }));
            }
            const exists = prev.find((p) => p.id === u.id);
            // Обновляем роль, если изменилась наша
            if (u.id === currentId && u.role !== role) {
              setRole(u.role);
            }
            if (exists) return prev.map((p) => (p.id === u.id ? { ...p, ...u } : p));
            return [u, ...prev];
          }
          if (payload.eventType === 'DELETE') return prev.filter((p) => p.id !== payload.old.id);
          return prev;
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kibiks' }, (payload) => {
        setGlobalKibiks((prev) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            return { ...prev, [payload.new.code]: payload.new };
          }
          if (payload.eventType === 'DELETE') {
            const next = { ...prev };
            delete next[payload.old.code];
            return next;
          }
          return prev;
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trades' }, (payload) => {
        setTrades((prev) => {
          if (payload.eventType === 'INSERT') {
            if (!prev.find((t) => t.id === payload.new.id)) return [payload.new as any, ...prev];
            return prev;
          }
          if (payload.eventType === 'UPDATE') return prev.map((t) => (t.id === payload.new.id ? (payload.new as any) : t));
          if (payload.eventType === 'DELETE') return prev.filter((t) => t.id !== payload.old.id);
          return prev;
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'market' }, (payload) => {
        setMarketListings((prev) => {
          if (payload.eventType === 'INSERT') return [payload.new as any, ...prev];
          if (payload.eventType === 'DELETE') return prev.filter((t) => t.id !== payload.old.id);
          if (payload.eventType === 'UPDATE') return prev.map((t) => (t.id === payload.new.id ? (payload.new as any) : t));
          return prev;
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'creator_profiles' }, (payload) => {
        const currentUserId = tgUser?.id.toString();
        // Обновляем наш профиль
        if ((payload.new as CreatorProfile)?.user_id === currentUserId) {
          setCreatorProfile(payload.new as CreatorProfile);
        }
        // Обновляем список для админки
        setCreatorProfiles(prev => {
          if (payload.eventType === 'INSERT') return [payload.new as CreatorProfile, ...prev];
          if (payload.eventType === 'UPDATE') return prev.map(p => p.id === payload.new.id ? payload.new as CreatorProfile : p);
          if (payload.eventType === 'DELETE') return prev.filter(p => p.id !== payload.old.id);
          return prev;
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pending_kibiks' }, (payload) => {
        setPendingKibiks(prev => {
          if (payload.eventType === 'INSERT') return [payload.new as PendingKibik, ...prev];
          if (payload.eventType === 'DELETE') return prev.filter(p => p.id !== payload.old.id);
          return prev;
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [tgUser, role]);

  return (
    <AppContext.Provider value={{ tgUser, role, users, globalKibiks, setUsers, addGlobalKibik, removeGlobalKibik, updateUserRole, banUser, unbanUser, handleCheatBan, toggleUserMaintenance, toggleUserTrust, requestLoginCode, verifyLoginCode, clearLoginCode, editUserSave, addKibikToUser, transferKibik, removeKibikFromUser, appError, trades, marketListings, sellKibik, buyKibik, cancelListing, syncClicker, createTrade, acceptTrade, declineTrade, creatorProfile, applyForCreator, creatorProfiles, updateCreatorStatus, purchaseSubscription, grantSubscription, editCreatorProfile, editMyCreatorProfile, pendingKibiks, submitKibikForReview, approvePendingKibik, rejectPendingKibik, convertPasscoins, claimDailyBonus, buyAutoClicker }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
