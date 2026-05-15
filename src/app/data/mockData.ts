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
}

export const MOCK_USERS: MockUser[] = [
  {
    id: "u1",
    name: "Алексей Громов",
    username: "@gromov_alex",
    avatar: "AG",
    status: "online",
    kibiks: 47,
    level: 12,
    bio: "Коллекционер легендарных кибиков 👑",
    topEmoji: "👑",
    role: "user",
  },
  {
    id: "u2",
    name: "Мария Светлова",
    username: "@msveta",
    avatar: "МС",
    status: "online",
    kibiks: 23,
    level: 7,
    bio: "Ищу редкие кибики, меняю эпики",
    topEmoji: "🔮",
    role: "user",
  },
  {
    id: "u3",
    name: "Денис К.",
    username: "@denk99",
    avatar: "ДК",
    status: "away",
    kibiks: 8,
    level: 3,
    bio: "Новичок, только начинаю",
    topEmoji: "💎",
    role: "user",
  },
  {
    id: "u4",
    name: "Игорь Блок",
    username: "@i_blok",
    avatar: "ИБ",
    status: "offline",
    kibiks: 31,
    level: 9,
    bio: "Продаю/покупаю кибики",
    topEmoji: "💠",
    role: "user",
  },
  {
    id: "u5",
    name: "Кристина П.",
    username: "@kristiiiina",
    avatar: "КП",
    status: "online",
    kibiks: 64,
    level: 18,
    bio: "Топ коллектор сезона 🏆",
    topEmoji: "✨",
    role: "user",
  },
];
