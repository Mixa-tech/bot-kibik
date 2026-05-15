import type { InventoryItem } from "../components/HomePage";

// ─── Kibik codes ──────────────────────────────────────────────────────────────

export const KIBIK_CODES: Record<string, Omit<InventoryItem, "id" | "addedAt">> = {
  "KIBIK2024": { code: "KIBIK2024", name: "Кибик Стандарт",  rarity: "common",    emoji: "📦" },
  "CUBE001":   { code: "CUBE001",   name: "Кибик Базовый",   rarity: "common",    emoji: "🧊" },
  "RARE2025":  { code: "RARE2025",  name: "Кибик Рейр",      rarity: "rare",      emoji: "💎" },
  "CRYSTAL":   { code: "CRYSTAL",   name: "Кибик Кристалл",  rarity: "rare",      emoji: "💠" },
  "EPIC777":   { code: "EPIC777",   name: "Кибик Эпик",      rarity: "epic",      emoji: "🔮" },
  "DARK777":   { code: "DARK777",   name: "Тёмный Кибик",    rarity: "epic",      emoji: "🖤" },
  "LEGEND":    { code: "LEGEND",    name: "Кибик Легенда",   rarity: "legendary", emoji: "👑" },
  "GOLDEN":    { code: "GOLDEN",    name: "Золотой Кибик",   rarity: "legendary", emoji: "✨" },
};

// ─── Users ────────────────────────────────────────────────────────────────────

export interface MockUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  status: "online" | "offline" | "away";
  kibiks: number;
  level: number;
  bio: string;
  topEmoji: string;
  role?: "admin" | "creator" | "user";
  bannedUntil?: Date | null;
  banReason?: string;
  inventory?: InventoryItem[];
}

export const MOCK_USERS: MockUser[] = [
];
