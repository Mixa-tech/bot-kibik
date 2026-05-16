import type { InventoryItem } from "../components/HomePage";


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
  crystals?: number;
  clickPower?: number;
  banCount?: number;
  loginCode?: string | null;
}

export const MOCK_USERS: MockUser[] = [
];
