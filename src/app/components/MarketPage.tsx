import { motion, AnimatePresence } from "motion/react";
import { Store, User } from "lucide-react";
import { useTheme, glass, tc } from "./ThemeContext";
import { useApp } from "../AppContext";

export function MarketPage() {
  const { isDark } = useTheme();
  const c = tc(isDark);
  const { tgUser, users, marketListings, buyKibik, cancelListing } = useApp();

  const myId = tgUser ? tgUser.id.toString() : "12345";
  const currentUser = users.find((u) => u.id === myId);
  const myCrystals = currentUser?.crystals || 0;

  return (
    <div className="flex flex-col gap-4 p-4 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between pt-2 mb-2">
        <div>
          <h1 style={{ color: c.primary }} className="text-xl tracking-tight flex items-center gap-2">
            <Store size={22} className="text-blue-500" /> Биржа
          </h1>
          <p className="text-xs mt-0.5" style={{ color: c.muted }}>{marketListings.length} лотов на продаже</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={glass(isDark, 0.08)}>
          <span className="text-xs font-bold" style={{ color: c.primary }}>{myCrystals.toLocaleString()}</span>
          <span className="text-[10px]">💎</span>
        </div>
      </div>

      {/* Market Grid */}
      {marketListings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Store size={40} style={{ color: c.muted, opacity: 0.3 }} />
          <p className="text-sm text-center" style={{ color: c.muted }}>Рынок пуст.<br/>Стань первым, кто выставит кибик на продажу!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <AnimatePresence>
            {marketListings.map((listing) => {
              const isMine = listing.seller_id === myId;
              const seller = users.find(u => u.id === listing.seller_id);
              
              return (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden"
                  style={glass(isDark, 0.06)}
                >
                  {/^(https?|data|blob):/.test(listing.item.emoji) ? (
                    <img src={listing.item.emoji} alt={listing.item.name} className="w-14 h-14 object-cover rounded-xl shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center text-4xl bg-black/10 shrink-0">{listing.item.emoji}</div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate" style={{ color: c.primary }}>{listing.item.name}</div>
                    <div className="flex items-center gap-1 text-[10px] mt-1" style={{ color: c.muted }}>
                      <User size={10} /> {seller?.name || "Неизвестный"}
                    </div>
                    <div className="font-bold mt-1 text-blue-400 text-sm">{listing.price.toLocaleString()} 💎</div>
                  </div>

                  {isMine ? (
                    <button onClick={() => cancelListing(myId, listing.id)} className="shrink-0 px-3 py-2 rounded-xl text-xs font-semibold bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">Снять</button>
                  ) : (
                    <button disabled={myCrystals < listing.price} onClick={() => buyKibik(myId, listing.id)} className="shrink-0 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-500 disabled:opacity-50 hover:bg-blue-600 transition-colors">Купить</button>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}