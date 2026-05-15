import { createContext, useContext, useEffect, useState } from "react";
import type { InventoryItem } from "./components/HomePage";
import { KIBIK_CODES as MOCK_KIBIK_CODES, MOCK_USERS, type MockUser } from "./data/mockData";

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
  updateUserRole: (userId: string, newRole: Role) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [tgUser, setTgUser] = useState<TelegramUser | null>(null);
  const [role, setRole] = useState<Role>("user");
  const [users, setUsers] = useState<MockUser[]>(MOCK_USERS);
  const [globalKibiks, setGlobalKibiks] = useState(MOCK_KIBIK_CODES);

  useEffect(() => {
    // Initialize Telegram Web App
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      const user = tg.initDataUnsafe?.user;
      if (user) {
        setTgUser(user);
        // "пырвый админ Mixazx"
        if (user.username === "Mixazx" || user.username === "mixazx") {
          setRole("admin");
        } else {
          // Check if they are in the mock users list with a specific role, for now just default to user.
          setRole("user");
        }
        
        // Add current TG user to the users list if not there
        setUsers((prev) => {
          if (!prev.find(u => u.username === `@${user.username}`)) {
            return [{
              id: user.id.toString(),
              name: `${user.first_name} ${user.last_name || ""}`.trim(),
              username: `@${user.username}`,
              avatar: user.first_name.slice(0, 2).toUpperCase(),
              status: "online",
              kibiks: 0,
              level: 1,
              bio: "",
              topEmoji: "🧊",
              role: user.username?.toLowerCase() === "mixazx" ? "admin" : "user"
            } as any, ...prev];
          }
          return prev;
        });
      }
    } else {
      // Fallback for local testing if not in Telegram
      setTgUser({
        id: 12345,
        first_name: "Local",
        username: "Mixazx",
      });
      setRole("admin");
    }
  }, []);

  const addGlobalKibik = (code: string, kibik: Omit<InventoryItem, "id" | "addedAt">) => {
    setGlobalKibiks((prev) => ({ ...prev, [code.toUpperCase()]: kibik }));
  };

  const updateUserRole = (userId: string, newRole: Role) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  };

  return (
    <AppContext.Provider value={{ tgUser, role, users, globalKibiks, setUsers, addGlobalKibik, updateUserRole }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
