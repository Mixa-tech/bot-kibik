import { createContext, useContext, useEffect, useState } from "react";
import type { InventoryItem } from "./components/HomePage";
import { KIBIK_CODES as MOCK_KIBIK_CODES, MOCK_USERS, type MockUser } from "./data/mockData";
import { supabase } from "./supabaseClient";

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export type Role = "admin" | "creator" | "user";

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
  addKibikToUser: (userId: string, item: InventoryItem) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [tgUser, setTgUser] = useState<TelegramUser | null>(null);
  const [role, setRole] = useState<Role>("user");
  const [users, setUsers] = useState<MockUser[]>(MOCK_USERS);
  const [globalKibiks, setGlobalKibiks] = useState(MOCK_KIBIK_CODES);

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
          inventory: [],
        };
      } else {
        setTgUser({ id: 12345, first_name: "Local", username: "Mixazx" });
        setRole("admin");
        currentUser = {
          id: "12345",
          name: "Local",
          username: "@Mixazx",
          avatar: "LO",
          status: "online",
          kibiks: 0,
          level: 1,
          bio: "Локальный тест",
          topEmoji: "🧊",
          role: "admin",
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

        // 3. Добавляем в базу, если тебя там нет
        const meInDb = merged.find((u) => u.id === currentUser.id);
        if (!meInDb) {
          const { error: insertError } = await supabase.from("users").insert(currentUser);
          if (insertError) {
            console.error("Ошибка при сохранении в Supabase:", insertError);
          } else {
            merged = [currentUser, ...merged];
          }
        }

        setUsers(merged);
      } catch (err) {
        console.error("Критическая ошибка Supabase:", err);
      }
    };

    initApp();
  }, []);

  const addGlobalKibik = (code: string, kibik: Omit<InventoryItem, "id" | "addedAt">) => {
    setGlobalKibiks((prev) => ({ ...prev, [code.toUpperCase()]: kibik }));
  };

  const removeGlobalKibik = (code: string) => {
    setGlobalKibiks((prev) => {
      const newState = { ...prev };
      delete newState[code.toUpperCase()];
      return newState;
    });
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

  const addKibikToUser = (userId: string, item: InventoryItem) => {
    setUsers((prev) => {
      const newUsers = prev.map((u) => {
        if (u.id === userId) {
          const newInventory = [...(u.inventory || []), item];
          const newKibiks = newInventory.length;
          const newLevel = Math.max(1, Math.floor(newKibiks / 3) + 1);

          // Отправляем обновление в базу данных Supabase
          supabase.from("users").update({ inventory: newInventory, kibiks: newKibiks, level: newLevel }).eq("id", userId)
            .then(({ error }) => {
              if (error) console.error("Ошибка обновления инвентаря:", error);
            });

          return { ...u, inventory: newInventory, kibiks: newKibiks, level: newLevel };
        }
        return u;
      });
      return newUsers;
    });
  };

  return (
    <AppContext.Provider value={{ tgUser, role, users, globalKibiks, setUsers, addGlobalKibik, removeGlobalKibik, updateUserRole, banUser, addKibikToUser }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
